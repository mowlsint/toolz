/* MOwlSINT Moonshine — strict local editorial core. No browser dependency, no network, no AI. */
(function(root,factory){ if(typeof module==='object'&&module.exports)module.exports=factory();else root.MoonshineCore=factory(); })(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const WL_BUNDLE='mowlsint.white_lightning.bundle.v1';
const WS='mowlsint.moonshine.workspace.v1';
const CAT={chronik:'Chronologie',osint:'OSINT-Hinweise',control:'Kontrollen',permit:'Genehmigungen / BAFA',ship:'Schiffsverkehr',expected:'Erwartete Schiffsanläufe',force:'WSP-Kräfte / MLZ',other:'Weitere Meldungen'};
const TAG_CAT={'EREIGNIS':'chronik','WSP-KONTROLLLAGE':'control','GENEHMIGUNG':'permit','BAFA-ANLAGE-I':'permit','PSC':'control','PRF':'control','SCHIFF':'ship','EXPECTED':'expected','MLZ-NORDSEE':'ship','MLZ-WSP':'force','OSINT':'osint'};
const mkDate=(x)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(x||''))return '';const [y,m,d]=x.split('-').map(Number),a=new Date(Date.UTC(y,m-1,d));return a.getUTCFullYear()===y&&a.getUTCMonth()===m-1&&a.getUTCDate()===d?x:'';};
const normalize=s=>String(s??'').trim();
const hash=s=>{let n=2166136261;for(const c of String(s)){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}return (n>>>0).toString(16).padStart(8,'0');};
const dateDe=s=>{const x=mkDate(s);return x?x.slice(8,10)+'.'+x.slice(5,7)+'.'+x.slice(0,4):'[EREIGNISDATUM NICHT ERMITTELT]';};
const validTime=x=>/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(x||'')?x:'';
function newEntry(input={}){
 const e={id:String(input.id||'ms_'+hash(JSON.stringify(input))),origin:String(input.origin||'manual'),originalId:input.originalId||null,
 title:normalize(input.title||''),originalText:String(input.originalText||''),originalLanguage:['de','en','gemischt','unbestimmt'].includes(input.originalLanguage)?input.originalLanguage:'unbestimmt',
 germanText:String(input.germanText||''),translationReviewed:!!input.translationReviewed,
 category:CAT[input.category]?input.category:'osint',recordKind:input.recordKind==='document_context'?'document_context':'report_candidate',
 eventDate:mkDate(input.eventDate),eventTime:validTime(input.eventTime),eventDateStatus:normalize(input.eventDateStatus||'unknown'),eventDateEvidence:normalize(input.eventDateEvidence||''),
 reportDate:mkDate(input.reportDate),publicationDate:mkDate(input.publicationDate),receivedAt:normalize(input.receivedAt||''),
 sourceName:normalize(input.sourceName||''),sourceFile:normalize(input.sourceFile||''),sourcePage:input.sourcePage??null,sourcePageEnd:input.sourcePageEnd??null,sourceSection:normalize(input.sourceSection||''),
 urls:(Array.isArray(input.urls)?input.urls:[]).filter(x=>typeof x==='string'&&/^https?:\/\//i.test(x)).slice(0,24),
 originalSources:Array.isArray(input.originalSources)?input.originalSources.slice(0,32):[],warnings:(Array.isArray(input.warnings)?input.warnings:[]).filter(x=>typeof x==='string'),
 reviewed:!!input.reviewed,include:!!input.include,reviewNote:normalize(input.reviewNote||''),vessel:normalize(input.vessel||''),imo:normalize(input.imo||''),port:normalize(input.port||''),region:normalize(input.region||''),status:normalize(input.status||'ungeprüft')};
 if(!e.eventDate)e.eventDateStatus=e.eventDateStatus==='known'?'unknown':e.eventDateStatus;
 if(e.recordKind==='document_context')e.include=false;
 return e;
}
function fromWlRecord(r){
 if(!r||typeof r!=='object'||!String(r.id||'').trim())throw Error('White-Lightning-Datensatz ohne ID');
 const d=r.event_date||{},tr=r.translation_de||{},lang=r.original_language||'unbestimmt';
 return newEntry({id:r.id,originalId:r.id,origin:'white-lightning',title:r.title,originalText:r.text,originalLanguage:lang,
 germanText:lang==='de'?r.text:(tr.text||''),translationReviewed:lang==='de'||!!tr.reviewed,
 category:'osint',recordKind:r.record_kind, eventDate:d.value,eventDateStatus:d.status||'unknown',eventDateEvidence:[d.basis,d.evidence].filter(Boolean).join(' — '),
 reportDate:r.report_date?.value,publicationDate:r.publication_date?.value,receivedAt:r.received_at,
 sourceName:r.source_name,sourceFile:r.source_file,sourcePage:r.source_page,sourcePageEnd:r.source_page_end,sourceSection:r.source_section,
 urls:r.urls,originalSources:r.source_origins,warnings:[...(r.review||[]),...(d.review_required?['Ereignisdatum muss anhand der Quelle geprüft werden.']:[])],
 status:r.status});
}
function parseWlJson(text){let data;try{data=JSON.parse(text)}catch{throw Error('Ungültige JSON-Datei')}
 if(!data||data.schema!==WL_BUNDLE||!Array.isArray(data.items))throw Error('Kein White-Lightning-JSON-Bundle v1');
 if(data.items.length>5000)throw Error('Mehr als 5000 Einträge: Bitte aufteilen');
 const entries=[],contexts=[],warnings=[],seen=new Set();
 for(const r of data.items){try{if(r.schema&&r.schema!=='mowlsint.white_lightning.event.v1')throw Error('Unbekanntes Ereignisschema');const x=fromWlRecord(r);if(seen.has(x.id)){warnings.push('Doppelte Meldungs-ID '+x.id+' übersprungen');continue;}seen.add(x.id);(x.recordKind==='document_context'?contexts:entries).push(x);}catch(e){warnings.push('Datensatz konnte nicht übernommen werden: '+e.message)}}
 return {entries,contexts,warnings,format:'wl-json'};
}
function unescapeMd(s){return String(s||'').replace(/\\([_\\*`])/g,'$1');}
function parseMdBlock(s){
 const get=k=>{const re=new RegExp('^\\s*-\\s*\\*\\*'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+':\\*\\*\\s*(.*)$','m');return unescapeMd((s.match(re)||[])[1]||'').trim()};
 const getText=()=>{const lines=s.split('\n');let start=lines.findIndex(l=>/^####\s+(?:Originalinhalt|Deutsche Fassung)/i.test(l));if(start<0)return '';for(let i=start+1;i<lines.length;i++){const f=lines[i].match(/^\s*(`{3,}|~{3,})(?:text)?\s*$/);if(f){const ch=f[1][0],len=f[1].length;let end=i+1;while(end<lines.length&&!new RegExp('^\\s*'+(ch==='`'?'`':'~')+'{'+len+',}\\s*$').test(lines[end]))end++;if(end===lines.length)throw Error('Inhalts-Codeblock nicht geschlossen');return lines.slice(i+1,end).join('\n')}}return ''};
 const date=(name)=>mkDate(get(name));const status=get('Ereignisdatum — Status');
 return {title:(s.match(/^###\s+(.+)$/m)||[])[1]||'', text:getText(), recordKind:get('Datensatztyp'), lang:get('Originalsprache'),
 eventDate:date('Ereignisdatum'),eventDateStatus:status||'unknown',reportDate:date('Meldedatum'),publicationDate:date('Veröffentlichungsdatum'),
 sourceName:get('Quelle'),sourceFile:get('Quelldatei'),sourceSection:get('Quellabschnitt'),sourcePage:Number(get('Seite von'))||null,sourcePageEnd:Number(get('Seite bis'))||null,
 links:get('Links').split(' | ').filter(x=>/^https?:\/\//.test(x)),reviewNotes:get('Prüfhinweise')};
}
function parseWlMarkdown(text){if(!/^\s*<!-- WL_FORMAT: mowlsint\.white_lightning\.markdown\.v1 -->/.test(text||''))throw Error('Keine White-Lightning-Markdown-Datei mit Formatkennung');
 const chunks=[],re=/<!-- WL_RECORD_START id="([A-Za-z0-9_-]+)" variant="(original|de_translation)" -->\s*([\s\S]*?)\s*<!-- WL_RECORD_END -->/g;let m;
 while((m=re.exec(text))!==null){chunks.push({id:m[1],variant:m[2],raw:m[3]});if(chunks.length>8000)throw Error('Zu viele Markdown-Datensätze')}
 const starts=(text.match(/<!-- WL_RECORD_START\b/g)||[]).length,ends=(text.match(/<!-- WL_RECORD_END -->/g)||[]).length;
 if(!chunks.length||starts!==chunks.length||ends!==chunks.length)throw Error('Datensatzmarkierungen fehlen oder sind beschädigt');
 const byId=new Map(),warnings=[];for(const ch of chunks){let parsed=parseMdBlock(ch.raw),o=byId.get(ch.id)||{id:ch.id};if(ch.variant==='original'){if(o.original)throw Error('Mehrfaches Original zur ID '+ch.id);o.original=parsed;}else{if(o.translation)throw Error('Mehrfache Übersetzung zur ID '+ch.id);o.translation=parsed;}byId.set(ch.id,o)}
 const entries=[],contexts=[];for(const o of byId.values()){if(!o.original){warnings.push('Übersetzung ohne englisches Original: '+o.id+' – übersprungen');continue}const a=o.original;const rec=newEntry({id:o.id,originalId:o.id,origin:'white-lightning-md',title:a.title,originalText:a.text,originalLanguage:a.lang,
 germanText:a.lang==='de'?a.text:(o.translation?.text||''),translationReviewed:a.lang==='de'||/manuell geprüft/i.test(o.translation?.raw||''),
 category:'osint',recordKind:a.recordKind,eventDate:a.eventDate,eventDateStatus:a.eventDateStatus,reportDate:a.reportDate,publicationDate:a.publicationDate,
 sourceName:a.sourceName,sourceFile:a.sourceFile,sourcePage:a.sourcePage,sourcePageEnd:a.sourcePageEnd,sourceSection:a.sourceSection,urls:a.links,
 warnings:[a.reviewNotes,...(o.translation?['Übersetzung aus MD übernommen; Prüfstatus bitte nachkontrollieren.']:[])].filter(Boolean)});
 (rec.recordKind==='document_context'?contexts:entries).push(rec)}
 return {entries,contexts,warnings,format:'wl-md'};
}
function deToISO(v){const s=normalize(v);if(/\b(?:DATUM UNKLAR|NICHT ERMITTELT|UNBEKANNT|-)\b/i.test(s)||s==='-')return '';let m=s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?mkDate(m[3]+'-'+m[2]+'-'+m[1]):mkDate(s)}
function parseTaggedText(text,filename='Manuelle Eingabe'){
 const entries=[],warnings=[],seen=new Set(),lines=String(text||'').replace(/\r/g,'').split('\n');for(let i=0;i<lines.length;i++){const raw=lines[i].trim();if(!raw||raw.startsWith('#'))continue;const m=raw.match(/^\[([A-Z-]+)\]\s*\|\s*(.+)$/);if(!m){warnings.push(`Zeile ${i+1} ignoriert: keine bekannte [TYP]-Zeile`);continue}const tag=m[1],cat=TAG_CAT[tag];if(!cat){warnings.push(`Zeile ${i+1}: unbekannter Typ ${tag}`);continue}const f=m[2].split('|').map(x=>x.trim());const offset=tag==='OSINT'?1:0,expectedFields=tag==='OSINT'?6:5;
 if(f.length<expectedFields){warnings.push(`Zeile ${i+1}: zu wenig Felder für ${tag}`);continue}
 const eventDate=deToISO(f[offset]),time=validTime(f[offset+1]),region=normalize(f[offset+2]==='-'?'':f[offset+2]);let contentFields=f.slice(offset+3);const srcIndex=contentFields.findIndex(x=>/^Quelle\s*:/i.test(x));const content=contentFields.slice(0,srcIndex<0?contentFields.length:srcIndex).filter(x=>x&&x!=='-');const sourceField=(srcIndex<0?'':contentFields[srcIndex]||'').replace(/^Quelle\s*:/i,'').trim();const urls=contentFields.filter(x=>/^Link\s*:/i.test(x)).map(x=>x.replace(/^Link\s*:/i,'').trim()).filter(x=>/^https?:\/\//.test(x));
 const contentText=content.join(' · ');if(!contentText){warnings.push(`Zeile ${i+1}: ohne Meldungstext`);continue}
 const id='typed_'+hash(tag+'|'+raw);if(seen.has(id)){warnings.push(`Zeile ${i+1}: identischer Datensatz übersprungen`);continue}seen.add(id);
 const entry=newEntry({id,origin:'moonshine-v43-tags',title:tag+' · '+region,originalText:contentText,originalLanguage:'de',germanText:contentText,translationReviewed:true,category:cat,
 eventDate,eventDateStatus:eventDate?'known':'unknown',eventTime:time,region,sourceName:sourceField||'Nicht ermittelt',sourceFile:filename,sourceSection:'Zeile '+(i+1),urls,reviewNote:'Getaggte Eingabe nach Moonshine v4.3 – Aussage fachlich prüfen.',
 warnings:[...(eventDate?[]:['Ereignisdatum nicht vorhanden oder ungültig.']),...(tag==='OSINT'?['OSINT bleibt von der behördlichen Chronologie getrennt; konkreten europäischen Ereignisort manuell prüfen.']:[])],status:'Getaggter Klartext · ungeprüft'});
 if(tag==='OSINT')entry.kindHint=f[0]==='AUSBLICK'?'AUSBLICK':'RUECKBLICK';if(tag==='SCHIFF'||tag==='EXPECTED'||tag==='MLZ-NORDSEE')entry.vessel=f[offset+3]||'';
 entries.push(entry)}return {entries,contexts:[],warnings,format:'tagged-v43'};
}
function combine(existing,incoming){const result=[...existing],seen=new Set(existing.map(e=>e.id)),warnings=[];const keys=new Map();for(const x of existing){const k=(x.originalText||'').replace(/\s+/g,' ').trim().toLowerCase();if(k.length>40)keys.set(k,x.id)}for(const e of incoming){if(seen.has(e.id)){warnings.push('Meldung '+e.id+' bereits vorhanden; nicht doppelt importiert.');continue}const k=(e.originalText||'').replace(/\s+/g,' ').trim().toLowerCase();if(k.length>40&&keys.has(k))warnings.push('Mögliche wortgleiche Dublette '+e.id+' zu '+keys.get(k)+' – nicht automatisch zusammengeführt.');if(k.length>40&&!keys.has(k))keys.set(k,e.id);result.push(e);seen.add(e.id)}return {entries:result,warnings}}
function sections(items,cfg={}){
 const flags={showUndated:!!cfg.showUndated,showEnglish:!!cfg.showEnglish,includeOutside:!!cfg.includeOutside};const cutoff=mkDate(cfg.cutoff)||'',from=mkDate(cfg.from)||'',to=mkDate(cfg.to)||'';
 const groups=[['chronik','Chronologie'],['control','Kontrollen (WSP / PSC / PRF)'],['permit','Genehmigungen / BAFA'],['ship','Schiffsverkehr / MLZ Nordsee'],['force','WSP-Kräfte'],['expected','Erwartete Schiffsanläufe'],['upcoming','Kommende Ereignisse'],['osint','OSINT-Hinweise – gesondert, nicht behördlich bestätigt'],['other','Weitere Meldungen'],['undated','Datumsangaben ungeklärt – nicht chronologisch zugeordnet']];
 const map=new Map(groups.map(([k])=>[k,[]]));const english=[],rejected=[];
 for(const e of items){if(!e.include||e.recordKind==='document_context')continue;
  if(!e.reviewed){rejected.push({id:e.id,reason:'Redaktionell nicht freigegeben'});continue}
  const valid=mkDate(e.eventDate), german=normalize(e.germanText);
  if(e.originalLanguage==='en'&&(!german||!e.translationReviewed)){rejected.push({id:e.id,reason:'Deutsche Übersetzung fehlt oder ist nicht geprüft'});if(flags.showEnglish)english.push(e);continue}
  if(!german){rejected.push({id:e.id,reason:'Deutscher Meldungstext fehlt'});continue}
  if(!valid){if(flags.showUndated)map.get('undated').push(e);else rejected.push({id:e.id,reason:'Ereignisdatum ungeklärt'});continue}
  if(!flags.includeOutside&&((from&&valid<from)||(to&&valid>to))){rejected.push({id:e.id,reason:'Außerhalb des Berichtszeitraums'});continue}
  let category=CAT[e.category]?e.category:'other';if((category==='expected'||category==='permit')&&cutoff&&valid>cutoff)category='upcoming';
  map.get(category).push(e);
  if(flags.showEnglish&&e.originalLanguage==='en')english.push(e);
 }
 for(const arr of map.values())arr.sort((a,b)=>a.eventDate.localeCompare(b.eventDate)||a.eventTime.localeCompare(b.eventTime)||a.id.localeCompare(b.id));
 return {groups:groups.map(([key,label])=>({key,label,items:map.get(key)})).filter(x=>x.items.length),english,rejected};
}
function reportText(entries,cfg={},markdown=true){const s=sections(entries,cfg);const line=[];const nl=()=>line.push('');const heading=(n,t)=>line.push(markdown?'#'.repeat(n)+' '+t:t.toUpperCase());
 heading(1,cfg.title||'WOCHENLAGE');line.push((cfg.office||'Dienststelle nicht angegeben')+' · Zeitraum '+dateDe(cfg.from)+' bis '+dateDe(cfg.to)+' · Stichtag '+dateDe(cfg.cutoff));nl();
 line.push('Redaktionell zusammengestellte Meldungen. Quellen und Datumsangaben prüfen; OSINT ist keine behördliche Bestätigung.');nl();
 for(const g of s.groups){heading(2,g.label);nl();for(const e of g.items){heading(3,(e.eventDate?dateDe(e.eventDate):'[EREIGNISDATUM NICHT ERMITTELT]')+(e.eventTime?' · '+e.eventTime:'')+(e.title?' — '+e.title:''));nl();line.push(normalize(e.germanText));nl();const src=[e.sourceName,e.sourceFile,e.sourcePage?'S. '+e.sourcePage+(e.sourcePageEnd&&e.sourcePageEnd!==e.sourcePage?'–'+e.sourcePageEnd:''):''].filter(Boolean).join(' · ');line.push((markdown?'**Quelle:** ':'Quelle: ')+(src||'[QUELLE NICHT ERMITTELT]')+' · Meldungs-ID: '+e.id);if(e.reportDate)line.push('Meldedatum: '+dateDe(e.reportDate));if(e.publicationDate)line.push('Veröffentlichungsdatum: '+dateDe(e.publicationDate));if(e.eventDateStatus&&e.eventDateStatus!=='known')line.push('Datumsstatus: '+e.eventDateStatus);if(e.reviewNote)line.push('Redaktionsvermerk: '+e.reviewNote);if(e.urls.length)line.push('Links: '+e.urls.join(' | '));nl();}}
 if(cfg.showEnglish&&s.english.length){heading(2,'Englischer Originalanhang (keine zusätzliche Meldungsbestätigung)');nl();for(const e of s.english){heading(3,e.id+' — '+e.title);nl();line.push(e.originalText||'[KEIN ORIGINALTEXT]');nl();line.push('Quelle: '+[e.sourceName,e.sourceFile].filter(Boolean).join(' · '));nl();}}
 return {text:line.join('\n').trim()+'\n',sections:s,stats:{included:s.groups.reduce((n,g)=>n+g.items.length,0),english:s.english.length,excluded:s.rejected.length}};
}
return {WL_BUNDLE,WS,CAT,TAG_CAT,mkDate,dateDe,newEntry,parseWlJson,parseWlMarkdown,parseTaggedText,combine,sections,reportText};
});