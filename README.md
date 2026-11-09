# MOwlSINT TOOLZ

Ein Portal für eigenständige Webwerkzeuge im MOwlSINT-Design (Elfenbein, Dark Navy Blue und Gold).

## Verfügbare Anwendungen

- **Startseite:** https://mowlsint.github.io/toolz/
- **MD ↔ PDF Studio:** https://mowlsint.github.io/toolz/md-pdf/ – Markdown → PDF, PDF → Markdown (PDF.js mit eingebetteten Unicode-Schriftarten), Scan-OCR nur für nicht lesbare Seiten, Bild → PDF und Bild → Markdown per OCR.
- **Geo Converter:** https://mowlsint.github.io/toolz/geo-converter/ – KML, CSV und GeoJSON in alle sechs Richtungen umwandeln; mit Spaltenzuordnung, Tabellen- und schematischer Geometrievorschau sowie Offline-Download.
- **White Lightning:** https://mowlsint.github.io/toolz/white-lightning/ – Lokale Rohdatendestillerie für Outlook-MSG, EML, PDF und Text. Textdestillat und strukturierter JSON-Export mit getrennten Ereignis-, Melde- und Publikationsdaten; ohne KI und ohne Lagebild-Erstellung.
- **Moonshine:** https://mowlsint.github.io/toolz/moonshine/ – Lokale deutschsprachige Lagebildredaktion (v4.4 Testfassung) mit White-Lightning-JSON/MD, Moonshine-v4.3-Klartext, Datumsprüfung, Fachrubriken, PDF/MD/TXT und Arbeitsstand. [Gemeinsame Anleitung](moonshine/ANLEITUNG.md).
- **QSL Card Studio:** https://mowlsint.github.io/toolz/qsl-studio/ – Geprüfte Empfangsberichte in die ausfüllbare MOwlSINT-Retro-QSL-PDF eintragen, Vorschau und PDF-Download.

## GitHub Pages einschalten

1. **Settings → Pages** im Repository öffnen.
2. **Build and deployment → Source:** Deploy from a branch.
3. **Branch:** main, **Folder:** /(root).
4. **Save**.

Danach erscheint die Website unter https://mowlsint.github.io/toolz/.

## Aufbau

- index.html: Portalseite.
- md-pdf/index.html: eigenständiger Markdown-/PDF-Konverter.
- md-pdf/browser-ocr.js: OCR im Browser für eingescannte PDFs.
- geo-converter/index.html: eigenständiger KML-/CSV-/GeoJSON-Konverter ohne externe Abhängigkeiten.
- qsl-studio/index.html: browserbasierter QSL-PDF-Editor mit manueller Freigabe, Vorlagenspeicherung in IndexedDB und Download.

Weitere Tools können später unter eigenen Verzeichnissen ergänzt und von der Startseite aus verlinkt werden.

## Datenschutz und Grenzen

Die Dateien werden **lokal im Browser** verarbeitet und **nicht** auf einen MOwlSINT-Server hochgeladen. Die PDF-Ausgabe erfolgt über den Browser-Druckdialog als „Als PDF speichern“.

Die Konvertierung gescannter PDFs nutzt bei Bedarf **PDF.js** und **Tesseract.js** im Browser. Für den ersten OCR-Aufruf müssen Programmdateien und deutsche/englische Sprachmodelle aus dem Internet geladen werden. Eine dauerhaft vollständig offline funktionsfähige GitHub-Pages-Version ist noch nicht garantiert. OCR-Texte, Tabellen und Zahlen müssen geprüft werden.

