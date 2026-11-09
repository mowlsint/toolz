# MOwlSINT White Lightning — lokale Rohdatendestillerie

**Zweck:** E-Mails, First Alerts, Berichte und PDFs in ein textuelles Rohdatendestillat überführen. White Lightning erstellt **kein Lagebild**, keine Zusammenfassung, keine neue Faktenbehauptung und keine KI-Übersetzung.

**Web:** `https://mowlsint.github.io/toolz/white-lightning/`

**Bedienungshilfe direkt im Tool:** [Hilfe im Browser](hilfe.html) · [Versionierte Bedienungsanleitung als Markdown](ANLEITUNG.md). Die Hilfe enthält anklickbare Kapitel für Import, OCR, Ereignisdatum, Artikelgrenzen, Übersetzung und Export.

**Anschluss an Moonshine:** Die erste [Moonshine-Lagebildredaktion (Version 4.4, Testfassung)](../moonshine/) kann White-Lightning-JSON und das markierte Markdown direkt einlesen. [Gemeinsame Bedienungsanleitung](../moonshine/ANLEITUNG.md).

**Version 1.3.1 (09.11.2026):** Verbesserter Drag-and-drop-Import aus Outlook: alternative Dateiobjekte, aussagekräftige Rückmeldung, Text-Fallback ohne erfundene E-Mail-Metadaten und ausdrückliche Kopieroperation zum Schutz vor Verschieben. Bei nicht bereitgestellten Outlook-Dateien E-Mail zuerst als `.msg`/`.eml` in einem zulässigen lokalen Ordner speichern; ein direkter Drag aus Outlook kann je nach Client/Browser technisch unmöglich bleiben.\n\n**Version 1.3:** Konservative Markdown-/Textabschnittserkennung; PDF-Textspalten als Kandidaten getrennt; eindeutig datierte Eintragsköpfe in strukturierten Berichten auch über Seitenumbrüche verknüpft. Kein OCR-Zwang, keine automatische Artikel-Faktenerfindung. Ergänzt: manuelles Aufteilen/Zusammenführen, Rückgängig-Funktion und Markdown-Export mit festem Kennungsformat.

## Formate

- `.msg`: Microsoft Outlook MSG Compound File; Unicode- und ANSI-Text, MAPI-Sende- und Empfangszeit sowie reguläre Dateianhänge (z. B. PDF).
- `.eml`: RFC-822-Mails einschließlich einfacher MIME-Multipart- und Base64-Anhänge (PDF, TXT, MD). Komplexes S/MIME/TNEF wird derzeit nicht unterstützt.
- `.pdf`: Text-PDFs via PDF.js 3.11.174. Textspalten werden anhand von Koordinaten als vorläufige Kandidaten getrennt; das ist **keine** verlässliche Einzelartikel-Erkennung. Spaltenübergreifende Überschriften, Tabellen, Mehrspaltenartikel und wechselnde Layouts bleiben prüfpflichtig. Ohne Textschicht bleibt ein OCR-Hinweis.
- `.txt`, `.md`, `.html`, `.json`, `.jsonl`: lokale Texte und strukturierte Meldungen. Bei Markdown können wiederholte `#`/`##`-Überschriften, bei TXT wiederholte explizit nummerierte Meldungsüberschriften und bei beiden `---`-Trennzeilen in **prüfpflichtige** Einzelabschnitte aufgeteilt werden. YAML-Frontmatter und Codeblöcke sind vor dem Trennen geschützt.

Alle Daten bleiben im Browser-Arbeitsspeicher. Keine Outlook-API, kein Backend, keine KI-Anfrage. Für PDF.js werden Script und Worker beim ersten PDF-Import von einem CDN geladen; PDF-Bytes bleiben lokal. Zur Wiederverwendung TXT, Markdown oder JSON auf das eigene Gerät exportieren; im öffentlichen Repository werden keine Rohdaten gespeichert.

## Redaktionelle Korrektur von Artikelgrenzen

