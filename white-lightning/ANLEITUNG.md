# White Lightning – Bedienungsanleitung (Version 1.3)

**Stand:** 8. November 2026. **Zweck:** Lokale Rohdatendestillation, kein Lagebild. Die deutsche Wochenlage wird separat mit [Moonshine](../moonshine/) erstellt.

**Im Browser lesen:** [Hilfe innerhalb von White Lightning](hilfe.html). **Moonshine-Anleitung:** [Moonshine-Hilfe](../moonshine/hilfe.html).

## White Lightning – Rohdatendestillat herstellen

**Öffnen:** https://mowlsint.github.io/toolz/white-lightning/

### Schritt 1 – Dateien importieren

Im Bereich **„01 · Rohdaten einlesen“** mit der Dateiauswahl oder per Drag & Drop Dateien übernehmen. Unterstützt sind `.msg`, `.eml`, `.pdf`, `.txt`, `.md`, `.html`, `.json` und `.jsonl` (bis 40 MB je Datei). Bei lesbaren Outlook-Nachrichten können unterstützte Anhänge mit übernommen werden.

Alternativ im Bereich **„02 · Text manuell eingeben“** eine Quelle angeben, einen Alert hineinkopieren und **„Text übernehmen“** anklicken. Mehrere Meldungen können durch eine eigene Zeile mit `---` getrennt werden.

Bei Markdown dienen wiederkehrende Überschriften, bei TXT erkennbare Nummerierungen oder Trennlinien als **Vorschläge** für Abschnittsgrenzen; sie sind noch nicht automatisch fachlich geprüft.

### Schritt 2 – PDF und OCR richtig behandeln

- **Text-PDF:** Direkt importieren. Bei mehreren Spalten werden zunächst Textblöcke erkannt. Das ist noch **keine garantiert richtige Artikeltrennung**.
- **Strukturierter Bericht:** Wiederholte datierte Meldungsköpfe können Einzelmeldungen bilden und über Seitenumbrüche reichen. Die Kopfzeit ist nicht automatisch die Ereigniszeit.
- **Scan-PDF ohne Textebene:** Mit einer zugelassenen OCR-Anwendung zu `.md` oder `.txt` verarbeiten, dann dieses Ergebnis in White Lightning laden.

