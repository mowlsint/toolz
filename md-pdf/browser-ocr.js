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
  window.MOwlBrowserOCR={convert};
})();