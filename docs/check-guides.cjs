#!/usr/bin/env node
/* Verifiziert die eingebauten Hilfe-Einstiege und Abschnittsanker ohne externe Pakete. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const base=path.join(__dirname,'..');
const get=p=>fs.readFileSync(path.join(base,p),'utf8');
const specs=[
 {dir:'white-lightning',version:'1.3',ids:['import','pdf-ocr','datumspruefung','artikelgrenzen','sprachen','export']},
 {dir:'moonshine',version:'4.4',ids:['moonshine-guide','moonshine-zeitraum','moonshine-import','moonshine-pruefen','moonshine-optionen','moonshine-export','moonshine-arbeitsstand']}
];
let fails=0;
function assert(ok,what){if(!ok){console.error('FEHLER:',what);fails++;}}
for(const s of specs){
 const ui=get(s.dir+'/index.html'),guide=get(s.dir+'/hilfe.html'),md=get(s.dir+'/ANLEITUNG.md');
 assert(ui.includes('href="./hilfe.html'),'Hilfelink fehlt: '+s.dir);
 assert(ui.includes('? HILFE / ANLEITUNG'),'Hilfelink nicht sichtbar: '+s.dir);
 assert(ui.includes(s.version),'Produktversion fehlt: '+s.dir);
 assert(guide.includes(s.version),'Hilfenversion stimmt nicht: '+s.dir);
 assert(md.includes(s.version),'Markdownversion stimmt nicht: '+s.dir);
 assert(/Stand:\s*<\/strong>|Stand:\*\*/.test(guide+'\n'+md),'Dokumentationsstand fehlt: '+s.dir);
 for(const id of s.ids)assert(guide.includes('id="'+id+'"'),'Anker fehlt: '+s.dir+'#'+id);
 for(const m of ui.matchAll(/href="\.\/hilfe\.html#([a-z-]+)"/g))assert(guide.includes('id="'+m[1]+'"'),'UI verweist auf nicht vorhandenen Hilfe-Anker: '+s.dir+'#'+m[1]);
}
const moon=get('moonshine/hilfe.html');
assert(moon.includes('../white-lightning/hilfe.html'),'Verweis zur White-Lightning-Hilfe fehlt');
const white=get('white-lightning/hilfe.html');
assert(white.includes('../moonshine/hilfe.html#moonshine-guide'),'Verweis zur Moonshine-Hilfe fehlt');
assert(get('docs/ANLEITUNGEN_PFLEGE.md').includes('Versionsverlauf'),'Pflege-Checkliste fehlt');
if(fails){process.exitCode=1;}else console.log('HILFE-PRÜFUNG OK: beide Tools, Versionslabels und Hilfe-Verweise.');
