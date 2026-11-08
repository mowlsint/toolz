/* MOwlSINT White Lightning — deterministic text distiller. No network, no AI. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WLCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SCHEMA = 'mowlsint.white_lightning.event.v1';
  const UNKNOWN = { event_date: '[EREIGNISDATUM NICHT ERMITTELT]', report_date: '[MELDEDATUM NICHT ERMITTELT]', published_date: '[VEROEFFENTLICHUNGSDATUM NICHT ERMITTELT]' };
  const MONTHS = {januar:1,jan:1,februar:2,feb:2,maerz:3,märz:3,mar:3,march:3,april:4,apr:4,mai:5,may:5,juni:6,jun:6,june:6,juli:7,jul:7,july:7,august:8,aug:8,september:9,sep:9,sept:9,october:10,oct:10,oktober:10,okt:10,november:11,nov:11,december:12,dec:12,dezember:12,dez:12};
  const MONTH_RE='(?:Januar|Jan\\.?|Februar|Feb\\.?|März|Maerz|March|Mar\\.?|April|Apr\\.?|Mai|May|Juni|Jun\\.?|June|Juli|Jul\\.?|July|August|Aug\\.?|September|Sept?\\.?|October|Oct\\.?|Oktober|Okt\\.?|November|Nov\\.?|December|Dec\\.?|Dezember|Dez\\.?)';
  const detectLanguage = (s) => { const t=' '+String(s||'').toLowerCase()+' ';const de=(t.match(/\b(?:der|die|das|und|wurde|wurden|schiff|hafen|behörden|polizei|mit|für|am|im)\b/g)||[]).length;const en=(t.match(/\b(?:the|and|was|were|ship|vessel|port|authorities|with|from|that|this)\b/g)||[]).length;return Math.max(de,en)<2?'unbestimmt':Math.abs(de-en)<2?'gemischt':de>en?'de':'en'; };
  const hash = (s) => { let h=2166136261; for (const c of String(s)) {h^=c.charCodeAt(0);h=Math.imul(h,16777619);} return (h>>>0).toString(16).padStart(8,'0'); };
  const trimmed = x => String(x ?? '').replace(/\r\n?/g,'\n').trim();
  function isoDay(y,m,d){y=Number(y);m=Number(m);d=Number(d);if(y<1900||y>2200||m<1||m>12||d<1||d>31)return null;const x=new Date(Date.UTC(y,m-1,d));return x.getUTCFullYear()===y&&x.getUTCMonth()===m-1&&x.getUTCDate()===d?`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`:null;}
  function dayFromRFC(text){ const t=trimmed(text);if(!t)return null;const d=new Date(t);if(!Number.isFinite(d.getTime()))return null;return d.toISOString(); }
  function dateFromIsoInstant(t){return /^\d{4}-\d{2}-\d{2}/.test(t||'')?t.slice(0,10):null;}
  function dateObj(value=null, status='unknown', basis='', evidence='', opts={}){
    return { value:value||null, status:value?'known':status, precision:value?'day':(opts.precision||null), basis:basis||null, evidence:evidence||null, review_required:!!opts.review_required, candidates:opts.candidates||[] };
  }
  function cleanText(source){
    let s=trimmed(source).replace(/\u0000/g,'').replace(/[\u200b\ufeff]/g,'');
    s=s.replace(/=\n/g,'').replace(/\bhttps?:\/\/[^\s<>"']{1200,}/gi,'[URL über 1200 Zeichen ausgeblendet]');
    const lines=s.split('\n');const keep=[];let dropped=0;
    for(let i=0;i<lines.length;i++){
      const l=lines[i].trim();
      if (/^ACHTUNG!!\s*Diese E-Mail erreicht Sie von einem Absender außerhalb/i.test(l)) {dropped++;continue;}
      if (/^(?:This email originated from outside|External sender warning|CAUTION: external email)/i.test(l)) {dropped++;continue;}
      if (/^(?:Diese E-Mail kann vertrauliche Informationen|This e-mail and any attachments are confidential)/i.test(l)) {dropped++;continue;}
      if (/^_{15,}$/.test(l)) {dropped++;continue;}
      keep.push(lines[i].replace(/[\t ]+$/,''));
    }
    return {text:keep.join('\n').replace(/\n{4,}/g,'\n\n\n').trim(),removed_lines:dropped};
  }
  function getUrls(s){const found=String(s||'').match(/https?:\/\/[^\s<>"']+/gi)||[];return [...new Set(found.map(u=>u.replace(/[),.;\]]+$/,'')))].slice(0,60);}
  function candidateDates(source){
    const s=String(source||'').slice(0,120000);const matches=[];let m;
    const regexes=[
      /\b(20\d{2}|19\d{2})-(0?[1-9]|1[0-2])-([0-3]?\d)\b/g,
      /\b([0-3]?\d)\.\s*(0?[1-9]|1[0-2])\.\s*((?:19|20)\d{2})\b/g,
      new RegExp('\\b([0-3]?\\d)\\.?\\s+('+MONTH_RE+')\\s*,?\\s*((?:19|20)\\d{2})\\b','gi'),
      new RegExp('\\b('+MONTH_RE+')\\s+([0-3]?\\d),?\\s*((?:19|20)\\d{2})\\b','gi'),
      new RegExp('\\b('+MONTH_RE+')\\s+([0-3]?\\d)(?!\\s*,?\\s*(?:19|20)\\d{2})\\b','gi'),
      new RegExp('\\b([0-3]?\\d)\\.?\\s+('+MONTH_RE+')(?!\\s*,?\\s*(?:19|20)\\d{2})\\b','gi')
    ];
    regexes.forEach((r,kind)=>{while((m=r.exec(s))!==null){let value=null,precision='day',month,day,year;
      if(kind===0){year=m[1];month=m[2];day=m[3];}
      if(kind===1){day=m[1];month=m[2];year=m[3];}
      if(kind===2){day=m[1];month=MONTHS[m[2].toLowerCase().replace(/\.$/,'')];year=m[3];}
      if(kind===3){month=MONTHS[m[1].toLowerCase().replace(/\.$/,'')];day=m[2];year=m[3];}
      if(kind===4){month=MONTHS[m[1].toLowerCase().replace(/\.$/,'')];day=m[2];precision='partial';}
      if(kind===5){day=m[1];month=MONTHS[m[2].toLowerCase().replace(/\.$/,'')];precision='partial';}
      if(year)value=isoDay(year,month,day);else if(month&&day<=31)value=null;
      if((!year&&month&&day>0&&day<=31)||value){const line=s.slice(s.lastIndexOf('\n',m.index-1)+1,s.indexOf('\n',m.index)>-1?s.indexOf('\n',m.index):s.length).slice(0,350);
        matches.push({value,raw:m[0],precision,offset:m.index,context:line.trim().slice(0,250)});
      }
      if(m.index===r.lastIndex)r.lastIndex++;
    }});
    const out=[];const seen=new Set();for(const x of matches.sort((a,b)=>a.offset-b.offset||((b.value?1:0)-(a.value?1:0)))){
      const k=`${x.offset}:${x.raw}`;if(seen.has(k))continue;seen.add(k);out.push(x);
    }
    return out.slice(0,35);
  }
  function detectEventDate(title,body){
    const text=`${title||''}\n${body||''}`;const candidates=candidateDates(text);
    // Dates are never promoted from generic document headers; only nearby action language is considered.
    const relevant=candidates.filter(c=>/\b(?:closed|opened|arrived|docked|departed|started|starts?|starting|begins?|began|occurred|happened|arrested|detained|seized|attacked|sank|collided|introduced|reintroduced|reinstated|enforced|effective|took place|geschlossen|gesperrt|eröffnet|begann|beginnt|begonnen|festgenommen|verhaftet|eingeführt|wieder eingeführt|beschlagnahmt|ereignete|explodierte|angriff|übernommen)\b/i.test(c.context.slice(Math.max(0,c.context.indexOf(c.raw)-95),Math.min(c.context.length,c.context.indexOf(c.raw)+c.raw.length+95))));
    const full=[...new Set(relevant.filter(c=>c.value).map(c=>c.value))];
    if(full.length===1)return dateObj(full[0],'known','kontextuelle Datumerkennung (ungeprüft)',relevant.find(c=>c.value===full[0]).context,{review_required:true,candidates});
    if(full.length>1)return dateObj(null,'ambiguous','mehrere mögliche Ereignisdaten',null,{review_required:true,candidates});
    if(relevant.some(c=>!c.value))return dateObj(null,'partial','Tag/Monat ohne sichere Jahreszuordnung',null,{review_required:true,precision:'partial',candidates});
    return dateObj(null,candidates.length?'unverified':'unknown',candidates.length?'Datumsangaben vorhanden, Ereignisbezug unklar':'',null,{review_required:candidates.length>0,candidates});
  }
  function detectPublished(text, filename=''){
    const first=String(text||'').slice(0,1200);
    const lines=first.split('\n').slice(0,12);
    const context=lines.filter(x=>/\b(?:ausgabe|edition|issue|veröffentlicht|published|freitag|montag|dienstag|mittwoch|donnerstag|samstag|sonntag|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(x));
    const dates=context.flatMap(x=>candidateDates(x)).filter(x=>x.value);
    const unique=[...new Set(dates.map(x=>x.value))];
    if(unique.length===1)return dateObj(unique[0],'known','Publikationskopf',dates[0].context,{review_required:true,candidates:dates});
    const nameDates=candidateDates(filename).filter(x=>x.value);
    return dateObj(null,unique.length>1?'ambiguous':'unknown',nameDates.length?'Datumsangabe nur im Dateinamen; nicht als Publikationsdatum übernommen':'',null,{review_required:!!nameDates.length,candidates:[...dates,...nameDates]});
  }
  function classify(text){let t=String(text||'');const groups=[['GNSS / Navigation',/\b(?:gnss|gps|jamming|spoofing|navtex|navwarn|ecd[iy]s|navigation|seefahrtswarnung)\b/i],['Maritime Sicherheit',/\b(?:navy|warship|frigate|corvette|military|drohne|drone|marine|sanctions|sabotage|hybrid|espionage|spionage|küstenwache|coast guard)\b/i],['Häfen / Logistik',/\b(?:port|harbour|hafen|container|terminal|freight|reederei|shipping|shipyard|werft|logistik)\b/i],['Energie / Offshore',/\b(?:pipeline|subsea|offshore|windfarm|lng|tanker|kabel|cable|oil|gas)\b/i]];return groups.filter(x=>x[1].test(t)).map(x=>x[0]);}
  function normalizeInput(src){
    const title=trimmed(src.title||'').replace(/\n/g,' ').slice(0,500)||'[OHNE ÜBERSCHRIFT]';
    const cleaning=cleanText(src.text||'');const content=cleaning.text;
    const reportValue=src.report_date&&/^\d{4}-\d{2}-\d{2}$/.test(src.report_date)?src.report_date:(src.reported_at&&dateFromIsoInstant(src.reported_at));
    const report=reportValue?dateObj(reportValue,'known',src.report_basis||'Nachrichten-Zeitstempel',src.reported_raw||'',{review_required:false}):dateObj();
    const event=detectEventDate(title,content);
    const published=src.published_date&&/^\d{4}-\d{2}-\d{2}$/.test(src.published_date)?dateObj(src.published_date,'known',src.published_basis||'Quellendatum',src.published_evidence||'',{review_required:!!src.published_review}):detectPublished(content,src.filename);
    const url=[...new Set([...(src.urls||[]),...getUrls(content)])].slice(0,60);
    const identity=[src.filename||'',src.page||'',title,content].join('|');
    return { schema:SCHEMA,id:'wl_'+hash(identity), title, text:content,original_language:detectLanguage(title+' '+content),source_name:src.source_name||null, source_file:src.filename||null,source_type:src.type||'text',source_page:src.page||null,parent_file:src.parent_file||null, urls:url,
      event_date:event,report_date:report,reported_at:src.reported_at||null,received_at:src.received_at||null, publication_date:published,
      topics:classify(title+'\n'+content), review: [...(src.warnings||[]),...(cleaning.removed_lines?[`Entfernte technische Warn-/Trennzeilen: ${cleaning.removed_lines}`]:[]),...(content?'':['Kein auslesbarer Nachrichtentext'])], policy:'local_only_review_before_reuse',original_message_id:src.message_id||null,original_hash:hash(identity),status:'ungeprüfter Rohdatenhinweis' };
  }
  function mergeIdenticals(items){const seen=new Map(),out=[];let duplicates=0;for(const it of items){let k=hash([it.title.toLowerCase(),it.text.replace(/\s+/g,' ').toLowerCase()].join('|'));if(seen.has(k)){duplicates++;const prev=seen.get(k);prev.review.push(`Identische Importkopie erkannt: ${it.source_file||'manuell'}`);prev.duplicate_sources=[...(prev.duplicate_sources||[]),{filename:it.source_file,page:it.source_page,report_date:it.report_date?.value||null}];continue;}seen.set(k,it);out.push(it);}return {items:out,duplicates};}
  function dateLabel(d,kind){return d&&d.value?d.value:UNKNOWN[kind]||'[DATUM NICHT ERMITTELT]';}
  function asText(items,opts={}){const showContent=opts.includeContent!==false;const lines=['MOwlSINT WHITE LIGHTNING — TEXTDESTILLAT','Kein Lagebild · keine Faktenprüfung · keine KI-Übersetzung','Datumsplatzhalter sind ausdrücklich unbekannte Angaben und dürfen nicht stillschweigend ersetzt werden.',''];
    for(let i=0;i<items.length;i++){const x=items[i];lines.push(`=== MELDUNG ${i+1} / ${items.length} ===`,x.title,`Ereignisdatum: ${dateLabel(x.event_date,'event_date')}${x.event_date.review_required?' [PRÜFEN]':''}`,`Meldedatum: ${dateLabel(x.report_date,'report_date')}`,`Veröffentlichungsdatum: ${dateLabel(x.publication_date,'published_date')}${x.publication_date.review_required?' [PRÜFEN]':''}`,`Meldungszeitpunkt (UTC): ${x.reported_at||'[NICHT ERMITTELT]'}`,`Eingangszeitpunkt (UTC): ${x.received_at||'[NICHT ERMITTELT]'}`,`Quelle: ${x.source_name||'[NICHT ERMITTELT]'}`,`Fundstelle: ${x.source_file||'[MANUELL]'}${x.source_page?' · Seite '+x.source_page:''}${x.parent_file?' · Anhang zu '+x.parent_file:''}`,`Sprache (heuristisch): ${x.original_language||'unbestimmt'}`,`Themen: ${x.topics.join(', ')||'[NICHT ZUGEORDNET]'}`,`Link(s): ${x.urls.join(' | ')||'[KEIN LINK ENTHALTEN]'}`,`Bearbeitungsstatus: ${x.status}`);
      if(x.event_date.basis)lines.push(`Datumsbefund: ${x.event_date.basis}${x.event_date.evidence?' — '+x.event_date.evidence:''}`);
      if(x.review.length)lines.push(`Prüfhinweise: ${x.review.join(' | ')}`);
      if(showContent)lines.push('Originalinhalt (bereinigt, NICHT übersetzt):',x.text||'[KEIN AUSLESBARER TEXT]');lines.push('');
    }return lines.join('\n');}
  function splitManual(t){const s=trimmed(t);if(!s)return [];const parts=s.split(/\n\s*---\s*\n|\n\s*={4,}\s*\n/g).map(x=>x.trim()).filter(Boolean);return parts.map(p=>{const l=p.split('\n');return {title:l[0].slice(0,500),text:l.slice(1).join('\n')||l[0]};});}
  return {SCHEMA,UNKNOWN,isoDay,dayFromRFC,hash,cleanText,getUrls,candidateDates,detectEventDate,detectPublished,normalizeInput,mergeIdenticals,asText,splitManual,dateObj};
});