- Bei einem falsch zusammengefügten Artikel den Rohtext der Meldung öffnen und `[[WL-TRENNEN]]` auf eine **eigene Zeile** zwischen zwei Textteile setzen; dann **Am Marker aufteilen** wählen. Der Trennmarker wird nicht in die Teilmeldungen übernommen.
- Bei einem über Spalten/Seiten aufgeteilten Artikel einen passenden Abschnitt **derselben Quelldatei, Originalsprache und Datensatzart** im Dropdown auswählen und **Ausgewählte Abschnitte zusammenführen** klicken. Die Kombination erfolgt in ursprünglicher Importreihenfolge, **nicht** nach einer automatischen Behauptung, dass beide Teile denselben Artikel bilden.
- Beide Aktionen vergeben neue Meldungs-IDs. Ausgangskennungen stehen in `derived_from_ids`, Fundstellen und Zeitstände aller Quellabschnitte in `source_origins`. Die Daten stehen im JSON; im MD erscheinen Quellabschnitte und ursprüngliche Kennungen.
- Ein bei manueller Teilung zuvor angenommenes Ereignisdatum wird wieder **prüfpflichtig und ohne Wert**; bei Zusammenführung voneinander abweichende Daten werden **ambiguous** und nicht überschrieben.
- Meldungen mit vorhandenen deutschen Übersetzungen müssen vor einer Grenzkorrektur gesichert und die Übersetzung entfernt werden; es erfolgt keine stille Änderung oder Löschung einer Übersetzung.
- **Letzte Teilung / Zusammenführung rückgängig** hält bis zu acht Bearbeitungsschritte lokal im Browser vor. Bei neuem Import oder Löschen der Arbeitsliste verfällt diese Undo-Historie. Vor umfangreicher Redaktion JSON sichern.

## Exportformate und Moonshine-Schnittstelle (v1.3)

- **TXT**: unkompliziertes Textdestillat zum manuellen Kopieren.
- **MD**: lesbarer Markdown-Export mit Überschriften, `<!-- WL_RECORD_START id="..." variant="..." -->` und `<!-- WL_RECORD_END -->` für **jeden Datensatz**, eindeutiger `Meldungs-ID`, Sprachabschnitt A deutsch/B englisch/C ungeklärt, Quelldatei, Seite, Extraktionsart, sämtlichen Datumswerten samt Status und Prüfvermerken. Im Markdown stehen die Originaltexte in variablen Text-Codeblöcken, damit Überschriften innerhalb der Quelle keine neuen Meldungen erzeugen. Vorhandene deutsche Übersetzungen stehen in A, das englische Original bleibt mit **gleicher ID** in B.
- **JSON** (`mowlsint.white_lightning.bundle.v1`): verbindliches, maschinenlesbares Austauschformat für das geplante Moonshine-Lagebildwerkzeug. Die ursprünglichen Datums- und Herkunftsobjekte samt Kandidaten, Evidenz und Bearbeitungshistorie bleiben vollständig erhalten. Das spätere Moonshine-Tool darf weder unbekannte Ereignisdaten aus Veröffentlichungs-/Meldedatum ableiten noch Dokumentköpfe als Ereignisse interpretieren.

Die Schnittstellenfestlegung steht in [`MOONSHINE_IMPORT.md`](MOONSHINE_IMPORT.md). Der Export ist weiterhin **kein Lagebild**. MD und TXT können vollständige Artikel enthalten und dürfen nicht ohne entsprechende Rechte verbreitet werden.

## Datumsvertrag v1

| Feld | Zweck | Unbekannte Angabe |
| --- | --- | --- |
| `event_date` | Zeitpunkt des Sachverhalts (Tagesdatum) | `{value:null,status:"unknown"}` |
| `report_date` | Datum der versandten/gemeldeten Nachricht | `{value:null,status:"unknown"}` |
| `reported_at` | Zeitstempel des Mailversands, ISO-8601 UTC | `null` |
| `received_at` | Zeitstempel des Maileingangs, ISO-8601 UTC | `null` |
| `publication_date` | Publikationsdatum einer Quelle | `{value:null,status:"unknown"}` |

Der in `value` gespeicherte Tageswert nutzt `YYYY-MM-DD`. Bei Unsicherheit gelten `unknown`, `partial`, `ambiguous` bzw. `unverified`, ergänzt durch `candidates`, `evidence`, `basis`, `review_required`. **Ein fehlendes Datum wird nie durch das heutige Datum oder den Dateinamen ersetzt.** Die Textausgabe druckt explizite Platzhalter. Manuell korrigierte Daten werden als solche gekennzeichnet. Keine Zeitzone wird erfunden. Bei MSG werden `PR_CLIENT_SUBMIT_TIME` und `PR_MESSAGE_DELIVERY_TIME` getrennt erfasst. Ein PDF-Dokumentkopf gilt ggf. als Publikationsdatum, nicht als Ereignisdatum.

Der JSON-Export (`mowlsint.white_lightning.bundle.v1`) enthält `items` mit Einträgen nach Schema `mowlsint.white_lightning.event.v1` und dient späteren eigenständigen Moonshine-/Greybook-/MagicPaws-Tools als Datenvertrag. Die Texte bleiben in der Originalsprache; eine heuristische Sprachkennung ist nur ein Hinweis.

## Grenzen und Prüfsicherheit

