# MOwlSINT White Lightning — lokale Rohdatendestillerie

**Zweck:** E-Mails, First Alerts, Berichte und PDFs in ein textuelles Rohdatendestillat überführen. White Lightning erstellt **kein Lagebild**, keine Zusammenfassung, keine neue Faktenbehauptung und keine KI-Übersetzung.

**Web:** `https://mowlsint.github.io/toolz/white-lightning/`

## Formate

- `.msg`: Microsoft Outlook MSG Compound File; Unicode- und ANSI-Text, MAPI-Sende- und Empfangszeit sowie reguläre Dateianhänge (z. B. PDF).
- `.eml`: RFC-822-Mails einschließlich einfacher MIME-Multipart- und Base64-Anhänge (PDF, TXT, MD). Komplexes S/MIME/TNEF wird derzeit nicht unterstützt.
- `.pdf`: textbasierte PDFs seitenweise via PDF.js 3.11.174. Keine OCR, keine zuverlässige automatische Artikeltrennung in mehrspaltigen Layouts. Jede Seite wird deshalb mit Quellverweis und Prüfhinweis exportiert.
- `.txt`, `.md`, `.html`, `.json`, `.jsonl`: lokale Texte und strukturierte Meldungen. Manuelles Trennzeichen `---` auf einer eigenen Zeile.

Alle Daten bleiben im Browser-Arbeitsspeicher. Keine Outlook-API, kein Backend, keine KI-Anfrage. Für PDF.js werden Script und Worker beim ersten PDF-Import von einem CDN geladen; PDF-Bytes bleiben lokal. Zur Wiederverwendung TXT oder JSON auf das eigene Gerät exportieren; im öffentlichen Repository werden keine Rohdaten gespeichert.

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
- PDF-Seiten werden nicht als fertige Einzelartikel ausgegeben, mehrspaltige Texte benötigen Prüfung. Gescannten Seiten fehlt ohne OCR die Textebene.
- Wortgleiche Meldungen werden als Dubletten gekennzeichnet; unterschiedliche Darstellungen werden nicht fälschlich zusammengeführt.
- E-Mail-Footer werden nur in wenigen klaren Fällen entfernt, um keine Fakten zu zerstören.
- MSG mit Verschlüsselung, eingebetteten MSG-Objekten, S/MIME oder TNEF werden nicht vollständig gelesen.
- Nur Dateien verarbeiten, für die eine zulässige Nutzung und lokale Verarbeitung besteht. Bei lizenzierten Zeitungen keine Volltexte in öffentliche Repositories übernehmen.

## Tests

```sh
node white-lightning/tests/test.cjs
# Optionale private Testdateien nur außerhalb des Repositorys:
WL_MSG_FIXTURE_DIR=/lokaler/pfad node white-lightning/tests/test.cjs
```

Keinerlei Beispieldaten oder personenbezogene Rohdateien werden mit diesem Tool ausgeliefert.