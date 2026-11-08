# MOwlSINT TOOLZ – Bedienungsanleitung
## White Lightning 1.3 und Moonshine 4.4 (redaktionelle Testfassung)

**Stand:** 8. November 2026  
**Direkt in den Tools:** [White-Lightning-Hilfe](../white-lightning/hilfe.html) · [Moonshine-Hilfe](hilfe.html). Die Hilfen sind auch über die Schaltfläche „? HILFE / ANLEITUNG“ in den jeweiligen Anwendungen erreichbar.  
**Ziel:** Aus Outlook-Meldungen, PDFs und Textdateien zunächst nachvollziehbare Einzelmeldungen erzeugen und anschließend in einem **eigenständigen** Werkzeug ein deutsches Lagebild erstellen.

> **Versionshinweis:** White Lightning 1.3 liegt im Repository `mowlsint/toolz`. Moonshine 4.4 ist eine neu aufgebaute redaktionelle Testfassung mit direktem White-Lightning-Import, inspiriert vom Arbeitsablauf der archivierten Wochenlage 3.6 und den strukturierten Datensätzen der Moonshine-Prompts 4.3. Moonshine 4.4 enthält **nicht automatisch sämtliche alten Spezialparser** für alle früheren PDF-/Office-Formate. Ein vollständiger Abnahmetest auf dem Dienstrechner steht noch aus.

## 1. Welches System macht was?

| System | Aufgabe | Ergebnis |
| --- | --- | --- |
| **White Lightning** | E-Mails, Texte und PDFs einlesen, in prüfbare Einzelmeldungen zerlegen, Quellen und Datumsstatus erhalten. Keine Lagebilderstellung. | **TXT, MD, JSON** – immer deutsche Originale zuerst, englische Originale darunter. |
| **Moonshine** | White-Lightning-Daten und v4.3-Klartext fachlich prüfen, datieren, übersetzen lassen und freigeben, Chronologie und Fachrubriken zusammenstellen. | **Deutsche Wochenlage**, auf Wunsch englischer Originalanhang; PDF-Druck, **MD**, **TXT**, redaktioneller JSON-Arbeitsstand. |

**Empfohlener Ablauf:** `Originaldatei → gegebenenfalls OCR → White Lightning → WL-JSON → Moonshine → Redaktion → Wochenlage (PDF / MD)`.

**Wichtig:** Veröffentlichungstag, Meldedatum, Eingang einer E-Mail und Zeitpunkt des Ereignisses sind vier verschiedene Angaben. Beide Werkzeuge dürfen fehlende Ereignisdaten nicht durch den Vortag, das Maildatum oder das Datum im Dateinamen ersetzen. Eine Übersetzung ist keine zweite Quelle.

## 2. White Lightning – Rohdatendestillat herstellen

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

## 3. Moonshine 4.4 – Deutsches Lagebild erstellen

**Öffnen:** https://mowlsint.github.io/toolz/moonshine/

### Schritt 1 – Berichtszeitraum auswählen

Unter **„01 · Berichtszeitraum“** den Dokumenttitel, eine optionale Dienststellenbezeichnung, Kalenderwoche und Jahr angeben. Auf **„Zeitraum aus KW setzen“** klicken oder **„Vorherige KW“** beziehungsweise **„Aktuelle KW“** verwenden. Anschließend **Von**, **Bis** und **Lage-Stichtag** kontrollieren. Der Stichtag trennt Rückblick und geplante zukünftige Ereignisse, ersetzt aber niemals ein fehlendes Ereignisdatum.

### Schritt 2 – Vorbereitete Meldungen importieren

Unter **„02 · Datenübernahme“** die in White Lightning exportierte `.json`-Datei ablegen oder auswählen. **Das ist der empfohlene Weg.** Alternativ kann die durch `<!-- WL_FORMAT: mowlsint.white_lightning.markdown.v1 -->` gekennzeichnete `.md`-Datei geladen werden. Moonshine verwendet die Datensatzmarkierungen und **nicht** beliebige `#`-Überschriften als Meldungsgrenzen. Englische Originale und ihre deutsche Übersetzung werden nur **einmal** als ein Sachverhalt mit derselben ID übernommen.

Zusätzlich können die Klartext-Datensätze der früheren **Moonshine-v4.3-Prompts** übernommen werden, zum Beispiel:

```text
[EREIGNIS] | 06.11.2026 | 10:15 | NI | An einer Schleuse fand eine Übung statt. | Quelle: Synthetische Testmeldung
[OSINT] | RUECKBLICK | 06.11.2026 | - | Deutsche Bucht | Ein unbestätigter Hinweis wurde veröffentlicht. | Quelle: Test-OSINT | Link: https://example.org
[EXPECTED] | 09.11.2026 | 12:00 | Brake | TEST VESSEL | Liegeplatz 1 | Schüttgut | 500 t | Quelle: Fiktive Hafenliste
```