Das vorhandene [MD ↔ PDF Studio](https://mowlsint.github.io/toolz/md-pdf/) besitzt Browser-OCR. Diese lädt beim ersten Einsatz jedoch Tesseract.js und Sprachdaten aus dem Internet. **Auf einem gesperrten Dienstrechner** kann dies untersagt oder technisch blockiert sein. In diesem Fall ausschließlich die dienstlich zugelassene OCR verwenden. White Lightning selbst lädt keine OCR-Modelle.

**Ebenfalls beachten:** White Lightning lädt beim direkten PDF-Import PDF.js von einem externen CDN. Ist diese Bibliothek im Dienstnetz gesperrt, das PDF mit zugelassenen Mitteln in TXT/MD umwandeln. Der TXT-/MD-Import benötigt diese PDF-Bibliothek nicht.

### Schritt 3 – Einzelmeldungen und Daten prüfen

Im Bereich **„03 · Meldungen prüfen“** jede importierte Meldung durchsehen. Kontrollieren, ob Überschrift, Inhalt und Originalquelle zusammengehören und ob Spalten vermischt wurden.

- **Ereignisdatum:** Tatsächlicher Tag des Sachverhalts. Fehlt ein belastbarer Beleg, Platzhalter bestehen lassen.
- **Meldedatum:** Zeitpunkt der Nachricht beziehungsweise des Versands.
- **Veröffentlichungsdatum:** Datum der Quelle oder PDF-Ausgabe.
- **Sprache:** Deutsch, Englisch oder ungeklärt; falsch erkannte Sprache korrigieren.
- **Prüfhinweise:** Insbesondere Artikelgrenzen, OCR, Zahlen, unvollständige Daten und Dubletten kontrollieren.

Beispiel: Ein Artikel erscheint am 6. November, berichtet aber nur über eine „derzeitige“ Umleitung. **Veröffentlichungsdatum: 06.11.2026**, **Ereignisdatum: [EREIGNISDATUM NICHT ERMITTELT]**. Das Veröffentlichungsdatum wird nicht zum Ereignisdatum.

### Schritt 4 – Fehlerhafte Artikelgrenzen korrigieren

**Aufteilen:** In den bearbeitbaren Rohtext zwischen zwei Sachverhalte auf eine eigene Zeile `[[WL-TRENNEN]]` schreiben. **„Am Marker aufteilen“** klicken.

**Zusammenführen:** Beim betreffenden Datensatz einen zweiten passenden Abschnitt **derselben Quelldatei und Originalsprache** auswählen und **„Ausgewählte Abschnitte zusammenführen“** anklicken. Danach Textreihenfolge und Datumsangaben prüfen. Differierende Datumsangaben bleiben als Konflikt sichtbar. Ursprung und neue Meldungskennungen bleiben nachvollziehbar.

**Rückgängig:** Über **„Letzte Teilung / Zusammenführung rückgängig“** die jüngsten Grenzkorrekturen zurücknehmen. Vor umfangreichen Änderungen den aktuellen JSON-Stand sichern.

### Schritt 5 – Englisch behandeln

White Lightning sortiert die Ausgabe wie vereinbart:

- **Abschnitt A:** Deutsche Originalmeldungen und eingefügte deutsche Übersetzungen.
- **Abschnitt B:** Alle englischen Originalmeldungen – auch wenn eine deutsche Übersetzung vorliegt.
- **Abschnitt C:** Unklare/gemischte Sprachen zur Prüfung.

Bei einer englischen Meldung **„Englischen Originaltext kopieren“** verwenden, in ein **dienstlich zugelassenes Übersetzungsprogramm** einfügen und die erhaltene deutsche Fassung zurück in die Übersetzungsfelder der Meldung kopieren. Erst nach Vergleich mit dem Original **„Übersetzung manuell geprüft“** markieren. Original und Übersetzung behalten dieselbe Meldungs-ID. White Lightning startet keine Übersetzungssoftware und lädt keine Modelle herunter.

### Schritt 6 – Ausgabe exportieren

Im Bereich **„04 · Textdestillat exportieren“**:

| Schaltfläche | Verwendung |
| --- | --- |
| **TXT herunterladen** | Direkt lesbarer und kopierbarer Klartext. |
| **MD herunterladen** | Redaktionell lesbare Markdown-Datei mit verlässlichen Start-/Endmarkierungen, Quellen, Datumsstatus und Sprachgruppen. |
| **JSON für spätere Tools** | **Bevorzugter Moonshine-Import.** Vollständige Datenobjekte für Datum, Herkunft, Sprachstatus, Korrekturen und die gleiche Meldungs-ID. |
| **Text kopieren** | Ausgabe in die Zwischenablage übernehmen. |

**Empfehlung:** Nach jeder größeren Bearbeitung mindestens **JSON und MD** sichern. Das JSON ist die maschinenlesbare Übergabe; das Markdown dient zur Sichtkontrolle und als Austauschtext.

---


## 5. Häufige Fehler und Abhilfe

| Problem | Lösung |
| --- | --- |
| PDF-Import in White Lightning blockiert | Prüfen, ob PDF.js/CDN erreichbar ist; sonst mit dienstlich zugelassenem Werkzeug in MD/TXT umwandeln. |
| Scan-PDF liefert keinen Text | Zunächst zugelassene OCR nutzen, Ergebnis prüfen und als MD/TXT importieren. |
| White Lightning hat zwei Artikel vermischt | Trennmarker `[[WL-TRENNEN]]` setzen und aufteilen. |
| Moonshine lehnt JSON ab | White-Lightning-**Bundle-JSON** (nicht beliebige JSON-Datei) exportieren; Arbeitsstand-JSON gesondert über „Arbeitsstand laden“ öffnen. |
| Moonshine lehnt Markdown ab | Nur White-Lightning-MD mit **WL_FORMAT**-Kennung oder **getaggte v4.3-Zeilen** direkt verwenden. |
| Meldung fehlt in der Lagebild-Vorschau | Redaktionell geprüft? Für Lagebild ausgewählt? Datum vorhanden? Deutscher Text vorhanden? Übersetzung überprüft? Berichtszeitraum korrekt? |
| Ereignisdatum unbekannt | Platzhalter stehen lassen; optional in die gesonderte Prüfrubrik aufnehmen – nicht in die datierte Chronologie zwingen. |
| Nur englischer Originaltext vorhanden | Mit zugelassenem Übersetzungsprogramm bearbeiten oder als englischen Anhang kennzeichnen; keine automatische Übersetzung. |
| Wochenlage lässt sich nicht speichern | Über „PDF / Drucken“ als PDF sichern, zusätzlich MD/TXT und den JSON-Arbeitsstand speichern. |


## 6. Datenschutz und fachliche Verantwortung

Die beiden Anwendungen arbeiten lokal im Browser; der öffentliche GitHub-Repository enthält ausschließlich Programmcode, Testtexte und Dokumentation, **keine** importierten dienstlichen E-Mails, Berichte oder Original-PDFs. Die Dateien müssen nur dort verarbeitet und abgelegt werden, wo dies dienstlich zulässig ist. Insbesondere klassifizierte Informationen, personenbezogene Daten und lizenzierte Pressevolltexte dürfen nicht ohne passende Berechtigung in fremde Webdienste oder öffentliche Repositories übertragen werden. Automatische Quellen- oder Tatsachenverifikation findet nicht statt.

**Abnahmehinweis:** Die deterministischen Import-, Datums-, Kategorien- und Exporttests wurden ausgeführt. Die vollständige GUI-Abnahme in einem tatsächlichen Dienstbrowser und die Gleichwertigkeit mit allen alten Spezialparsern der Version 3.6 sind **nicht** nachgewiesen.

## Pflege und Aktualisierung

Bei jeder funktionalen Änderung an White Lightning müssen diese Anleitung und `hilfe.html` gleichzeitig geprüft und angepasst werden. Dies gilt insbesondere für unterstützte Dateiformate, Datumsfelder, manuelle Artikelkorrekturen, Übersetzungen und Exportformate. Bei einer Änderung des JSON-/MD-Übergabevertrags muss zusätzlich [MOONSHINE_IMPORT.md](MOONSHINE_IMPORT.md) angepasst und die Moonshine-Hilfe kontrolliert werden.
