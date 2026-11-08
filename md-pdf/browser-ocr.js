/* MOwlSINT Toolz – client-side OCR for scanned PDFs; no document uploads. */
(() => {
  'use strict';
  const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFWORKER='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const TESS='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const pending=new Map();
  function load(url,test){
    if(test())return Promise.resolve();
    if(pending.has(url))return pending.get(url);
    const p=new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src=url;s.crossOrigin='anonymous';
      s.onload=()=>test()?resolve():reject(Error('OCR-Bibliothek nicht bereit: '+url));
      s.onerror=()=>reject(Error('OCR-Komponente konnte nicht geladen werden. Internetverbindung prüfen.'));
      document.head.append(s);
    });
    pending.set(url,p);p.catch(()=>pending.delete(url));return p;
  }
  function validUrl(s){try{const u=new URL(s);return ['https:','http:','mailto:'].includes(u.protocol)?u.href:''}catch{return''}}
  function toMd(s,headings){
    const lines=String(s||'').replace(/\r\n?/g,'\n').split('\n').map(x=>x.trim());
    const out=[];let blank=true;
    for(const line of lines){
      if(!line){if(!blank)out.push('');blank=true;continue}
      if(headings && blank && line.length>4 && line.length<85 &&
         !/[.,;:!?]$/.test(line) && line===line.toUpperCase() && /[A-ZÄÖÜ]/.test(line)){
         out.push('## '+line.replace(/([*_[\]])/g,'\\$1'));out.push('');blank=true;
      }else{out.push(line);blank=false}
    }
    return out.join('\n').replace(/\n{3,}/g,'\n\n').trim();
  }
  async function convert(file,opts,status){
    const msg=s=>{if(typeof status==='function')status(s);else if(status)status.textContent=s};
    msg('Lade PDF- und OCR-Bibliotheken …');
    await Promise.all([load(PDFJS,()=>!!window.pdfjsLib),load(TESS,()=>!!window.Tesseract?.createWorker)]);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFWORKER;
    const dpi=Number(document.getElementById('ocrDpi')?.value||220);
    const lang=document.getElementById('ocrLanguage')?.value||'deu+eng';
    let pdf=null,worker=null;
    try{
      pdf=await window.pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
      if(!pdf.numPages)throw Error('Das PDF enthält keine Seiten.');
      const chunks=[],urls=new Set();let countHeadings=0;
      msg('Starte OCR. Bei der ersten Nutzung werden Sprachdaten geladen …');
      worker=await window.Tesseract.createWorker(lang,1,{logger:m=>{
        if(m.status==='recognizing text' && typeof m.progress==='number')
          msg('OCR: '+Math.round(m.progress*100)+' % der aktuellen Seite …');
      }});
      for(let i=1;i<=pdf.numPages;i++){
        msg('OCR: Seite '+i+' von '+pdf.numPages);
        const page=await pdf.getPage(i), base=page.getViewport({scale:dpi/72});
        const f=Math.min(1,Math.sqrt(12000000/Math.max(1,base.width*base.height)));
        const v=page.getViewport({scale:f*dpi/72});
        const canvas=document.createElement('canvas');
        canvas.width=Math.ceil(v.width);canvas.height=Math.ceil(v.height);
        const ctx=canvas.getContext('2d',{alpha:false});
        ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
        await page.render({canvasContext:ctx,viewport:v}).promise;
        const result=await worker.recognize(canvas);
        const part=toMd(result?.data?.text||'',!!opts.headings);
        countHeadings+=(part.match(/^#{1,6}\s/gm)||[]).length;
        chunks.push(part);
        if(opts.links){
          try{for(const a of await page.getAnnotations()){
            const url=validUrl(a.url||a.unsafeUrl||'');if(url)urls.add(url);
          }}catch{}
        }
        canvas.width=0;canvas.height=0;page.cleanup();
      }
      const mark=chunks.map((s,i)=>i&&opts.pagebreaks?'<!-- pagebreak -->\n\n'+s:s).join('\n\n')+
        (urls.size?'\n\n## Weblinks aus dem PDF\n\n'+[...urls].map(u=>'- [Webadresse]('+u+')').join('\n'):'');
      if(mark.trim().length<12)throw Error('Die OCR hat keinen auswertbaren Text gefunden. Scanqualität und Sprache prüfen.');
      return{markdown:mark,pages:pdf.numPages,characters:mark.length,headings:countHeadings,tables:0,links:urls.size,method:'ocr',warning:'OCR-Texte, Tabellen und Zahlen bitte nachprüfen.'};
    }finally{
      if(worker)try{await worker.terminate()}catch{}
      if(pdf)try{await pdf.destroy()}catch{}
    }
  }

  // PDF.js resolves embedded font encodings and ToUnicode maps that the legacy
  // lightweight PDF parser cannot reliably read (e.g. subset Type0 Identity-H).
  function glyphQuality(s){
    if(!s || !s.trim())return false;
    const replacement=(s.match(/\uFFFD/g)||[]).length;
    const control=(s.match(/[\u0000-\u0008\u000B\u000E-\u001F]/g)||[]).length;
    return replacement/Math.max(1,s.length)<0.025 &&
           control/Math.max(1,s.length)<0.01;
  }
  function collectPageLines(textContent){
    const chars=(textContent.items||[]).filter(x=>x.str && x.str.trim()).map(x=>{
      const tf=x.transform||[1,0,0,1,0,0];
      const size=Math.max(4,Math.hypot(tf[0],tf[1])||Math.abs(x.height)||10);
      return {text:x.str,x:Number(tf[4])||0,y:Number(tf[5])||0,size,
        width:Number(x.width)||0,end:!!x.hasEOL};
    });
    chars.sort((a,b)=>b.y-a.y||a.x-b.x);
    const rows=[];
    for(const item of chars){
      let row=rows.find(r=>Math.abs(r.y-item.y)<=Math.min(3.1,Math.max(1.0,item.size*.23)));
      if(!row){row={y:item.y,items:[],size:item.size};rows.push(row);}
      row.items.push(item);
    }
    rows.sort((a,b)=>b.y-a.y);
    for(const row of rows){
      row.items.sort((a,b)=>a.x-b.x);
      let result='',endX=null;
      for(const word of row.items){
        let part=word.text.replace(/[\u0000-\u001F\uFFFD]/g,' ').replace(/\s+/g,' ');
        if(!part.trim())continue;
        if(endX!==null){
          const gap=word.x-endX;
          if(gap>Math.max(1.8,word.size*.17) && !result.endsWith(' ')&&!part.startsWith(' '))result+=' ';
        }
        result+=part;
        endX=Math.max(endX===null?0:endX,word.x+Math.max(0,word.width));
      }
      row.text=result.trim();
      row.size=Math.max(...row.items.map(i=>i.size),10);
    }
    return rows.filter(r=>r.text);
  }
  function linesToMarkdown(lines,opts){
    if(!lines.length)return '';
    const sizes=lines.map(l=>l.size).sort((a,b)=>a-b);
    const base=sizes[Math.floor(sizes.length*.5)]||10;
    const jumps=[];
    for(let j=1;j<lines.length;j++){
      const dy=lines[j-1].y-lines[j].y;
      if(dy>0.1&&dy<45)jumps.push(dy);
    }
    jumps.sort((a,b)=>a-b);
    const lineSpacing=jumps[Math.floor(jumps.length*.50)]||Math.max(12,base*1.2);
    let out='',prev=null;
    for(const line of lines){
      const t=line.text;
      if(!t)continue;
      const isHeading=!!opts.headings && t.length<120 && !/^\d+[.,]\s/.test(t) &&
          (line.size>base*1.34 && t.length<115 || (line.size>base*1.12 && t.length<75 &&
          t===t.toUpperCase() && /[A-ZÄÖÜ]/.test(t)));
      if(isHeading){
        out+='\n\n## '+t+'\n\n';
      }else if(prev && !prev.heading && !/^[-•*]\s/.test(t) &&
        Math.abs(prev.size-line.size)<2 &&
        (prev.text.length>=58 || (prev.text.endsWith('-') && /^[a-zäöüß]/.test(t))) &&
        prev.y-line.y <lineSpacing*1.32 && prev.y-line.y>=0 &&
        !out.endsWith('\n\n')){
        out=out.replace(/\s+$/,'');
        const hyphen=out.endsWith('-') && /^[a-zäöüß]/.test(t);
        out+=(hyphen?'':' ')+t;
      }else{
        if(!out.endsWith('\n\n')&&out)out+='\n\n';
        out+=t;
      }
      prev={y:line.y,heading:isHeading,text:t,size:line.size};
    }
    return out.replace(/\n{3,}/g,'\n\n').trim();
  }
  function compilePageMarkdown(pages,opts,links){
    let markdown=pages.map((t,i)=>i&&opts.pagebreaks?'<!-- pagebreak -->\n\n'+t:t).join('\n\n').trim();
    if(links.length)markdown+='\n\n## Weblinks aus dem PDF\n\n'+
      links.map(url=>'- [Webadresse]('+url.replace(/\)/g,'%29')+')').join('\n');
    return markdown;
  }
  async function extractPDF(file,opts={},status){
    const msg=typeof status==='function'?status:s=>{if(status)status.textContent=s};
    msg('Lade Unicode-PDF-Texterkennung …');
    await load(PDFJS,()=>!!window.pdfjsLib);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFWORKER;
    let pdf=null;
    try{
      pdf=await window.pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
      if(pdf.numPages>500)throw Error('Das PDF ist zu groß (über 500 Seiten).');
      const parts=[],scans=[],urls=new Set();let chars=0,headings=0;
      for(let i=1;i<=pdf.numPages;i++){
        msg('PDF-Textebene: Seite '+i+' / '+pdf.numPages);
        const page=await pdf.getPage(i);
        const content=await page.getTextContent({disableNormalization:false});
        const lines=collectPageLines(content);
        const raw=lines.map(l=>l.text).join('\n');
        const readable=glyphQuality(raw);
        const md=linesToMarkdown(lines,opts);
        // Preserve ordinary short title pages; flag empty/unreadable ones for OCR.
        if((raw.trim().length<12||!readable))scans.push(i);
        parts.push(readable?md:'');
        if(readable)chars+=md.length;
        headings+=(md.match(/^#{1,6}\s/gm)||[]).length;
        if(opts.links)try{
          for(const annot of await page.getAnnotations()){
            const url=validUrl(annot.url||annot.unsafeUrl||'');
            if(url)urls.add(url);
          }
        }catch{}
        page.cleanup();
      }
      const links=[...urls],markdown=compilePageMarkdown(parts,opts,links);
      return {markdown,pages:pdf.numPages,characters:chars,headings,tables:0,links:links.length,
        scanPages:scans,pageMarkdown:parts,urlList:links,method:'text',
        warning:scans.length?'Kein zuverlässiger PDF-Text auf Seite(n) '+scans.join(', ')+'.':'Tabellen und Spalten bitte überprüfen.'};
    }finally{
      if(pdf)try{await pdf.destroy()}catch{}
    }
  }
  async function convertSelectedPDF(file,opts,base,status){
    const selected=(base.scanPages||[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=base.pages);
    if(!selected.length)return base;
    const msg=typeof status==='function'?status:s=>{if(status)status.textContent=s};
    await Promise.all([load(PDFJS,()=>!!window.pdfjsLib),load(TESS,()=>!!window.Tesseract?.createWorker)]);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFWORKER;
    let pdf=null,worker=null;
    const parts=[...base.pageMarkdown];
    try{
      pdf=await window.pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
      worker=await window.Tesseract.createWorker(document.getElementById('ocrLanguage')?.value||'deu+eng',1);
      const dpi=Number(document.getElementById('ocrDpi')?.value||220);
      for(let i=0;i<selected.length;i++){
        const pageNo=selected[i];
        msg('OCR nur für Seite '+pageNo+' ('+(i+1)+' / '+selected.length+')');
        const page=await pdf.getPage(pageNo),v0=page.getViewport({scale:dpi/72});
        const f=Math.min(1,Math.sqrt(12000000/Math.max(1,v0.width*v0.height)));
        const v=page.getViewport({scale:dpi/72*f});
        const canvas=document.createElement('canvas');
        canvas.width=Math.ceil(v.width);canvas.height=Math.ceil(v.height);
        const ctx=canvas.getContext('2d',{alpha:false});
        ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
        await page.render({canvasContext:ctx,viewport:v}).promise;
        const result=await worker.recognize(canvas);
        parts[pageNo-1]=toMd(result.data.text||'',!!opts.headings);
        canvas.width=0;canvas.height=0;page.cleanup();
      }
      const markdown=compilePageMarkdown(parts,opts,base.urlList||[]);
      return {...base,markdown,pageMarkdown:parts,characters:markdown.length,
        scanPages:[],method:'mixed',
        warning:'OCR nur für '+selected.length+' Seite(n). Bitte erkannte Zahlen und Tabellen prüfen.'};
    }finally{
      if(worker)try{await worker.terminate()}catch{}
      if(pdf)try{await pdf.destroy()}catch{}
    }
  }
  async function convertImage(file,opts={},status){
    const msg=typeof status==='function'?status:s=>{if(status)status.textContent=s};
    if(!file||!/^image\/(?:png|jpeg|webp|bmp|gif)$/i.test(file.type))throw Error('PNG, JPG, WEBP, BMP oder GIF auswählen.');
    msg('Lade Bild-OCR …');
    await load(TESS,()=>!!window.Tesseract?.createWorker);
    let worker=null;
    try{
      msg('Erkenne Bildtext …');
      worker=await window.Tesseract.createWorker(document.getElementById('ocrLanguage')?.value||'deu+eng',1);
      const result=await worker.recognize(file);
      const markdown=toMd(result?.data?.text||'',!!opts.headings);
      if(markdown.trim().length<2)throw Error('Kein Text erkannt. Das Bild kann stattdessen als Bild in ein PDF übernommen werden.');
      return {markdown,characters:markdown.length,method:'image-ocr'};
    }finally{if(worker)try{await worker.terminate()}catch{}}
  }

  window.MOwlBrowserOCR={convert,extractPDF,convertSelectedPDF,convertImage};
})();