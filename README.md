# MOwlSINT TOOLZ

Ein Portal für eigenständige Webwerkzeuge im MOwlSINT-Design (Elfenbein, Dark Navy Blue und Gold).

## Verfügbare Anwendungen

- **Startseite:** https://mowlsint.github.io/toolz/
- **MD ↔ PDF Studio:** https://mowlsint.github.io/toolz/md-pdf/ – Markdown → PDF, PDF → Markdown und Browser-OCR für Scan-PDFs.

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

Weitere Tools können später unter eigenen Verzeichnissen ergänzt und von der Startseite aus verlinkt werden.

## Datenschutz und Grenzen

Die Dateien werden **lokal im Browser** verarbeitet und **nicht** auf einen MOwlSINT-Server hochgeladen. Die PDF-Ausgabe erfolgt über den Browser-Druckdialog als „Als PDF speichern“.

Die Konvertierung gescannter PDFs nutzt bei Bedarf **PDF.js** und **Tesseract.js** im Browser. Für den ersten OCR-Aufruf müssen Programmdateien und deutsche/englische Sprachmodelle aus dem Internet geladen werden. Eine dauerhaft vollständig offline funktionsfähige GitHub-Pages-Version ist noch nicht garantiert. OCR-Texte, Tabellen und Zahlen müssen geprüft werden.

Externe Komponenten:
- [Marked](https://marked.js.org/) (MIT, im HTML gebündelt)
- [PDF.js](https://mozilla.github.io/pdf.js/) (3.11.174, bei OCR nachgeladen)
- [Tesseract.js](https://github.com/naptha/tesseract.js) (5.1.1, bei OCR nachgeladen)