- Die Datumsverknüpfung ist konservativ, aber nur heuristisch. Erkannte Ereignisdaten müssen nachgeprüft werden.
- PDF-Spaltenblöcke sind **keine** fertigen Einzelartikel, mehrspaltige Texte benötigen Prüfung. Gescannten Seiten fehlt ohne OCR die Textebene.
- **OCR-Weg:** Bei Scan-PDF im bestehenden MD/PDF-Studio (Link auf der White-Lightning-Oberfläche) lokal OCR ausführen, Markdown exportieren und bei White Lightning importieren. Die OCR des MD/PDF-Studios ist technisch wiederverwendbar, benötigt aber Tesseract.js und Sprachmodelle aus dem Internet. Wenn dienstliche Filter das verhindern, muss die OCR vorher mit einer dienstlich genehmigten Software erfolgen; keine Uploads an unautorisierte Dienste. White Lightning selbst lädt **keine** OCR-Bibliothek und **keine** Sprachmodelle nach.
- Strukturierte Berichte mit wiederholten Eintragsköpfen `[YYYY-MM-DD HH:MM]` werden nur bei mindestens zwei solchen Markern getrennt und können über PDF-Seitengrenzen weiterlaufen. Die Kopfzeit ist ein unbewerteter Meldungs-/Eintragshinweis, **keine UTC- und keine Ereigniszeit**. Dokumentköpfe tragen `record_kind: document_context` und sind ausdrücklich keine Ereignisse.
- `.md` und `.txt` werden ohne externe Bibliotheken geladen; ein fehlender Titel oder eine unsichere Abschnittsgrenze erhält einen Prüfhinweis statt erfundener Fakten.
- Wortgleiche Meldungen werden als Dubletten gekennzeichnet; unterschiedliche Darstellungen werden nicht fälschlich zusammengeführt.
- E-Mail-Footer werden nur in wenigen klaren Fällen entfernt, um keine Fakten zu zerstören.
- MSG mit Verschlüsselung, eingebetteten MSG-Objekten, S/MIME oder TNEF werden nicht vollständig gelesen.
- Nur Dateien verarbeiten, für die eine zulässige Nutzung und lokale Verarbeitung besteht. Bei lizenzierten Zeitungen keine Volltexte in öffentliche Repositories übernehmen.

## Tests

```sh
node white-lightning/tests/test.cjs
node white-lightning/tests/segments.test.cjs
node white-lightning/tests/editor-export.test.cjs
# Optionale private Testdateien nur außerhalb des Repositorys:
WL_MSG_FIXTURE_DIR=/lokaler/pfad node white-lightning/tests/test.cjs
node white-lightning/tests/segments.test.cjs
node white-lightning/tests/editor-export.test.cjs
```

Keinerlei Beispieldaten oder personenbezogene Rohdateien werden mit diesem Tool ausgeliefert.

## Zweisprachiger Ausgabe- und Übersetzungsweg (Version 1.1)

- Abschnitt A des TXT-Exports enthält zuerst deutschsprachige Originalmeldungen und optional manuell eingefügte deutsche Übersetzungen englischer Meldungen.
- Abschnitt B enthält anschließend **alle englischen Originalmeldungen**, auch wenn bereits eine deutsche Übersetzung hinzugefügt wurde. Gleiche `id`: kein neuer, unabhängiger Sachverhalt.
- Abschnitt C enthält Meldungen mit gemischter oder nicht zuverlässig erkannter Sprache zur manuellen Prüfung. Die Sprachzuordnung kann im Browser angepasst werden.
- White Lightning bietet für englische Originalmeldungen **Originaltext kopieren**, **deutsche Überschrift** und **deutschen Text einfügen** an. Dies ist ein manueller Copy/Paste-Workflow mit einem separat zugelassenen **dienstlichen Übersetzungsprogramm**.
- Es werden **keine Übersetzungsprogramme, Browser-Erweiterungen oder Sprachmodelle heruntergeladen** und keine Texte an Übersetzungsdienste gesendet. Auf dem Dienstrechner sind die dort geltenden Regeln zur Weitergabe in die Übersetzungssoftware einzuhalten.
- `translation_de` ist ein optionales Objekt am bestehenden Ereignis: `{title, text, status, method, reviewed}`. `external_unreviewed` bedeutet **extern eingefügt und nicht geprüft**; nur eine bewusste manuelle Prüfung setzt `reviewed`. Das Original bleibt unabhängig davon erhalten.
- Die automatische Sprachkennung ist heuristisch und bei sehr kurzen First Alerts möglicherweise unsicher. Unklare Sprache bleibt als Prüfgruppe erhalten, statt stillschweigend deutsch oder englisch angenommen zu werden.

**Technischer Hinweis:** Die bestehende PDF-Textbibliothek PDF.js wird zurzeit bei PDF-Import von einem CDN geladen. Das ist keine Installation eines Programms oder einer Erweiterung, kann aber durch dienstliche Netzrichtlinien blockiert sein. Für eine vollständig intern gehostete PDF-Funktion müssten wir die Browserbibliothek im `toolz`-Repository selbst bereitstellen; aktuell bleibt der PDF-Import abhängig vom erlaubten Browserzugriff.