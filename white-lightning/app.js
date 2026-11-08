/* MOwlSINT White Lightning browser app: source files only in JS memory. */
(() => {
'use strict';
const C=window.WLCore,M=window.WLMsg,D=window.WLDocument,E=window.WLEdit;const $=id=>document.getElementById(id);const state={items:[],files:0,errors:[],duplicates:0,editUndo:[]};let pdfReady=null;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const size=n=>n>=1048576?(n/1048576).toFixed(1)+' MB':(n/1024).toFixed(1)+' KB';
const basename=n=>String(n||'').split(/[\\/]/).pop();
function note(m,err=false){const el=$('log');el.textContent=(err?'⚠ ':'✓ ')+m;el.classList.toggle('error',err);}
function textDecode(u,encoding='utf-8'){try{return new TextDecoder(encoding,{fatal:true}).decode(u);}catch{return new TextDecoder('windows-1252').decode(u);}}
function decodeQP(t){return t.replace(/=\r?\n/g,'').replace(/(?:=[0-9a-fA-F]{2})+/g,m=>{const bytes=new Uint8Array((m.match(/=[0-9a-fA-F]{2}/g)||[]).map(x=>parseInt(x.slice(1),16)));return textDecode(bytes);});}
function htmlText(t){const raw=String(t||'');const links=[...raw.matchAll(/<a\b[^>]*href\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*>/gi)].map(m=>m[1]);const safe=raw.replace(/<\s*(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi,'').replace(/<\s*(?:br|p|div|li|tr|h\d)\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,' ');const ta=document.createElement('textarea');ta.innerHTML=safe;return (ta.value||'').replace(/\n{3,}/g,'\n\n')+(links.length?'\n'+links.join('\n'):'');}
function parseHeaders(s){const obj={};const head=String(s||'').replace(/\r\n?/g,'\n').split(/\n\n/)[0];let last='';for(const l of head.split('\n')){if(/^\s/.test(l)&&last){obj[last]+=' '+l.trim();continue;}const m=l.match(/^([\w-]+):\s*(.*)$/);if(m){last=m[1].toLowerCase();obj[last]=m[2];}}return obj;}
function mailTimestamp(h){const raw=h.date||'',sent=C.dayFromRFC(raw), local=raw.match(/\b(\d{1,2})\s+(\w+)\s+(\d{4})\b/);let day=null;if(local){const mo={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12}[local[2].slice(0,3).toLowerCase()];if(mo)day=C.isoDay(local[3],mo,local[1]);}return {sent,day:day||null};}
function base64Bytes(s){const raw=atob(String(s).replace(/\s/g,''));const b=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)b[i]=raw.charCodeAt(i);return b;}
function parseEml(raw,filename){const content=String(raw).replace(/\r\n?/g,'\n'),headers=parseHeaders(content),t=mailTimestamp(headers);let body=content.slice(content.indexOf('\n\n')+2),attachments=[];
 const boundary=(headers['content-type']||'').match(/boundary\s*=\s*"?([^";\n]+)/i)?.[1];
 if(boundary){let chunks=body.split('--'+boundary).slice(1).filter(x=>!x.trim().startsWith('--'));let selected=[];
 for(const chunk of chunks){const idx=chunk.indexOf('\n\n');if(idx<0)continue;const ph=parseHeaders(chunk),payload=chunk.slice(idx+2).trim(),mime=(ph['content-type']||'').toLowerCase(),dis=ph['content-disposition']||'';
 const n=(dis.match(/filename\*?\s*=\s*"?([^";\n]+)/i)||mime.match(/name\s*=\s*"?([^";\n]+)/i)||[])[1];let bytes=null,decoded='';if(/base64/i.test(ph['content-transfer-encoding']||'')){try{bytes=base64Bytes(payload);decoded=textDecode(bytes);}catch{decoded='';}}else decoded=/quoted-printable/i.test(ph['content-transfer-encoding']||'')?decodeQP(payload):payload;
 if(n||/attachment/i.test(dis)){if(bytes)attachments.push({filename:basename(n||'anhang.bin'),bytes});else attachments.push({filename:basename(n||'anhang.bin'),unsupported:true});}
 else selected.push({decoded,mime});}
 body=selected.find(x=>/text\/plain/i.test(x.mime))?.decoded||htmlText(selected.find(x=>/text\/html/i.test(x.mime))?.decoded||'');
 }else if(/quoted-printable/i.test(headers['content-transfer-encoding']||''))body=decodeQP(body);else if(/base64/i.test(headers['content-transfer-encoding']||'')){try{body=textDecode(base64Bytes(body));}catch{}}
 if(/text\/html/i.test(headers['content-type']||''))body=htmlText(body);
 return {subject:headers.subject||filename,body,sent_at:t.sent,report_date:t.day,attachments,from:headers.from||null,received_at:null};
}
function untrustedFileWarning(name){if(/\.pdf$/i.test(name))return 'PDF-Seiteninhalt nicht automatisch als einzelne Artikel interpretiert. Bei Spaltenlayout prüfen.';return '';}
function add(item){state.items.push(C.normalizeInput(item));}
function importText(text,filename='Manueller Text',meta={}){
 const ext=filename.split('.').pop().toLowerCase(),format=ext==='md'?'md':'txt';
 const chunks=D.splitText(text,filename,format);
 for(const part of chunks)add({title:part.title,text:part.text,filename,type:meta.type||format,
  source_name:meta.source_name||'',reported_at:meta.reported_at||null,
  reported_raw:meta.reported_raw||'',received_at:meta.received_at||null,
  parent_file:meta.parent_file||null,section:chunks.length>1?`Abschnitt ${part.section}/${chunks.length}`:null,
  extraction_method:part.method, report_date:part.reportDate||meta.report_date||null,
  report_basis:part.reportDate?'Datierter Eintragskopf (Zeitzone ungeklärt)':meta.report_basis||'',
  warnings:[...(meta.warnings||[]),...part.warnings]});
 return chunks.length;
}
async function pdfLibrary(){if(window.pdfjsLib)return window.pdfjsLib;if(pdfReady)return pdfReady;pdfReady=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';script.crossOrigin='anonymous';script.onload=()=>{if(!window.pdfjsLib)return reject(Error('PDF.js nicht geladen'));window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';resolve(window.pdfjsLib);};script.onerror=()=>reject(Error('PDF.js konnte nicht geladen werden (CDN/Netzwerk). Keine Datei wurde hochgeladen.'));document.head.append(script);});return pdfReady;}
async function parsePdf(bytes,filename,meta={}){
 const pdfjs=await pdfLibrary(),task=pdfjs.getDocument({data:bytes.slice(),isEvalSupported:false});
 const doc=await task.promise;let imported=0,originPub=null,pages=[];
 try{
  for(let page=1;page<=doc.numPages;page++){
   const pdfPage=await doc.getPage(page),tc=await pdfPage.getTextContent();
   const viewport=pdfPage.getViewport({scale:1});
   const blocks=D.pdfPage(tc.items,viewport.width,viewport.height,page);
   if(page===1)originPub=C.detectPublished(blocks.map(b=>b.text).join('\n'),filename);
   pages.push({page,blocks});pdfPage.cleanup();
  }
 }finally{try{await task.destroy();}catch{}}
 const structured=D.splitLabeledReports(pages,filename);
 const chunks=structured||pages.flatMap(p=>p.blocks);
 for(const part of chunks){
  const published=originPub?.value||null;
  add({title:structured?part.title:`${filename} — ${part.title}`,text:part.text,filename,type:part.method,
    page:part.page,page_end:part.pageEnd||null,
    section:part.column?`Spalte ${part.column}/${part.columns}`:(structured?`Eintrag aus PDF${part.pageEnd!==part.page?' (mehrseitig)':''}`:null),
    extraction_method:part.method,source_name:meta.source_name||'',parent_file:meta.parent_file||null,
    reported_at:meta.reported_at||null,report_date:part.reportDate||meta.report_date||null,
    report_basis:part.reportDate?'Datiertes Berichtseintragsfeld (Zeitzone ungeklärt)':meta.report_basis||'',
    received_at:meta.received_at||null,published_date:published,
    published_basis:published?'Dokumentkopf (erste PDF-Seite)':'',published_review:!!published,
    published_evidence:originPub?.evidence||'',warnings:[...part.warnings,...(meta.warnings||[]),
      ...(!part.text.trim()?['OCR erforderlich: vorher im MD/PDF-Studio oder zugelassenen OCR-Programm in Markdown/TXT konvertieren.']:[])]});
  imported++;
 }
 return imported;
}
async function processBinary(filename,bytes,meta={},depth=0){const name=basename(filename);const ext=name.split('.').pop().toLowerCase();if(depth>1)throw Error('Verschachtelte Nachrichten nicht unterstützt');
 if(ext==='pdf')return parsePdf(bytes,name,meta);
 if(ext==='msg'){const msg=M.parseMSG(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));let count=0;
 if(msg.body.trim()||msg.subject.trim()){add({title:msg.subject||name,text:msg.body,filename:name,type:'outlook_msg',source_name:meta.source_name||'',reported_at:msg.sent_at,report_basis:'Outlook: PR_CLIENT_SUBMIT_TIME (MAPI)',received_at:msg.received_at,warnings:msg.warning?[msg.warning]:[]});count++;}
 for(const at of msg.attachments){if(at.unsupported){state.errors.push(`${name}: Anhang ${at.filename} konnte nicht gelesen werden`);continue;}const filename=at.filename;const ext2=filename.split('.').pop().toLowerCase();if(['pdf','txt','md','eml','msg'].includes(ext2)){try{count+=await processBinary(filename,at.bytes,{parent_file:name,source_name:meta.source_name||'',reported_at:msg.sent_at,received_at:msg.received_at,report_basis:'Outlook-E-Mail (Anhang): PR_CLIENT_SUBMIT_TIME'},depth+1);}catch(e){state.errors.push(`${name} / ${filename}: ${e.message}`);}}
 else state.errors.push(`${name}: Anhang ${filename} (${size(at.bytes.length)}) nicht importiert: nicht unterstützter Typ`);
 }return count;}
 const raw=textDecode(bytes);
 if(ext==='eml'){const mail=parseEml(raw,name);let count=0;add({title:mail.subject,text:mail.body,filename:name,type:'eml_mail',reported_at:mail.sent_at,report_date:mail.report_date,report_basis:'E-Mail-Date-Header',reported_raw:raw.slice(0,100),received_at:mail.received_at,source_name:'E-Mail'});count++;
 for(const a of mail.attachments){if(!a.bytes){state.errors.push(`${name}: Anhang ${a.filename} nicht lesbar`);continue;}if(/\.(pdf|txt|md)$/i.test(a.filename)){try{count+=await processBinary(a.filename,a.bytes,{parent_file:name,reported_at:mail.sent_at,report_date:mail.report_date,report_basis:'E-Mail-Date-Header'},depth+1);}catch(e){state.errors.push(`${name} / ${a.filename}: ${e.message}`);}}}return count;}
 if(ext==='html'||ext==='htm')return importText(htmlText(raw),name,{...meta,type:'html'});
 if(ext==='txt'||ext==='md')return importText(raw,name,{...meta,type:ext});
 if(ext==='json'||ext==='jsonl'){
 const arr=ext==='jsonl'?raw.split('\n').filter(Boolean).map(s=>JSON.parse(s)):(x=>Array.isArray(x)?x:(x.items||[x]))(JSON.parse(raw));let count=0;
 for(const e of arr){if(!e||typeof e!=='object')continue;if(e.schema===C.SCHEMA&&typeof e.title==='string'&&e.event_date){state.items.push({...e,translation_de:e.translation_de||{title:null,text:null,status:'pending',method:null,reviewed:false},review:Array.isArray(e.review)?e.review:[],urls:Array.isArray(e.urls)?e.urls:[],topics:Array.isArray(e.topics)?e.topics:[]});count++;continue;}
 add({title:e.title||e.headline||'JSON-Meldung',text:e.text||e.body||e.summary||e.operator_summary||'',filename:name,type:'json',source_name:e.source||e.source_name||'',published_date:e.publication_date?.value||e.source_published_at||null,urls:e.urls||(e.url?[e.url]:[]),reported_at:meta.reported_at||null});count++;
 }return count;}
 throw Error('Dateiformat nicht unterstützt: '+ext);
}
async function importFiles(files){if(!files.length)return;let count=0;const errs=[];for(const f of files){if(f.size>40*1024*1024){errs.push(`${f.name}: über 40 MB`);continue;}try{note(`Lese ${f.name} (${size(f.size)}) …`);count+=await processBinary(f.name,new Uint8Array(await f.arrayBuffer()));state.files++;}catch(e){errs.push(`${f.name}: ${e.message}`);}}
 state.errors.push(...errs);state.editUndo=[];dedupe();render();note(`${count} Rohdatenblöcke geladen · ${state.items.length} nach Dublettenabgleich · ${errs.length} Fehler`,!!errs.length);}
