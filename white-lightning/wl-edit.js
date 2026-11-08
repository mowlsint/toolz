/* MOwlSINT White Lightning — browser-only reversible editorial boundaries.
 * Manual splitting/merging always creates new record IDs; original provenance is retained.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./wl-core.js'));
  else root.WLEdit = factory(root.WLCore);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (C) {
  'use strict';
  const SPLIT_MARKER = '[[WL-TRENNEN]]';
  const newId = source => 'wl_' + C.hash(source);
  const clone = v => JSON.parse(JSON.stringify(v));
  const origins = it => Array.isArray(it.source_origins)&&it.source_origins.length
    ? clone(it.source_origins)
    : [{id:it.id||null,source_file:it.source_file||null,parent_file:it.parent_file||null,
      source_page:it.source_page||null,source_page_end:it.source_page_end||null,
      source_section:it.source_section||null,record_kind:it.record_kind||'message_candidate',
      event_date:clone(it.event_date||{}),report_date:clone(it.report_date||{}),
      publication_date:clone(it.publication_date||{})}];
  const noTranslation = it => !(it.translation_de?.text?.trim()||it.translation_de?.title?.trim());
  function resetEvent(it,reason) {
    const prior=clone(it.event_date||{});
    return C.dateObj(null,'unverified',reason,prior.evidence||'',{
      review_required:true,candidates:[...(prior.candidates||[]),...(prior.value?[{value:prior.value,raw:prior.value,context:'Datum vor manueller Textgrenzenkorrektur'}]:[])]
    });
  }
  function splitRecord(input) {
    if(!noTranslation(input))throw Error('Meldung hat eine eingetragene deutsche Übersetzung. Erst Übersetzung extern sichern und entfernen, dann aufteilen.');
    const raw=String(input.text||'');
    const regex=/^\s*\[\[WL-TRENNEN\]\]\s*$/i;
    const lines=raw.replace(/\r\n?/g,'\n').split('\n');
    const cuts=lines.flatMap((line,i)=>regex.test(line)?[i]:[]);
    if(cuts.length!==1)throw Error('Genau eine eigene Zeile mit [[WL-TRENNEN]] als Artikelgrenze einfügen.');
    const left=lines.slice(0,cuts[0]).join('\n').trim(),right=lines.slice(cuts[0]+1).join('\n').trim();
    if(left.length<5||right.length<5)throw Error('Beide Textteile müssen nach dem Trennmarker mindestens fünf Zeichen enthalten.');
    const common=origins(input),stamp=`split|${input.id}|${left}|${right}`;
    return [left,right].map((text,index)=>{
      const next=clone(input);
      next.id=newId(stamp+'|'+index);
      next.text=text;
      if(index===1)next.title=(input.title||'Meldung')+' (Teil 2 – Titel prüfen)';
      next.source_section=[input.source_section,`Manuelle Teilung ${index+1}/2`].filter(Boolean).join(' · ');
      next.source_origins=common;
      next.derived_from_ids=[...(input.derived_from_ids||[]),input.id];
      next.extraction_method='manual_split';
      next.event_date=resetEvent(input,'Ereignisdatum nach manueller Aufteilung erneut zu prüfen');
      next.translation_de={title:null,text:null,status:'pending',method:null,reviewed:false};
      next.status='manuell aufgeteilte Rohmeldung · ungeprüft';
      next.review=[...(input.review||[]),'Meldung manuell geteilt; Ereignisdatum nicht automatisch übernommen.','Artikelgrenze manuell gesetzt; Text und Quellenbezug prüfen.'];
      return next;
    });
  }
  function canMerge(a,b) {
    if(!a||!b||a.id===b.id)return false;
    if(a.source_file!==b.source_file||a.parent_file!==b.parent_file)return false;
    if(a.original_language!==b.original_language||a.record_kind!==b.record_kind)return false;
    return noTranslation(a)&&noTranslation(b);
  }
  function combineDate(a,b,label) {
    const x=a||C.dateObj(),y=b||C.dateObj();
    if(x.value&&y.value&&x.value===y.value)return {...clone(x),review_required:x.review_required||y.review_required,
      candidates:[...(x.candidates||[]),...(y.candidates||[])]};
    if(!x.value&&!y.value&&x.status===y.status)return {...clone(x),review_required:true,
      candidates:[...(x.candidates||[]),...(y.candidates||[])]};
    return C.dateObj(null,'ambiguous',label+' unterscheidet sich in zusammengeführten Abschnitten',null,{
      review_required:true,candidates:[...[x,y].filter(z=>z.value).map(z=>({value:z.value,raw:z.value,context:z.basis||'Teilabschnitt'})),
      ...(x.candidates||[]),...(y.candidates||[])]});
  }
  function mergeRecords(a,b) {
    if(!canMerge(a,b))throw Error('Nur getrennte Rohblöcke derselben Datei, derselben Originalsprache und desselben Datensatztyps ohne vorhandene Übersetzung dürfen zusammengeführt werden.');
    const next=clone(a);
    next.id=newId('merge|'+a.id+'|'+b.id);
    next.text=[a.text,b.text].filter(Boolean).join('\n\n');
    next.urls=[...new Set([...(a.urls||[]),...(b.urls||[])])];
    next.topics=[...new Set([...(a.topics||[]),...(b.topics||[])])];
    next.source_origins=[...origins(a),...origins(b)];
    next.derived_from_ids=[...new Set([...(a.derived_from_ids||[]),a.id,...(b.derived_from_ids||[]),b.id])];
    const pages=[a.source_page,a.source_page_end,b.source_page,b.source_page_end].filter(Number.isInteger);
    if(pages.length){next.source_page=Math.min(...pages);next.source_page_end=Math.max(...pages);}
    next.source_section=[a.source_section,b.source_section].filter(Boolean).join(' + ')||'Manuell zusammengeführt';
    next.extraction_method='manual_merge';
    next.event_date=combineDate(a.event_date,b.event_date,'Ereignisdatum');
    next.report_date=combineDate(a.report_date,b.report_date,'Meldedatum');
    next.publication_date=combineDate(a.publication_date,b.publication_date,'Veröffentlichungsdatum');
    next.reported_at=a.reported_at===b.reported_at?a.reported_at:null;
    next.received_at=a.received_at===b.received_at?a.received_at:null;
    next.translation_de={title:null,text:null,status:'pending',method:null,reviewed:false};
    next.status='manuell zusammengeführte Rohmeldung · ungeprüft';
    next.review=[...(a.review||[]),...(b.review||[]),
      'Manuell zusammengeführt; Datumsangaben und Lesereihenfolge prüfen.',
      'Ursprung beider Quellabschnitte ist unter source_origins im JSON erhalten.'];
    return next;
  }
  return {SPLIT_MARKER,splitRecord,mergeRecords,canMerge};
});