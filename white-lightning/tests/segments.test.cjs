'use strict';
const assert=require('node:assert/strict');
const D=require('../wl-document');
const C=require('../wl-core');
const sampleMD='# Lagebild\n\nEinführung\n\n## Erste Meldung\nDie erste Nachricht mit mehr Text und einzelnen Details.\n\n## Zweite Meldung\nThe second item states that no date was provided.';
const md=D.splitText(sampleMD,'test.md','md');
assert.equal(md.length,3);assert.match(md[1].text,/Die erste Nachricht/);assert.match(md[2].text,/The second item/);
assert.equal(D.splitText('Erste\nA\n---\nZweite\nB','test.txt','txt').length,2);
assert.equal(D.splitText('Einzelartikel\nNur ein Abschnitt.','test.txt','txt').length,1);
const front='---\nreport: maritime\n---\n\n# News\n\n## Meldung A\nText A\n\n## Meldung B\nText B';
assert.equal(D.splitText(front,'test.md','md').length,3);
const fenced='# Overview\n\n```\n## no title\n```\n\n## Real A\nText A\n\n## Real B\nText B';
assert.equal(D.splitText(fenced,'test.md','md').length,3);
function item(str,x,y,width=75,size=10){return {str,width,transform:[size,0,0,size,x,y]};}
const words=[];for(let i=0;i<32;i++){words.push(item('Left side text long enough for paragraph '+i,40,720-15*i,230));words.push(item('Right side data block '+i,340,720-15*i,200));}
const blocks=D.pdfPage(words,600,800,3);assert(blocks.length>=2,'Seite mit zwei Spalten wird getrennt');assert(blocks[0].text.includes('Left side'));assert(blocks[blocks.length-1].text.includes('Right side'));
assert(!blocks[0].text.includes('Right side'),'Keine zeilenweise Vermischung zweier Spalten');
const empty=D.pdfPage([],600,800,1);assert.equal(empty[0].method,'scan_needed');
const a=C.normalizeInput({title:'Date missing',text:'No date here.',filename:'report.md',section:'Abschnitt 2/3',extraction_method:'heading_candidate'});
assert.equal(a.source_section,'Abschnitt 2/3');assert.equal(a.extraction_method,'heading_candidate');assert.equal(a.event_date.value,null);
console.log('DOCUMENT SEGMENT TESTS OK — Markdown/TXT, YAML, code fences, PDF columns, scan fallback, provenance');
const structured=D.splitLabeledReports([
 {page:1,blocks:[{text:'VeRIL-AI Maritime Intelligence Export\n[2026-11-06 01:13] SMUGGLING | Code C3\nFirst title\nDE: Detail one'}]},
 {page:2,blocks:[{text:'continuation of first item\n[2026-11-05 18:50] SECURITY | Code C2\nSecond title\nEN: Detail two'}]}
], 'source.pdf');
assert.equal(structured.length,3,'Dokumentkopf und zwei Einträge');
assert.equal(structured[1].pageEnd,2,'Meldung über Seitengrenze');
assert.equal(structured[1].reportDate,'2026-11-06');
assert.equal(structured[2].reportDate,'2026-11-05');
assert(D.splitText('[2026-11-06 01:13] SECURITY | A\nTitle\nBody\n[2026-11-05 18:50] SECURITY | B\nAnother title\nBody','notes.txt','txt').length===2);
const header=C.normalizeInput({title:'Berichtskopf',text:'Internes Briefing',type:'document_preamble'});
assert.equal(header.record_kind,'document_context');