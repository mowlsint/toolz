/* MOwlSINT White Lightning — minimal read-only MS-CFB / Outlook MSG extractor.
 * Supports ordinary ANSI/Unicode MSG messages and file attachments. Never executes contents.
 * Does not support encrypted/DRM MSG, embedded MSG objects or TNEF winmail.dat.
 */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WLMsg=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const END=0xfffffffc,MAX_SECTORS=100000,MAX_STREAM=50*1024*1024;
function decode(bytes,enc='utf-8'){try{return new TextDecoder(enc).decode(bytes).replace(/\u0000+$/,'');}catch{return new TextDecoder('windows-1252').decode(bytes).replace(/\u0000+$/,'');}}
class CFB {
 constructor(buf){this.bytes=new Uint8Array(buf);this.dv=new DataView(buf);if(this.bytes.length<512||[0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1].some((b,i)=>this.bytes[i]!==b))throw Error('Keine gültige Outlook-MSG/Compound-File-Datei');
 this.sect=2**this.dv.getUint16(30,true);this.miniSect=2**this.dv.getUint16(32,true);if(![512,4096].includes(this.sect)||this.miniSect!==64)throw Error('Nicht unterstützte MSG-Sektorgröße');this.cut=this.dv.getUint32(56,true);
 const fatCount=this.dv.getUint32(44,true),difCount=this.dv.getUint32(72,true),firstDif=this.dv.getUint32(68,true);
 let difat=[];for(let i=0;i<109;i++)difat.push(this.dv.getUint32(76+i*4,true));let di=firstDif;
 for(let i=0;i<difCount&&di<END;i++){let sec=this.sector(di);for(let j=0;j<(this.sect/4)-1;j++)difat.push(new DataView(sec.buffer,sec.byteOffset+j*4,4).getUint32(0,true));di=new DataView(sec.buffer,sec.byteOffset+this.sect-4,4).getUint32(0,true);}
 this.fat=[];for(const id of difat.filter(x=>x<END).slice(0,fatCount)){const sec=this.sector(id),v=new DataView(sec.buffer,sec.byteOffset,sec.byteLength);for(let j=0;j<sec.length;j+=4)this.fat.push(v.getUint32(j,true));}
 const data=this.chain(this.dv.getUint32(48,true),false);this.dirs=[];
 for(let off=0;off+128<=data.length;off+=128){const v=new DataView(data.buffer,data.byteOffset+off,128),nameLen=v.getUint16(64,true);const name=nameLen>=2?decode(data.subarray(off,off+Math.min(64,nameLen-2)),'utf-16le'):'';
 const low=v.getUint32(120,true),high=v.getUint32(124,true),size=high*4294967296+low;
 this.dirs.push({id:off/128,name,type:v.getUint8(66),left:v.getUint32(68,true),right:v.getUint32(72,true),child:v.getUint32(76,true),start:v.getUint32(116,true),size});}
 const mfCount=this.dv.getUint32(64,true),miniBytes=mfCount?this.chain(this.dv.getUint32(60,true),false):new Uint8Array();this.miniFat=[];{const v=new DataView(miniBytes.buffer,miniBytes.byteOffset,miniBytes.byteLength);for(let j=0;j+4<=v.byteLength;j+=4)this.miniFat.push(v.getUint32(j,true));}
 const root=this.dirs[0];this.miniData=root?this.chain(root.start,false).subarray(0,root.size):new Uint8Array();
 }
 sector(id){const pos=(id+1)*this.sect;if(id>=END||pos+this.sect>this.bytes.length)throw Error('MSG: defekter Sektorenverweis');return this.bytes.subarray(pos,pos+this.sect);}
 chain(start,mini){const fat=mini?this.miniFat:this.fat,block=mini?this.miniSect:this.sect,out=[];let total=0,id=start;const seen=new Set();
 while(id<END){if(id>=fat.length||seen.has(id)||seen.size>MAX_SECTORS||total>MAX_STREAM)throw Error('MSG: fehlerhafte oder zu große Sektorkette');seen.add(id);const v=mini?this.miniData.subarray(id*block,(id+1)*block):this.sector(id);out.push(v);total+=v.length;id=fat[id];}
 const b=new Uint8Array(total);let off=0;for(const v of out){b.set(v,off);off+=v.length;}return b;
 }
 read(ent){if(!ent||ent.type!==2)return new Uint8Array();if(!Number.isSafeInteger(ent.size)||ent.size>MAX_STREAM)throw Error('MSG: Stream zu groß');const mini=ent.size<this.cut&&this.miniFat.length>0;return this.chain(ent.start,mini).subarray(0,ent.size);}
 children(storage){const output=[];let iter=0;const found=new Set();const walk=id=>{if(id>=END||!this.dirs[id]||found.has(id)||++iter>20000)return;found.add(id);const e=this.dirs[id];walk(e.left);output.push(e);walk(e.right);};walk(storage.child);return output;}
 property(storage,tag){const ent=this.children(storage).find(e=>e.type===2&&e.name.toUpperCase()==='__SUBSTG1.0_'+tag.toUpperCase());return ent?this.read(ent):null;}
 text(storage,prop){let a=this.property(storage,prop+'001F');if(a)return decode(a,'utf-16le');a=this.property(storage,prop+'001E');return a?decode(a,'windows-1252'):null;}
 timeMap(){const root=this.dirs[0],ent=this.children(root).find(x=>x.name==='__properties_version1.0');if(!ent)return {};const b=this.read(ent),v=new DataView(b.buffer,b.byteOffset,b.byteLength);let out={};for(let i=32;i+16<=b.length;i+=16){const tag=v.getUint32(i,true);if(![0x00390040,0x0e060040,0x30070040].includes(tag))continue;try{const ticks=v.getBigUint64(i+8,true);const ms=Number(ticks/10000n-11644473600000n);const d=new Date(ms);if(Number.isFinite(d.getTime())&&d.getUTCFullYear()>1900&&d.getUTCFullYear()<2200)out[tag.toString(16)]=d.toISOString();}catch{}}
 return {sent:out['390040']||null,received:out['e060040']||null,created:out['30070040']||null};}
}
function parseMSG(buffer){const c=new CFB(buffer),root=c.dirs[0],time=c.timeMap();const files=[];
 for(const storage of c.children(root).filter(e=>e.type===1&&e.name.startsWith('__attach_version1.0_'))){
  const filename=c.text(storage,'3707')||c.text(storage,'3704')||'unbenannter-anhang.bin';const bytes=c.property(storage,'37010102');if(bytes&&bytes.length)files.push({filename,bytes});
  else files.push({filename,unsupported:true});
 }
 return {subject:c.text(root,'0037')||'',body:c.text(root,'1000')||'',sent_at:time.sent,received_at:time.received,attachments:files, warning:!time.sent?'Kein verlässlicher Sendezeitstempel in den MAPI-Eigenschaften':''};
}
return {parseMSG,CFB};
});