function dedupe(){const r=C.mergeIdenticals(state.items);state.items=r.items;state.duplicates+=r.duplicates;}
function rememberEdit(){state.editUndo.push(JSON.stringify(state.items));if(state.editUndo.length>8)state.editUndo.shift();}
function dateEditor(label,obj,idx,key){const status=obj?.status||'unknown',v=obj?.value||'';return `<label>${label}<input type="date" data-i="${idx}" data-key="${key}" value="${escape(v)}" aria-label="${escape(label)}"/><small>${status==='partial'?'Unvollständige Datumsangabe':status==='ambiguous'?'Mehrere mögliche Daten':status==='unverified'?'Datum ohne sicheren Bezug':v?(obj.review_required?'Automatisch erkannt · prüfen':'Gesetzt / aus Meldung'):'Unbekannt · Platzhalter bleibt erhalten'}</small></label>`;}
function languageSelect(it,i){const choices=[['de','Deutsch'],['en','Englisch'],['gemischt','Gemischt'],['unbestimmt','Nicht ermittelt']];return `<label>Originalsprache (bei Bedarf korrigieren)<select data-i="${i}" data-field="original_language">${choices.map(([v,n])=>`<option value="${v}" ${it.original_language===v?'selected':''}>${n}</option>`).join('')}</select></label>`;}
function card(it,i){const translation=it.translation_de||{};
 const mergeTargets=state.items.map((other,j)=>E.canMerge(it,other)?`<option value="${j}">${escape(other.id)} · ${escape(other.title.slice(0,85))}${other.source_page?' · S. '+other.source_page:''}</option>`:'').filter(Boolean).join('');
 return `<article class="item" data-item="${i}"><div class="item-header"><div><strong class="item-index">${escape(it.id)} · ${it.original_language==='en'?'EN':it.original_language==='de'?'DE':'SPRACHE PRÜFEN'}</strong><h3>${escape(it.title)}</h3><p class="source">${escape(it.source_file||'Manuelle Eingabe')}${it.source_page?' · Seite '+it.source_page+(it.source_page_end&&it.source_page_end!==it.source_page?'–'+it.source_page_end:''):''}${it.parent_file?' · Anhang aus '+escape(it.parent_file):''}${it.source_section?' · '+escape(it.source_section):''} · ${escape(it.source_type)}${it.record_kind==='document_context'?' · Dokumentkopf (kein Ereignis)':''}</p></div><button class="minimal" data-delete="${i}" title="Aus der Arbeitsliste entfernen">Entfernen</button></div>
 <div class="dategrid">${dateEditor('Ereignisdatum',it.event_date,i,'event_date')}${dateEditor('Meldedatum',it.report_date,i,'report_date')}${dateEditor('Veröffentlichungsdatum',it.publication_date,i,'publication_date')}</div>
 <div class="metagrid"><label>Quelle / Urheber<input type="text" data-i="${i}" data-field="source_name" value="${escape(it.source_name||'')}" placeholder="Nicht ermittelt" /></label><label>Überschrift<input type="text" data-i="${i}" data-field="title" value="${escape(it.title)}" /></label></div>
 <div class="languagebar">${languageSelect(it,i)}${it.original_language==='en'?`<button class="minimal" data-copy-original="${i}" title="Englischen Originaltext für externes Übersetzungsprogramm kopieren">Englischen Originaltext kopieren</button>`:''}</div>
 ${it.original_language==='en'?`<details class="translation" ${translation.text||translation.title?'open':''}><summary>Deutsche Übersetzung aus dienstlichem Programm einfügen ${translation.text||translation.title?'· vorhanden':'· optional'}</summary><p class="smallnote">Nur falls die Weitergabe an das dienstliche Übersetzungsprogramm zulässig ist. Kein automatischer Upload, keine Übersetzungs-API. Original bleibt erhalten.</p><label>Übersetzte Überschrift<input type="text" data-i="${i}" data-tr="title" value="${escape(translation.title||'')}" placeholder="Deutsche Überschrift einfügen" /></label><label class="full">Übersetzter Text<textarea rows="5" data-i="${i}" data-tr="text" placeholder="Deutschen Text aus dem dienstlichen Übersetzungsprogramm einfügen">${escape(translation.text||'')}</textarea></label><label class="check"><input type="checkbox" data-i="${i}" data-tr-reviewed="1" ${translation.reviewed?'checked':''} ${!(translation.title||translation.text)?'disabled':''}/> Übersetzung manuell geprüft</label><p class="source">Status: ${translation.title||translation.text?(translation.reviewed?'manuell geprüft':'extern eingefügt · ungeprüft'):'keine Übersetzung vorhanden'} · dieselbe Ereigniskennung ${escape(it.id)}</p></details>`:''}
 <details><summary>Rohtext und Prüfbefund anzeigen / bearbeiten</summary><p class="smallnote">Falsche Artikelgrenze? Im Rohtext <code>[[WL-TRENNEN]]</code> auf eine eigene Zeile zwischen die Abschnitte setzen, Textfeld verlassen und dann „Am Marker aufteilen“ wählen. Bei neuen Teilmeldungen wird das Ereignisdatum wieder prüfpflichtig.</p><label class="full">Bereinigter Originalinhalt<textarea rows="8" data-i="${i}" data-field="text">${escape(it.text)}</textarea></label><div class="buttons"><button type="button" class="minimal" data-split="${i}">Am Marker aufteilen</button></div><label class="full">Mit einem anderen Abschnitt derselben Quelldatei zusammenführen<select data-merge-target="${i}"><option value="">Zielabschnitt auswählen …</option>${mergeTargets}</select></label><div class="buttons"><button type="button" class="minimal" data-merge="${i}" ${mergeTargets?'':'disabled'}>Ausgewählte Abschnitte zusammenführen</button></div><label class="full">URLs (eine pro Zeile)<textarea rows="2" data-i="${i}" data-field="urls">${escape((it.urls||[]).join('\n'))}</textarea></label><p class="source">Outlook gesendet UTC: ${escape(it.reported_at||'nicht ermittelt')} · empfangen UTC: ${escape(it.received_at||'nicht ermittelt')}</p>${it.event_date?.candidates?.length?`<p class="warn">Datumskandidaten: ${escape(it.event_date.candidates.slice(0,8).map(x=>x.raw).join(' / '))}</p>`:''}${it.review?.length?`<p class="warn">Prüfen: ${escape(it.review.join(' · '))}</p>`:''}</details></article>`;}
