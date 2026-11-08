/* MOwlSINT White Lightning — conservative document sectioning and PDF columns.
 * No network, OCR, translation or AI. All suggested article boundaries require review.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WLDocument = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const linesOf = value => String(value || '').replace(/\r\n?/g, '\n').split('\n');
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const basename = name => String(name || 'Dokument').split(/[\\/]/).pop();
  const headingMarkdown = line => /^\s{0,3}(#{1,3})\s+(.{4,150}?)\s*#*\s*$/.exec(line);
  const headingPlain = line => /^\s{0,4}(?:Meldung|Alert|Incident|Nachricht|Ereignis|Report)\s+(?:No\.?|Nr\.?|#)?\s*\d{1,3}\b\s*[:.\-–]?\s*(.*)$/i.exec(line);
  const boundaries = lines => { const out=[];let inFence=false,inFrontmatter=false;
    lines.forEach((line,i)=>{
      if(/^\s*(```|~~~)/.test(line)){inFence=!inFence;return;}
      if(i===0&&/^---\s*$/.test(line)){inFrontmatter=true;return;}
      if(inFrontmatter){if(/^---\s*$/.test(line))inFrontmatter=false;return;}
      if(!inFence && /^\s*(?:---|={4,})\s*$/.test(line))out.push(i);
    });return out;
  };
  function explicitChunks(text) {
    const lines=linesOf(text), cuts=boundaries(lines);
    if(!cuts.length)return [text.trim()].filter(Boolean);
    const out=[];let start=0;
    for(const cut of cuts){const value=lines.slice(start,cut).join('\n').trim();if(value)out.push(value);start=cut+1;}
    const end=lines.slice(start).join('\n').trim();if(end)out.push(end);return out;
  }
  function splitHeaded(block,format,filename){
    const lines=linesOf(block),heads=[];let inFence=false;
    lines.forEach((line,i)=>{
      if(/^\s*(```|~~~)/.test(line))inFence=!inFence;
      if(inFence)return;
      const m=format==='md'?headingMarkdown(line):headingPlain(line);
      if(!m)return;
      if(format==='md')heads.push({i,level:m[1].length,title:clean(m[2])});
      else heads.push({i,level:1,title:clean(m[1])||clean(line)});
    });
    if(format==='md'){
      const deepest=heads.some(h=>h.level===2)?2:heads.some(h=>h.level===1)?1:3;
      const eligible=heads.filter(h=>h.level===deepest);
      if(eligible.length>=2){heads.length=0;heads.push(...eligible);}
      else heads.length=0;
    }
    if(heads.length<2)return [{title:deriveTitle(block,format,filename),text:block.trim(),method:'single',warnings:[]}];
    const sections=[];
    for(let j=0;j<heads.length;j++){
      const begin=heads[j].i,until=j+1<heads.length?heads[j+1].i:lines.length;
      const section=lines.slice(begin,until).join('\n').trim();
      if(!section)continue;
      sections.push({title:heads[j].title,text:section,method:'heading_candidate',warnings:['Automatische Abschnittsgrenze aus Überschrift erkannt; als eigenständige Meldung prüfen.']});
    }
    const preamble=lines.slice(0,heads[0].i).join('\n').trim();
    if(preamble){sections.unshift({title:`${basename(filename)} — Dokumentkopf`,text:preamble,method:'preamble',warnings:['Dokumentkopf/Vorspann – nicht automatisch als Ereignismeldung behandeln.']});}
    return sections;
  }
  function deriveTitle(text,format,filename){
    const first=linesOf(text).map(x=>x.trim()).find(Boolean)||'';
    const heading=format==='md'?headingMarkdown(first):headingPlain(first);
    return clean(heading?(format==='md'?heading[2]:heading[1]||first):first).slice(0,180)||basename(filename);
  }
  // Structured report entries (e.g. VeRIL-AI): explicit [YYYY-MM-DD HH:MM] headings.
  // Treat the stamp as a source entry/report stamp, never an incident timestamp or a UTC time.
  function splitLabeledReports(pages,filename='Bericht'){
    const pieces=[];let pos=0;
    for(const page of pages){
      const body=(page.blocks||[]).map(b=>b.text).join('\n');
      pieces.push({page:page.page,start:pos,text:body});pos+=body.length+2;
    }
    const all=pieces.map(p=>p.text).join('\n\n');
    const regex=/^\s*\[((?:19|20)\d{2}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\]\s+([^\n]{5,})/gm;
    const matches=[...all.matchAll(regex)];
    if(matches.length<2)return null;
    const pageAt=i=>[...pieces].reverse().find(p=>p.start<=i)?.page||1;
    const out=[];const first=matches[0].index;
    const intro=all.slice(0,first).trim();
    if(intro)out.push({title:`${basename(filename)} — Dokumentkopf`,text:intro,page:pageAt(0),pageEnd:pageAt(first),method:'document_preamble',warnings:['Dokumentkopf, keine eigenständige Ereignismeldung.']});
    for(let i=0;i<matches.length;i++){
      const m=matches[i],end=i+1<matches.length?matches[i+1].index:all.length;
      const block=all.slice(m.index,end).trim();
      const startPage=pageAt(m.index),endPage=pageAt(Math.max(m.index,end-1));
      const after=block.split('\n').map(x=>x.trim()).filter(Boolean);
      const title=(after.find((x,j)=>j>0&&!/^[-–_]{5,}$/.test(x))||m[3]).slice(0,180);
      out.push({title,text:block,page:startPage,pageEnd:endPage,method:'labeled_entry',reportDate:m[1],reportTime:m[2],
        warnings:['Einzelmeldungsgrenze aus datiertem Eintragskopf erkannt. Eintragszeit ist nicht zwingend Ereignisdatum oder UTC.',
          ...(startPage!==endPage?['Meldung erstreckt sich über mehrere PDF-Seiten; Verknüpfung prüfen.']:[])]});
    }
    return out;
  }
  function splitText(text,filename='Notiz.txt',format='txt'){
    const labeled=splitLabeledReports([{page:1,blocks:[{text:String(text||'')}]}],filename);
    if(labeled)return labeled.map((p,i)=>({...p,section:i+1,format}));
    const chunks=explicitChunks(String(text||''));const out=[];
    for(const block of chunks)out.push(...splitHeaded(block,format,filename));
    return out.slice(0,400).map((part,i)=>({...part,section:i+1,format}));
  }
  function quantile(a,p){if(!a.length)return 0;const v=[...a].sort((x,y)=>x-y);return v[Math.min(v.length-1,Math.max(0,Math.floor((v.length-1)*p)))];}
  function pdfWords(items){
    return (items||[]).filter(o=>typeof o.str==='string'&&o.str.trim()).map(o=>{
      const tf=o.transform||[1,0,0,1,0,0];return {text:o.str.replace(/[\u0000-\u001f\ufffd]/g,' ').trim(),x:Number(tf[4])||0,y:Number(tf[5])||0,width:Math.max(0,Number(o.width)||0),size:Math.max(5,Math.hypot(Number(tf[0])||0,Number(tf[1])||0)||Number(o.height)||10)};
    }).filter(w=>w.text);
  }
  function assembleRows(words){
    const sorted=[...words].sort((a,b)=>b.y-a.y||a.x-b.x),rows=[];
    for(const word of sorted){let row=rows.find(r=>Math.abs(r.y-word.y)<Math.min(3,word.size*.22));if(!row){row={y:word.y,items:[]};rows.push(row);}row.items.push(word);}
    return rows.sort((a,b)=>b.y-a.y).map(row=>{
      const w=row.items.sort((a,b)=>a.x-b.x);let text='',right=null;
      for(const item of w){if(text&&right!==null&&item.x-right>Math.max(1.8,item.size*.15))text+=' ';text+=item.text;right=Math.max(right||0,item.x+item.width);}
      return {y:row.y,text:clean(text),size:Math.max(...w.map(v=>v.size)),x:Math.min(...w.map(v=>v.x))};
    }).filter(r=>r.text);
  }
  function leftEdgeColumns(words,width,height){
    const body=words.filter(w=>w.y>height*.10&&w.y<height*.88&&w.width>=Math.max(18,width*.055)&&w.width<width*.44);
    if(body.length<45)return [];
    const median=quantile(body.map(w=>w.size),.5);
    const groups=[];
    for(const w of body.filter(w=>w.size<=median*1.18)){
      let group=groups.find(g=>Math.abs(g.x-w.x)<=11);
      if(!group){group={x:w.x,count:0,total:0};groups.push(group);}
      group.total+=w.x;group.count++;group.x=group.total/group.count;
    }
    const threshold=Math.max(7,Math.floor(body.length*.065));
    const peaks=groups.filter(g=>g.count>=threshold).sort((a,b)=>a.x-b.x);
    const anchors=[];
    for(const g of peaks){
      if(!anchors.length||g.x-anchors[anchors.length-1].x>width*.13)anchors.push(g);
      else if(g.count>anchors[anchors.length-1].count)anchors[anchors.length-1]=g;
    }
    if(anchors.length<2||anchors.length>4)return [];
    const cuts=[];
    for(let i=1;i<anchors.length;i++)cuts.push(anchors[i].x-Math.max(3,width*.008));
    return cuts;
  }
  function gutters(words,width,height){
    if(words.length<50||!Number.isFinite(width)||width<240)return [];
    const body=words.filter(w=>w.y>height*.09&&w.y<height*.91&&w.width>2&&w.width<width*.44);
    if(body.length<50)return [];
    const median=quantile(body.map(w=>w.size),.5);
    const filtered=body.filter(w=>w.size<=median*1.2);
    const step=4,n=Math.ceil(width/step),coverage=new Array(n).fill(0);
    for(const w of filtered){const a=Math.max(0,Math.floor(w.x/step)),b=Math.min(n-1,Math.ceil((w.x+w.width)/step));for(let i=a;i<=b;i++)coverage[i]++;}
    const minX=quantile(filtered.map(w=>w.x),.07),maxX=quantile(filtered.map(w=>w.x+w.width),.93);
    const peak=quantile(coverage.filter(x=>x>0),.65)||1;
    const low=peak*.13;
    const spans=[];let start=null;
    for(let i=0;i<n;i++){
      const x=i*step;const blank=x>minX+width*.10&&x<maxX-width*.10&&coverage[i]<=low;
      if(blank&&start===null)start=i;
      if(!blank&&start!==null){const end=i;spans.push({from:start*step,to:end*step,width:(end-start)*step});start=null;}
    }
    if(start!==null)spans.push({from:start*step,to:n*step,width:(n-start)*step});
    const viable=spans.filter(s=>s.width>=Math.max(12,width*.021)).sort((a,b)=>b.width-a.width);
    const cuts=[];for(const gap of viable){const cut=(gap.from+gap.to)/2;const partitions=[minX,...cuts,cut,maxX].sort((a,b)=>a-b);if(partitions.some((x,i)=>i&&x-partitions[i-1]<Math.max(70,width*.12)))continue;cuts.push(cut);if(cuts.length===3)break;}
    const edges=leftEdgeColumns(words,width,height);
    return (edges.length>cuts.length?edges:cuts).sort((a,b)=>a-b);
  }
  function pdfPage(items,width,height,pageNo){
    const words=pdfWords(items);if(!words.length)return [{title:`Seite ${pageNo}`,text:'',page:pageNo,column:null,method:'scan_needed',warnings:['Keine auslesbare Textebene – OCR nur mit zugelassener Software nachholen.']}];
    const cuts=gutters(words,width,height),n=cuts.length+1;
    const groups=Array.from({length:n},()=>[]),crossings=[];
    for(const w of words){const idx=cuts.filter(x=>w.x>x).length;groups[idx].push(w);if(cuts.some(x=>w.x<x&&w.x+w.width>x))crossings.push(w);}
    let blocks=[];
    for(let c=0;c<n;c++){
      const rows=assembleRows(groups[c]);if(!rows.length)continue;
      const txt=rows.map(r=>r.text).join('\n');
      const title=`Seite ${pageNo}${n>1?` · Spalte ${c+1}/${n}`:''}`;
      const warnings=['PDF-Text nach visueller Position rekonstruiert. Artikelgrenzen und Lesereihenfolge prüfen.'];
      if(n>1)warnings.push(`Mehrspaltiges Layout erkannt (${n} Spalten); eine Spalte ist nicht zwingend ein vollständiger Artikel.`);
      if(crossings.length)warnings.push('Spaltenübergreifende Elemente/Überschriften möglich; Zuordnung kontrollieren.');
      // Additional, explicitly labelled candidates: do not silently merge columns/pages.
      blocks.push({title,text:txt,page:pageNo,column:n>1?c+1:null,columns:n,method:n>1?'pdf_column_candidate':'pdf_page',warnings});
    }
    return blocks.length?blocks:[{title:`Seite ${pageNo}`,text:'',page:pageNo,column:null,method:'scan_needed',warnings:['PDF-Seite enthält keinen extrahierbaren Text.']}];
  }
  return {splitText,splitLabeledReports,pdfPage,pdfWords,assembleRows,gutters};
});