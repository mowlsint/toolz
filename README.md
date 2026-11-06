# MOwlSINT TOOLZ

Ein Portal für eigenständige Webwerkzeuge im MOwlSINT-Design (Elfenbein, Dark Navy Blue und Gold).

## Verfügbare Anwendungen

- **Startseite:** https://mowlsint.github.io/toolz/
- **MD ↔ PDF Studio:** https://mowlsint.github.io/toolz/md-pdf/ – Markdown → PDF, PDF → Markdown und Browser-OCR für Scan-PDFs.
- **Geo Converter:** https://mowlsint.github.io/toolz/geo-converter/ – KML, CSV und GeoJSON in alle sechs Richtungen umwandeln; mit Spaltenzuordnung, Tabellen- und schematischer Geometrievorschau sowie Offline-Download.

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