function render(){const n=state.items.length;$('count').textContent=n+' Meldungen';$('dupe').textContent=state.duplicates+' exakte Dubletten';$('errors').textContent=state.errors.length+' Importhinweise';const groups={de:[],en:[],other:[]};state.items.forEach((it,i)=>groups[C.languageGroup(it)].push(card(it,i)));
 $('list').innerHTML=n?`<h3 class="group-title">A · Deutsche Originalmeldungen</h3>${groups.de.join('')||'<p class="smallnote">Keine deutschen Originalmeldungen.</p>'}<h3 class="group-title">B · Englische Originalmeldungen</h3>${groups.en.join('')||'<p class="smallnote">Keine englischen Originalmeldungen.</p>'}${groups.other.length?'<h3 class="group-title">C · Sprache ungeklärt</h3>'+groups.other.join(''):''}`:'<div class="empty">Noch keine Eingaben. Ziehe MSG-, EML- oder PDF-Dateien hierher oder füge Text ein.</div>';
 $('errorDetails').textContent=state.errors.join('\n');$('errorBox').hidden=!state.errors.length;$('undoEdit').disabled=!state.editUndo.length;$('exportText').disabled=!n;$('exportMD').disabled=!n;$('exportJSON').disabled=!n;$('copyText').disabled=!n;
 $('textPreview').value=C.asText(state.items,{includeContent:$('fulltext').checked});
}
function exportAs(name,content,mime){const blob=new Blob([content],{type:mime});const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),8000);}
function handleChange(e){const t=e.target;const i=Number(t.dataset.i);if(!Number.isInteger(i)||!state.items[i])return;const r=state.items[i];
 if(t.dataset.key){const key=t.dataset.key,d=r[key],v=t.value;r[key]=C.dateObj(v||null,v?'known':'unknown',v?'Manuelle Datumskorrektur':'','',{review_required:false,candidates:d?.candidates||[]});render();return;}
 if(t.dataset.tr||t.dataset.trReviewed){const tr=r.translation_de||(r.translation_de={title:null,text:null,status:'pending',method:null,reviewed:false});if(t.dataset.tr){tr[t.dataset.tr]=t.value.trim()||null;tr.reviewed=false;tr.method=(tr.title||tr.text)?'external_manual_paste':null;tr.status=(tr.title||tr.text)?'external_unreviewed':'pending';}else{tr.reviewed=!!t.checked&&!!(tr.title||tr.text);tr.status=tr.reviewed?'reviewed':(tr.title||tr.text)?'external_unreviewed':'pending';}render();return;}
 if(t.dataset.field){if(t.dataset.field==='urls')r.urls=t.value.split('\n').map(x=>x.trim()).filter(Boolean);else {r[t.dataset.field]=t.value;if(t.dataset.field==='text'){if(!(r.review||[]).includes('Originaltext wurde manuell korrigiert; Datums- und Quellenzuordnung prüfen.'))r.review=[...(r.review||[]),'Originaltext wurde manuell korrigiert; Datums- und Quellenzuordnung prüfen.'];r.event_date={...r.event_date,review_required:true};$('textPreview').value=C.asText(state.items,{includeContent:$('fulltext').checked});return;}}render();}
}
$('fileInput').addEventListener('change',e=>{importFiles([...e.target.files]);e.target.value='';});
const drop=$('drop');drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag');});drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag');importFiles([...e.dataTransfer.files]);});
$('addText').addEventListener('click',()=>{const s=$('manual').value;if(!s.trim()){note('Bitte Text eingeben.',true);return;}const n=importText(s,'Manueller Import',{source_name:$('manualSource').value.trim()||'Manuell'});$('manual').value='';state.editUndo=[];dedupe();render();note(`${n} Textabschnitte übernommen.`);});
$('list').addEventListener('change',handleChange);
$('list').addEventListener('click',e=>{
 const splitting=e.target.closest('[data-split]');
 if(splitting){const i=Number(splitting.dataset.split);try{const next=E.splitRecord(state.items[i]);rememberEdit();state.items.splice(i,1,...next);render();note('Meldung in zwei prüfpflichtige Abschnitte geteilt. Bitte Überschriften und Ereignisdaten kontrollieren.');}catch(err){note(err.message,true);}return;}
 const merging=e.target.closest('[data-merge]');
 if(merging){const i=Number(merging.dataset.merge),sel=$('list').querySelector('select[data-merge-target="'+i+'"]'),j=Number(sel?.value);
  if(!sel?.value||!Number.isInteger(j)||i===j){note('Bitte zuerst einen Zielabschnitt aus derselben Quelldatei wählen.',true);return;}
  const first=Math.min(i,j),second=Math.max(i,j);
  if(!confirm('Die ausgewählten Rohdatenblöcke in ihrer ursprünglichen Importreihenfolge zusammenführen? Beide Ausgangskennungen bleiben im JSON erhalten. Datumsunterschiede werden zur Prüfung markiert.'))return;
  try{const merged=E.mergeRecords(state.items[first],state.items[second]);rememberEdit();state.items.splice(second,1);state.items.splice(first,1,merged);render();note('Abschnitte zusammengeführt. Neue Meldungs-ID; Herkunft und Datumsprüfungen erhalten.');}catch(err){note(err.message,true);}return;
 }
 const copy=e.target.closest('[data-copy-original]');if(copy){const x=state.items[Number(copy.dataset.copyOriginal)];const txt=[x.title,x.text].filter(Boolean).join('\n\n');if(!navigator.clipboard?.writeText){note('Automatisches Kopieren blockiert. Originaltext unter Rohtext anzeigen und manuell markieren.',true);return;}navigator.clipboard.writeText(txt).then(()=>note('Englischen Originaltext für dienstliche Übersetzung kopiert.')).catch(()=>note('Zwischenablage blockiert. Originaltext unter Rohtext anzeigen und manuell markieren.',true));return;}const b=e.target.closest('[data-delete]');if(!b)return;rememberEdit();state.items.splice(Number(b.dataset.delete),1);render();note('Meldung aus der Arbeitsliste entfernt (nur lokal).');});
