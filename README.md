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

Datei auswählen oder Text einfügen, Zielformat wählen und herunterladen. Unterstützt werden WGS-84-Koordinaten in Dezimalgrad, Punkte, Linien, Polygone einschließlich Innenringen sowie Mehrfachgeometrien. CSV-Spalten für Longitude, Latitude und optional Höhe lassen sich zuordnen. MMSI, IMO, Namen und andere Attribute werden übernommen.

Die Austausch-CSV enthält eine Zeile je Objekt, lesbare Attribute und zusätzliche JSON-Spalten für Geometrien, Attribute und IDs. Diese JSON-Spalten sind beim Rückimport maßgeblich und erhalten auch verschachtelte Werte und Datentypen. CSV-Dateien ohne Positions- oder Geometriedaten können nicht in räumliche Daten umgewandelt werden. KML-Stile und Ordnerstruktur werden nicht rekonstruiert; externe NetworkLinks werden nicht geladen. Zeitangaben aus gx:Track bleiben Attribute; KML-Ausgabegeometrien verwenden LineString.

**Offline:** Über „Offline-Version“ eine eigenständige HTML-Datei herunterladen und lokal im Browser öffnen. Der Geo Converter benötigt weder externe Bibliotheken noch Kartenserver. Importierte Datensätze werden nicht in die heruntergeladene Anwendung eingebettet.

**Grenzen:** 30 MB pro Import. Vorschau: maximal 100 Tabellenzeilen, 24 Attributspalten und 12.000 geplottete Positionen; der Export umfasst den vollständigen Datensatz. Die Geometrieansicht ist eine schematische Darstellung ohne Basiskarte. KMZ und die automatische Umrechnung projizierter Koordinaten werden nicht unterstützt.
