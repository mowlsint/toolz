'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Core=require('../wl-core.js');
const Msg=require('../wl-msg.js');
const cases=[
  {name:'Keine Daten aus einer Überschrift erfinden',src:{title:'Port remains closed',text:'No date or URL.'},event:null,report:null},
  {name:'Aus SMTP-Zeit keine Ereigniszeit ableiten',src:{title:'Port closed',text:'Port closures reported without incident date',reported_at:'2026-11-06T10:20:00Z',report_basis:'mail_sent'},event:null,report:'2026-11-06'},
  {name:'Ereignisdatum mit Jahr und Ereignisbezug',src:{title:'Closure',text:'The bridge closed on November 12, 2026.'},event:'2026-11-12',report:null},
  {name:'Teil-Datum ohne Jahr markiert',src:{title:'Swedish government reintroduces control',text:'The new border controls begin on November 12.'},event:null,report:null,status:'partial'},
  {name:'Widersprüchliche Ereigniszeiten markiert',src:{title:'Action',text:'On 5 November 2026, operation starts. From 6 November 2026, an additional operation begins.'},event:null,report:null,status:'ambiguous'},
  {name:'Datumsangabe nicht automatisch als Ereignisdatum',src:{title:'THB 06.11.2026',text:'Publisher reference on 6 November 2026.'},event:null,report:null},
];
for(const t of cases){const r=Core.normalizeInput({filename:'test.txt',...t.src});assert.equal(r.event_date.value,t.event,t.name);assert.equal(r.report_date.value,t.report,t.name);if(t.status)assert.equal(r.event_date.status,t.status,t.name);}
let original=Core.normalizeInput({title:'On 6 November 2026 the vessel docked',text:'The vessel arrived on 6 November 2026.'});assert(Core.asText([original]).includes('Ereignisdatum: 2026-11-06'));
original.event_date=Core.dateObj(null,'unknown');assert(Core.asText([original]).includes(Core.UNKNOWN.event_date));
assert.equal(Core.mergeIdenticals([original,JSON.parse(JSON.stringify(original))]).duplicates,1);
assert.equal(Core.isoDay(2026,2,30),null);
assert.equal(Core.splitManual('A\nBody\n---\nB\nBody2').length,2);
const dir=process.env.WL_MSG_FIXTURE_DIR;
const fixtures=dir&&fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.msg')):[];
for(const filename of fixtures){const b=fs.readFileSync(path.join(dir,filename)),m=Msg.parseMSG(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));assert(m.subject.length>0);assert(m.body.length>0);assert(m.sent_at&&m.received_at);console.log('MSG OK',path.basename(filename).slice(0,48),'Anhänge:',m.attachments.length);for(const a of m.attachments)if(a.filename.toLowerCase().endsWith('.pdf')){assert(a.bytes[0]===37&&a.bytes[1]===80&&a.bytes[2]===68&&a.bytes[3]===70);console.log('PDF-Anhang erkannt',a.filename,a.bytes.length);}}
const german=Core.normalizeInput({filename:'de.txt',title:'Hafen gesperrt',text:'Die Behörden haben den Hafen geschlossen. Weitere Schiffe liegen im Hafen.'});
const english=Core.normalizeInput({filename:'en.txt',title:'Port authorities report',text:'The port authorities say the vessel arrived. The ship remains in the port.'});
assert.equal(german.original_language,'de');assert.equal(english.original_language,'en');
let bilingual=Core.asText([english,german]);
assert(bilingual.indexOf('Hafen gesperrt')<bilingual.indexOf('Port authorities report'),'DE vor EN im TXT');
assert(bilingual.includes('=== ABSCHNITT A')&&bilingual.includes('=== ABSCHNITT B'));
assert(bilingual.includes('Deutsche Fassung: [NICHT VORHANDEN]'));
english.translation_de={title:'Hafenbehörden berichten',text:'Das Schiff ist angekommen.',status:'external_unreviewed',method:'external_manual_paste',reviewed:false};
bilingual=Core.asText([english,german]);
assert(bilingual.includes('Deutsche Fassung (extern eingefügt):'));
assert(bilingual.indexOf('Das Schiff ist angekommen.')<bilingual.indexOf('=== ABSCHNITT B'));
assert(bilingual.indexOf('Port authorities report')>bilingual.indexOf('=== ABSCHNITT B'));
assert.equal((bilingual.match(new RegExp(english.id,'g'))||[]).length>=2,true,'gleiche Ereigniskennung bei Übersetzung und Original');
assert(bilingual.includes('ungeprüft (externes dienstliches Übersetzungsprogramm)'));
const unknown=Core.normalizeInput({title:'XYZ',text:'ABC'});assert.equal(Core.languageGroup(unknown),'other');
assert(Core.asText([unknown]).includes('=== ABSCHNITT C'));
console.log('TESTS OK —',cases.length,'Zeitprüfungen,',fixtures.length,'optionale MSG-Dateien');