# MOwlSINT Moonshine 4.4 – lokale Lagebildredaktion (Testversion)

Ein komplett browserseitiges Redaktionswerkzeug für eine deutschsprachige Wochenlage. Getrennt von **White Lightning**, das ausschließlich strukturierte Rohdaten destilliert. **Moonshine erstellt das Lagebild** nach fachlicher Freigabe der einzelnen Meldungen.

- **Web:** https://mowlsint.github.io/toolz/moonshine/
- **Anleitung:** [ANLEITUNG.md](ANLEITUNG.md)
- **Import:** White Lightning `mowlsint.white_lightning.bundle.v1` (`.json`) oder dessen `WL_FORMAT`-Markdown (`.md`); alternativ `.txt`/`.md` mit Moonshine-v4.3-Datensatzkennzeichnungen.
- **Fachrubriken:** Chronologie, OSINT, Kontrollen, Genehmigungen, Schiffsverkehr, Expected Arrivals, WSP-Kräfte, Sonstiges.
- **Zeitregel:** Kein Ersatz fehlender Ereignisdaten durch Meldedatum, Veröffentlichungsdatum, Dateinamen oder angenommenen Vortag. Ungeklärte Daten bleiben gesondert.
- **Redaktion:** Bewusste Prüfung und Aufnahme pro Meldung, deutsche Formulierung/Übersetzungsprüfung, Zeit- und Rubrikfilter, Vorschau.
- **Export:** Browserdruck/PDF, Markdown, TXT sowie JSON-Arbeitsstand `mowlsint.moonshine.workspace.v1`.
- **Netzwerk:** Keine eigenen Netzwerkaufrufe oder externen JavaScript-CDNs. Keine KI, kein Backend, keine permanente Datenspeicherung.

**Abgrenzung zu Moonshine 3.6:** Alte Spezialparser für direkte PDF-, Office- und Einsatzformulare sind in dieser neuen Version nicht vollständig enthalten. Der vorgeschaltete White-Lightning-Import übernimmt die Standardisierung, ohne den fachlichen Quelltyp automatisch zu verifizieren. Tags aus den v4.3-Kurzprompts dienen als Datenstruktur, nicht als Beweis.

**Sicherheit:** Öffentlicher Quellcode, keine realen dienstlichen Testdaten im Repository. Die lokale Arbeitsstandsdatei kann vertrauliche Originaltexte enthalten und ist entsprechend zu schützen.

## Tests

```sh
node moonshine/tests/test.cjs
```

GUI-Vollabnahme auf dem Dienstrechner ist noch erforderlich.