Entweder diese Zeilen in **„Getaggten Klartext ... einfügen“** kopieren und **„Datensatzzeilen übernehmen“** wählen oder eine `.txt`-/`.md`-Datei laden. Unterstützte Kennzeichnungen sind:

`[EREIGNIS]`, `[WSP-KONTROLLLAGE]`, `[GENEHMIGUNG]`, `[BAFA-ANLAGE-I]`, `[PSC]`, `[PRF]`, `[SCHIFF]`, `[EXPECTED]`, `[MLZ-NORDSEE]`, `[MLZ-WSP]`, `[OSINT]`.

Getaggter Text wird **nicht automatisch verifiziert**. Die Rubrik `EXPECTED` bleibt ein erwarteter Anlauf und wird niemals allein durch Überschreiten der ETA zu einem tatsächlichen `[SCHIFF]`-Anlauf. Bei OSINT ist der konkrete europäische Ereignisort fachlich zu prüfen.

**Nicht unterstützt in dieser neuen Moonshine-Version:** Direktes Einlesen von `.msg`, `.eml`, Roh-PDFs sowie die vollständige automatische Spezialauswertung aller alten DOCX-/XLSX-Formulare. Dazu zunächst White Lightning oder weiterhin vorhandene zugelassene Spezialwerkzeuge verwenden. Die Legacy-3.6-Importer wurden nicht blind übernommen.

### Schritt 3 – Meldungseditor durcharbeiten

Unter **„03 · Meldungseditor“** jede Meldung einzeln bearbeiten:

1. **Fachrubrik** prüfen: Chronologie, OSINT, Kontrollen, Genehmigungen/BAFA, Schiffsverkehr, erwartete Anläufe, WSP-Kräfte oder weitere Meldungen. White Lightning wird aus Vorsicht zunächst der OSINT-Rubrik zugeordnet; eine Übernahme in die behördliche Chronologie ist eine bewusste redaktionelle Entscheidung.
2. **Ereignisdatum** prüfen. Bei `unknown`, `partial`, `ambiguous` oder einer ungesicherten Erkennung die Quelle nachlesen. Keine geschätzten Daten eintragen.
3. **Deutscher Lagebildtext:** Den Text sachlich und in der gewünschten Formulierung bearbeiten. Moonshine erstellt **keine automatische Übersetzung oder KI-Zusammenfassung**.
4. **Englische Meldungen:** Eine deutsche Fassung muss vorhanden und manuell überprüft sein. Falls erforderlich, zurück in White Lightning oder mit zugelassenem dienstlichem Übersetzungsprogramm bearbeiten.
5. **„Sachverhalt und Einordnung redaktionell geprüft“** markieren, wenn Quelle, Datum, Rubrik und Formulierung stimmen.
6. **„Für Lagebild auswählen“** markieren. Erst **beide** Kennzeichen zusammen führen zur Übernahme in die Ausgabe.

Der Originaltext und die Quellenbelege bleiben über **„Original, Datumsbelege und Quellen anzeigen“** einsehbar. Die Checkbox **„Deutsche Übersetzung mit Original abgeglichen“** ist bei englischen Originalen zusätzlich erforderlich.

**Wichtig:** Ein unbekanntes Ereignisdatum bleibt unbekannt. Unter **„04 · Ausgabeoptionen“** kann es als überprüfter Eintrag nur in eine **gesonderte, nicht chronologische Rubrik** übernommen werden. Es erscheint nicht mit einem erfundenen Datum in der Tageschronologie.

### Schritt 4 – Lagebildoptionen einstellen

Unter **„04 · Ausgabeoptionen“** drei Optionen:

- **Geprüfte Meldungen ohne Ereignisdatum ... aufnehmen:** Nur in die separate Rubrik **„Datumsangaben ungeklärt“**.
- **Englische Originale ... beifügen:** Als gekennzeichneter Anhang unterhalb des deutschsprachigen Lagebilds; keine zweite Meldungsbestätigung.
- **Geprüfte Meldungen außerhalb des Berichtszeitraums aufnehmen:** Sonderfall für bewusst ausgewählte ältere oder spätere Ereignisse.

Die Fachrubriken bleiben voneinander getrennt. **OSINT ist nicht automatisch eine behördlich bestätigte Meldung.** Geplante Anläufe und Genehmigungen mit Datum nach dem Lage-Stichtag erscheinen unter „Kommende Ereignisse“.

