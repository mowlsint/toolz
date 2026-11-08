'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const C=require('../core.js');
const wlEvent=(id,lang,dt,txt,translation)=>({schema:'mowlsint.white_lightning.event.v1',id,title:'Synthetische Meldung '+id,text:txt,original_language:lang,record_kind:'report_candidate',source_name:'Testquelle',source_file:'test.md',source_page:2,urls:['https://example.org/test'],event_date:{value:dt,status:dt?'known':'unknown',review_required:!!dt,basis:'Testquelle'},report_date:{value:'2026-11-08'},publication_date:{value:'2026-11-07'},translation_de:translation||{title:null,text:null,reviewed:false},review:[]});
const good=wlEvent('wl_good','de','2026-11-06','Hafen meldet einen Testvorfall.');
const noDate=wlEvent('wl_unknown','de',null,'Ein Bericht ohne Ereignisdatum.');
const english=wlEvent('wl_en','en','2026-11-06','A vessel has reportedly arrived.',{title:'Ankunft',text:'Ein Schiff soll angekommen sein.',reviewed:false});
const context={...wlEvent('wl_context','de','2026-11-08','Titelblatt'),record_kind:'document_context'};
const source=JSON.stringify({schema:C.WL_BUNDLE,items:[good,noDate,english,context]});
const first=C.parseWlJson(source);assert.equal(first.entries.length,3);assert.equal(first.contexts.length,1);
assert.equal(first.entries[1].eventDate,'');assert.equal(first.entries[1].reportDate,'2026-11-08');
assert.equal(first.entries[2].originalLanguage,'en');assert.equal(first.entries[2].germanText,'Ein Schiff soll angekommen sein.');assert.equal(first.entries[2].translationReviewed,false);
for(const e of first.entries){e.reviewed=true;e.include=true;}
let out=C.sections(first.entries,{from:'2026-11-02',to:'2026-11-08',cutoff:'2026-11-08'});assert.equal(out.groups.reduce((n,g)=>n+g.items.length,0),1,'Open dates and unreviewed English translation excluded');
out=C.sections(first.entries,{from:'2026-11-02',to:'2026-11-08',cutoff:'2026-11-08',showEnglish:true,showUndated:true});assert.equal(out.english.length,1);assert.equal(out.groups.reduce((n,g)=>n+g.items.length,0),2);
first.entries[2].translationReviewed=true;out=C.sections(first.entries,{from:'2026-11-02',to:'2026-11-08',cutoff:'2026-11-08'});assert.equal(out.groups.reduce((n,g)=>n+g.items.length,0),2);
const report=C.reportText(first.entries,{title:'TEST-WOCHENLAGE',from:'2026-11-02',to:'2026-11-08',cutoff:'2026-11-08'});assert(report.text.includes('TEST-WOCHENLAGE'));assert(!report.text.includes('Ein Bericht ohne Ereignisdatum.'));
assert(!report.text.includes('A vessel has reportedly arrived.'));
const tagged='[EREIGNIS] | DATUM UNKLAR | - | NI | Synthetisches Ereignis | Quelle: Protokoll\n[EXPECTED] | 09.11.2026 | 12:30 | Brake | TEST VESSEL | Kaje 1 | Kies | 100 t | Quelle: Beispiel\n[OSINT] | RUECKBLICK | 06.11.2026 | - | Nordsee | Ein Testhinweis ohne Bestätigung | Quelle: TestOSINT | Link: https://example.org/test';
const p=C.parseTaggedText(tagged,'synthetic.txt');assert.equal(p.entries.length,3);assert.equal(p.entries[0].eventDate,'');assert.equal(p.entries[1].category,'expected');assert.equal(p.entries[2].category,'osint');
for(const e of p.entries){e.reviewed=true;e.include=true;}
const grouped=C.sections(p.entries,{from:'2026-11-01',to:'2026-11-12',cutoff:'2026-11-08',showUndated:true});assert(grouped.groups.some(g=>g.key==='undated'));assert(grouped.groups.some(g=>g.key==='upcoming'));assert(grouped.groups.some(g=>g.key==='osint'));
assert.equal(C.combine(first.entries,[first.entries[0]]).entries.length,3,'No duplicate source ID');
assert.equal(C.mkDate('2026-02-30'),'');assert.equal(C.mkDate('2026-11-08'),'2026-11-08');
const demo=path.resolve(__dirname,'../../../white-lightning-beispielausgabe.md');if(fs.existsSync(demo)){const md=fs.readFileSync(demo,'utf8');const parsed=C.parseWlMarkdown(md);assert.equal(parsed.entries.length,2);assert.equal(parsed.entries.find(e=>e.originalLanguage==='en').germanText,'Behörden berichteten über einen Hinweis, ohne ein gesichertes Ereignisdatum zu nennen.');}
console.log('MOONSHINE TESTS OK: JSON, Markdown, v4.3 types, dates, original/translation, German output, future, dedupe');