Externe Komponenten:
- [Marked](https://marked.js.org/) (MIT, im HTML gebündelt)
- [PDF.js](https://mozilla.github.io/pdf.js/) (3.11.174, bei OCR nachgeladen)
- [Tesseract.js](https://github.com/naptha/tesseract.js) (5.1.1, bei OCR nachgeladen)

## Geo Converter

Datei auswählen oder Text einfügen, Zielformat wählen und herunterladen. Unterstützt werden WGS-84-Koordinaten in Dezimalgrad, Punkte, Linien, Polygone einschließlich Innenringen sowie Mehrfachgeometrien. CSV-Spalten für Longitude, Latitude, optionale Höhe, Schiffsnummer, MMSI, Namen und Zeitangaben lassen sich zuordnen. IMO und ENI werden als alternative Header für **Schiffsnummer** behandelt. Die Werte bleiben Text; es erfolgt weder eine Typbestimmung noch eine automatische Ergänzung verlorener führender Nullen. Sind mehrere Schiffsnummern vorhanden, bleiben sie als getrennte, neutral benannte Felder erhalten.

Die Austausch-CSV enthält eine Zeile je Objekt, lesbare Attribute und zusätzliche JSON-Spalten für Geometrien, Attribute und IDs. Diese JSON-Spalten erhalten auch verschachtelte Werte und Datentypen. Widersprechen sichtbare Tabellenwerte den JSON-Spalten, wird der Import zunächst blockiert. Die Auswahl **Tabellenspalten verwenden** übernimmt sichtbare Änderungen; **JSON-Spalten verwenden** erhält die gespeicherten Originalwerte. Unveränderte und nicht angezeigte Originalattribute bleiben erhalten. Einzelne Positionsspalten können Linien oder Polygone nicht in Punkte umwandeln. CSV-Dateien ohne Positions- oder Geometriedaten können nicht in räumliche Daten umgewandelt werden. KML-Stile und Ordnerstruktur werden nicht rekonstruiert; externe NetworkLinks werden nicht geladen. Zeitangaben aus gx:Track bleiben Attribute; KML-Ausgabegeometrien verwenden LineString.

**Offline:** Über „Offline-Version“ eine eigenständige HTML-Datei herunterladen und lokal im Browser öffnen. Der Geo Converter benötigt weder externe Bibliotheken noch Kartenserver. Importierte Datensätze werden nicht in die heruntergeladene Anwendung eingebettet.

**Grenzen:** 30 MB pro Import. Vorschau: maximal 100 Tabellenzeilen, 24 Attributspalten und 12.000 geplottete Positionen; der Export umfasst den vollständigen Datensatz. Die Geometrieansicht ist eine schematische Darstellung ohne Basiskarte. KMZ und die automatische Umrechnung projizierter Koordinaten werden nicht unterstützt.

### Importprüfung ab Version 1.1

CSV-Importe werden vor dem Export ausdrücklich über **Import bestätigen** freigegeben. Jede Änderung an den Importoptionen hebt die Freigabe auf.

- Alternative Header, Groß-/Kleinschreibung und Leerzeichen werden erkannt. Doppelte oder leere Header erhalten eindeutige Namen; die Änderungen sind sichtbar.
- Die Kopfzeile wird einschließlich möglichem Vorspann gesucht und kann über ihre physische Zeilennummer gewählt werden. Trennzeichen sind wählbar. Mehrzeilige, korrekt geschützte CSV-Felder bleiben ein Datensatz.
- Wiederholte Header im Datenblock werden gemeldet und nur nach Auswahl übersprungen.
- Zeilen mit fehlenden oder zusätzlichen Feldern werden samt Originalfeldern und Zeilennummer angezeigt. Es gibt keine spekulative Verschiebung oder Auffüllung.
- Standard: alle Datensätze müssen gültig sein. **Nur gültige übernehmen** schließt fehlerhafte Datensätze ausdrücklich aus. Der herunterladbare JSON-Prüfbericht enthält die Befunde, Ausschlüsse, gewählte Zuordnung und Zähler.
- Longitude und Latitude lassen sich tauschen. Positionsbereiche werden zur Plausibilitätskontrolle angezeigt. Vertauschte, aber numerisch plausible Koordinaten sind nicht zuverlässig automatisch erkennbar.
- Auffällige MMSI- und Zeitformate werden gemeldet; die ursprünglichen Werte werden bewahrt. Es findet keine Identitätsprüfung statt.
- Dateien können als UTF-8, Windows-1252 oder UTF-16 gelesen werden; UTF-16-BOMs werden automatisch erkannt. Ungültiges UTF-8 erfordert eine ausdrückliche Auswahl der Zeichenkodierung.
- Nicht geschlossene Anführungszeichen bleiben ein harter Fehler, da die folgenden Datensatzgrenzen unklar sind.

Die Prüfung kann nicht jede inhaltliche Spaltenverschiebung erkennen, insbesondere wenn alle Werte in ihren neuen Spalten plausibel aussehen. Der Converter bleibt ein Hilfswerkzeug; die Originalzeilen und Positionsbereiche sollten geprüft werden.

### Prüfen der Konvertierung

Die Regressionstests benötigen nur Node.js und keine zusätzlichen Pakete:

```sh
node geo-converter/tests/converter.test.cjs
```

## QSL Card Studio

Die ursprüngliche **MOwlSINT_Radio_QSL_ausfuellbar.pdf** ist bewusst nicht öffentlich im GitHub-Repository abgelegt. Sie enthält das handgezeichnete New-Orleans-Motiv und **14 ausfüllbare AcroForm-Felder**. Beim ersten Besuch unter `/qsl-studio/` wird die Vorlage über **PDF-Vorlage auswählen** vom eigenen Gerät geöffnet; danach bleibt sie, soweit der Browser Speicherzugriff erlaubt, in IndexedDB auf diesem Gerät erhalten. Auf einem anderen Browser/Gerät muss die Vorlage erneut geladen werden. Das Programm akzeptiert nur die PDF mit den erwarteten Feldnamen.

**Bedienung:** Vorlage einmalig laden, Hörerdaten eingeben, Sendungsdaten und Programminhalt manuell prüfen, Prüfhäkchen setzen, Vorschau erzeugen und `QSL als PDF herunterladen`. Standardmäßig werden die Formulareinträge beim Export festgeschrieben (flattened PDF) – die Empfänger können das PDF nicht versehentlich in einem Formular weiterbearbeiten. E-Mail-Versand ist nicht Teil dieses Tools.

**Datenverarbeitung:** Keine Hörerdaten werden an den Server gesendet, kein serverseitiges Protokoll; die PDF-Verarbeitung erfolgt mit [pdf-lib 1.17.1](https://pdf-lib.js.org/) (MIT) im Browser, das Javascript wird von jsDelivr nachgeladen. Beim blockierten CDN kann das Tool keine PDFs erstellen. Die Vorlage wird lokal im Browser gespeichert, Hörerdaten dagegen nicht dauerhaft gespeichert. Eine Webseite ist öffentlich erreichbar; der PDF-Editor ist daher kein authentifiziertes Ausstellungsportal. Die rein manuelle Prüffreigabe ist keine technische Zugangskontrolle. Für die Ausgabe von QSL-Karten nur selbst überprüfte Empfangsberichte verwenden.

**Zeichensatz:** pdf-lib nutzt hier Times Roman (WinAnsi). Westeuropäische Sonderzeichen wie ä, ö, ü, ß und ã funktionieren, andere Schriften (z. B. Kyrillisch) benötigen eine Erweiterung um eigene Unicode-Fonts und fontkit. Bei nicht unterstützten Zeichen zeigt das Tool eine Fehlermeldung und erstellt nicht stillschweigend eine fehlerhafte Karte.

### Bild-Import

Im Studio **Bild → PDF** wählen, ein oder mehrere PNG/JPG/WEBP/BMP/GIF-Bilder laden und **Als PDF speichern** anklicken. Das resultierende Markdown referenziert die Originalbilder per Dateinamen; beim späteren Öffnen der Markdown-Datei müssen die Bilder im selben Ordner liegen. Über **Bild → MD (OCR)** wird Bildtext erkannt. Bilder und Dokumente werden nicht hochgeladen.

Für PDFs mit eingebetteten Schriften (z. B. Magic-Paws-Berichte mit Type0/Identity-H und Unicode-CMaps) verwendet das Studio PDF.js statt pauschaler OCR. Browser-OCR wird nur auf Seiten ohne auslesbare Textebene oder auf ausdrückliche Anforderung angewendet. Komplexe Tabellen und Spalten nachprüfen.

## Bedienungsanleitungen und Dokumentationspflege

Beide Tools enthalten jetzt einen sichtbaren Einstieg **„? HILFE / ANLEITUNG“** sowie kontextbezogene Hilfe direkt in den Arbeitsbereichen.

- [White Lightning · Browserhilfe](white-lightning/hilfe.html) · [Markdown-Anleitung](white-lightning/ANLEITUNG.md)
- [Moonshine · Browserhilfe](moonshine/hilfe.html) · [gemeinsames Markdown-Handbuch](moonshine/ANLEITUNG.md)
- [Pflege-Checkliste](docs/ANLEITUNGEN_PFLEGE.md) · Prüfskript: `node docs/check-guides.cjs`

Bei jeder nutzerrelevanten Programmänderung sind die entsprechenden Hilfeseiten und Versionshinweise im selben Änderungsvorgang zu aktualisieren. Für Änderungen der Schnittstelle White Lightning → Moonshine zusätzlich `white-lightning/MOONSHINE_IMPORT.md` prüfen.

## Verlinkte Repositories und Weboberflächen

Das TOOLZ-Portal zeigt bei jedem Projekt den GitHub-Quellcode und, soweit die tatsächliche Zieladresse belegt ist, einen separaten Link zur veröffentlichten Webseite.

| Projekt | GitHub-Repository | Weboberfläche | Status |
| --- | --- | --- | --- |
| Voodoo Whiskers | [Repository](https://github.com/mowlsint/VoodooWhiskers) | [GitHub Pages](https://mowlsint.github.io/VoodooWhiskers/public/) | In Magic-Paws-Projektdateien als Kartenlink dokumentiert |
| Magic Paws | [Repository](https://github.com/mowlsint/MagicPaws) | [Cloudflare Pages](https://magicpaws-full-custom.pages.dev/) | In Magic-Paws-Programmkonfiguration als Dashboard-URL hinterlegt; Repository privat |
| Pelican | [Repository](https://github.com/mowlsint/pelican) | Noch kein bestätigter Live-Link | README: Cloudflare-Staging/Produktionsfreigabe stehen aus |
| MARD_HAT | [Repository](https://github.com/mowlsint/mard-hybrid-telemetry) | [Cloudflare Pages](https://mard-hybrid-telemetry.pages.dev/) | In Magic-Paws-Integration als öffentliches Dashboard verlinkt |

**Hinweis:** Die Zieladressen sind anhand der Repository-Dateien geprüft. Eine unabhängige Live-Erreichbarkeitsprüfung der Pages-Websites war in der aktuellen Ausführungsumgebung nicht möglich. Die Einträge verweisen auf Weboberflächen, nicht nur auf den Quellcode.
