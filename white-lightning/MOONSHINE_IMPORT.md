# White Lightning → Moonshine: Importvertrag, Stand 1.3

Dies ist der Schnittstellenvertrag für das eigenständige deutsche Moonshine-Lagebildprogramm unter [MOwlSINT TOOLZ – Moonshine](../moonshine/). Eine erste redaktionelle Testfassung **Moonshine 4.4** kann White-Lightning-JSON und markiertes Markdown direkt importieren. Nicht alle alten Moonshine-3.6-Spezialparser sind darin übernommen. White Lightning selbst erarbeitet kein Lagebild und nimmt keine behördliche Bewertung vor.

## Eingang

1. **Vorrangig JSON**: `schema: mowlsint.white_lightning.bundle.v1`, `items[]` (je `schema: mowlsint.white_lightning.event.v1`). Alle Original- und Korrekturinformationen sind darin strukturiert vorhanden.
2. **Alternativ Markdown**: Datei beginnt mit `<!-- WL_FORMAT: mowlsint.white_lightning.markdown.v1 -->`. Datensätze sind ausschließlich anhand von `WL_RECORD_START`/`WL_RECORD_END` außerhalb der Inhalts-Codeblöcke abzugrenzen, **nicht** anhand frei vorkommender `#`-Überschriften. Marker haben `id="wl_..."` und `variant="original" | "de_translation"`. Die zweite Fassung ist **keine** zweite Ereignismeldung.
3. **TXT**: Für manuelle Übernahme. Weniger verlässlich maschinenlesbar als JSON oder MD.

## Verbindliche Felder pro Rohdatensatz

| Feld | Bedeutung | Regel für Moonshine |
| --- | --- | --- |
| `id` | stabile Datensatzkennung innerhalb eines Exportstands | Übersetzung hat gleiche ID, nicht doppelt zählen |
| `record_kind` | `report_candidate` oder `document_context` | Dokumentkontext nie ohne ausdrückliche Redaktion als Ereignis behandeln |
| `title`, `text`, `original_language` | Originaltitel, bereinigter Originaltext, Spracherkennung | Originaltext nie mit Übersetzung überschreiben |
| `translation_de` | extern eingesetzte deutsche Fassung und Status | `reviewed:false` bleibt ungeprüft; englisches Original weiter verfügbar |
| `event_date` | Datum des Sachverhalts | `value:null` und `status:unknown/partial/ambiguous/unverified` bleiben **offen**, keine Schätzung |
| `report_date` / `reported_at` | Datum/Uhrzeit des Hinweises/Versands | nicht automatisch als Ereignisdatum verwenden |
| `publication_date` | Datum der publizierenden Quelle | nicht automatisch als Ereignisdatum verwenden |
| `received_at` | E-Mail-Eingangszeit | dient nur der technischen Chronologie |
| `source_name`, `source_file`, `parent_file`, `source_page`, `source_page_end`, `source_section`, `urls` | Quellennachweis | mit jedem späteren Lagebildeintrag erhalten |
| `extraction_method`, `status`, `review` | Herkunft des Textblocks und Prüfbefunde | `pdf_column_candidate` ist kein bestätigter Artikel; Prüfflag übernehmen |
| `derived_from_ids`, `source_origins` | Ursprünge nach manueller Korrektur | mehrere Quellteile nicht als mehrere unabhängige Bestätigungen zählen |

## Deutsche Lagebilderstellung – bewusste Trennung

- Chronologie/behördlich bestätigte Sachverhalte und offene OSINT-Hinweise bleiben eigenständige Rubriken. White Lightning qualifiziert eine Rohmeldung nicht automatisch zur behördlichen Ereignismeldung.
- In der Redaktion englischsprachige Originale entweder im englischen Abschnitt belassen oder eine externe deutsche Übersetzung unter **derselben ID** aufnehmen. Eine Übersetzung allein verifiziert keinen Sachverhalt.
- Ein Mangel an zuverlässigem Ereignisdatum führt zu einem ausdrücklichen Platzhalter, nicht zu einer impliziten Zuordnung anhand des Dateinamens, des Nachrichteneingangs oder des Vortags.
- Die deutsche Lagebildformulierung, Gliederung, Bewertung, Freigabe und Export werden später durch Moonshine selbst verantwortet, nicht durch White Lightning.

## Markdown-Vereinbarungen

- Pro Datensatz genau ein Start-/Endmarker; Varianten sind `original` oder `de_translation`.
- Sprachabschnitt A enthält deutsche Originale und deutsche Fassungen, B alle englischen Originale, C unklare oder gemischte Sprachen.
- Der Originalinhalt steht unter `#### Originalinhalt (bereinigt)` als Fenced-Codeblock (`text`); die Fence-Länge wird dynamisch gewählt, wenn Quelltexte Backticks enthalten.
- Metadaten werden mit deutschem Feldnamen als `- **Feld:** Wert` dargestellt, inklusive Datumsstatus und Prüfpflicht.
- Eine Importkomponente für Moonshine muss die Markdown-Marker strikt validieren und darf fehlerhafte oder abgeschnittene Records nicht stillschweigend übernehmen. **JSON ist für verlustfreie Rückimporte vorzuziehen.**

## Datenschutz / Ablage

Alle E-Mails, zugangsbeschränkten Publikationen und Arbeitsfassungen bleiben beim Anwender lokal. Im öffentlichen GitHub-Repository befinden sich nur Quellcode, technische Dokumentation und synthetische Tests. Die Anwendung nutzt keine externe Übersetzungs-API.