$('undoEdit').addEventListener('click',()=>{const last=state.editUndo.pop();if(!last)return;state.items=JSON.parse(last);render();note('Letzte Teilung, Zusammenführung oder Löschung rückgängig gemacht.');});
$('fulltext').addEventListener('change',render);$('exportText').addEventListener('click',()=>exportAs('white-lightning-destillat.txt',C.asText(state.items,{includeContent:$('fulltext').checked}),'text/plain;charset=utf-8'));
$('exportMD').addEventListener('click',()=>exportAs('white-lightning-destillat.md',C.asMarkdown(state.items,{includeContent:$('fulltext').checked}),'text/markdown;charset=utf-8'));
$('exportJSON').addEventListener('click',()=>exportAs('white-lightning-events.json',JSON.stringify({schema:'mowlsint.white_lightning.bundle.v1',generated_at:new Date().toISOString(),ai_used:false,items:state.items},null,2),'application/json;charset=utf-8'));
$('copyText').addEventListener('click',()=>{navigator.clipboard.writeText(C.asText(state.items,{includeContent:$('fulltext').checked})).then(()=>note('Textdestillat in die Zwischenablage kopiert.')).catch(()=>note('Zwischenablage blockiert; Text unten markieren.',true));});
$('clear').addEventListener('click',()=>{if(!confirm('Alle importierten Daten im aktuellen Browserfenster entfernen?'))return;state.items=[];state.errors=[];state.files=0;state.duplicates=0;state.editUndo=[];render();note('Lokale Arbeitsliste geleert.');});
render();
})();