### Schritt 5 – Vorschau, PDF, Markdown, Text

Auf **„Lagebild-Vorschau aktualisieren“** klicken. Unter **„06 · Vorschau“** den gesamten Text und insbesondere Quellen, unbestätigte Informationen, die zeitliche Zuordnung, Fachrubriken und englische Anhänge kontrollieren.

- **„PDF / Drucken“:** Browserdruckdialog öffnen und **„Als PDF speichern“** auswählen.
- **„Lagebild als MD“:** Editierbares, deutschsprachig strukturiertes Markdown exportieren.
- **„Als TXT“:** Vereinfachten Klartext exportieren.

Für eine dienstliche Verwendung ist eine gesonderte fachliche Freigabe erforderlich. Die Anwendung ist eine redaktionelle Arbeitshilfe, kein automatischer Nachweis für die Richtigkeit der Quellen.

### Schritt 6 – Arbeitsstand sichern und fortsetzen

Unter **„05 · Arbeitsstand“** **„Arbeitsstand speichern“** auswählen. Die `.json`-Datei enthält die importierten Originaltexte, redaktionellen Änderungen, Freigaben, Quellen und Einstellungen. Mit **„Arbeitsstand laden“** diese Datei später wieder öffnen. **Achtung:** Diese Datei kann dienstliche Inhalte enthalten und muss entsprechend geschützt abgelegt werden. Im Browser wird kein permanenter Arbeitsstand gespeichert.

---

## 4. Was gegenüber Moonshine 3.6 und den v4.3-Prompts verbessert wurde

| Thema | Neue Moonshine-4.4-Regel |
| --- | --- |
| Ereignisdatum | **Keine automatische Vortagsannahme** bei fehlendem Ereignisdatum. Auch Meldedatum und Publikationsdatum bleiben unabhängig. |
| White-Lightning-Übernahme | Direkter, strukturierter **JSON-Import**, alternativ Markierungs-basierter Markdown-Import. |
| Dubletten | Identische IDs werden nicht mehrfach importiert; inhaltlich gleiche Meldungen aus verschiedenen Quellen werden nur als mögliche Dubletten gekennzeichnet. |
| Fremdsprachige Meldungen | Keine ungeprüfte englische Meldung in deutscher Chronologie; deutscher geprüfter Text oder optionaler EN-Anhang. |
| V4.3-Fachtypen | Alle elf genannten Datensatzkennzeichnungen werden als strukturierte Rohdateneingabe angenommen und redaktionell klassifiziert. |
| OSINT-Trennung | White-Lightning-Hinweise standardmäßig OSINT; bewusste, geprüfte Umordnung erforderlich. |
| Ankünfte / Ankündigungen | `[EXPECTED]` bleibt geplant, `[SCHIFF]` bleibt festgestellt; keine ETA-Umdeutung. |
| Ausgaben | Deutschsprachige Vorschau, PDF über Druckdialog, Markdown, TXT und vollständiger JSON-Arbeitsstand. |
| Dienstrechner | Moonshine selbst benötigt nur HTML/CSS/JavaScript von `toolz`, weder KI-Modell noch Installation oder externe Script-CDNs. |

**Noch nicht vollständig übernommen:** Sämtliche alten 3.6-Spezialparser für komplexe PDF-, Office-, MLZ-, Kontroll- und Genehmigungsformulare sowie automatische Extraktion aus Rohdokumenten. Die Verarbeitung dieser Dateien erfolgt derzeit vorgelagert; erkannte Fachtypen werden anschließend in Moonshine geprüft und redigiert.

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
## 7. Versionsverlauf und Pflege

- **08.11.2026 · Moonshine 4.4 (Testfassung):** Eigenständige Lagebildredaktion in TOOLZ mit JSON-/MD-Import aus White Lightning, v4.3-Fachkennzeichnungen, manuellem redaktionellen Freigabeprozess und gesonderter Behandlung unbekannter Ereignisdaten. Die Hilfe ist über den Kopfbereich und die Arbeitsschritte direkt erreichbar.
- **White Lightning 1.3:** Rohdaten-Destillat, Markdown/JSON/TXT und manuelle Artikelgrenzen; separate [White-Lightning-Hilfe](../white-lightning/hilfe.html).

**Pflegeregel:** Bei jeder Funktionsänderung dieser beiden Werkzeuge sind die jeweiligen Browserhilfen, diese Markdown-Anleitung und bei Änderung der Übergabe auch [MOONSHINE_IMPORT.md](../white-lightning/MOONSHINE_IMPORT.md) zu prüfen. [Pflege-Checkliste](../docs/ANLEITUNGEN_PFLEGE.md).
