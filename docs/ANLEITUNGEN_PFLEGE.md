# Bedienungsanleitungen dauerhaft pflegen

**Geltungsbereich:** `white-lightning/` und `moonshine/` im öffentlichen Repository `mowlsint/toolz`.

## Verbindlicher Ablauf bei jeder Funktionsänderung

1. **Code ändern und testen**, ohne dienstliche Originaldaten in GitHub abzulegen.
2. Die betroffene **Bedienungsanleitung (`ANLEITUNG.md`) und Browserhilfe (`hilfe.html`) im selben Änderungsvorgang prüfen und aktualisieren**. Auch umbenannte Schaltflächen, unterstützte Dateitypen, Datumsregeln, Screens/Schritte, Fehlermeldungen und Grenzen sind zu dokumentieren.
3. Das **Versionslabel im Tool und im Handbuch abgleichen**. Bei reinen Dokumentationskorrekturen genügt ein dokumentierter Stand, keine neue Produktversion.
4. Beim Ändern von `white-lightning/wl-core.js`, Export-MD/JSON oder Sprach-/Datumsfeldern zusätzlich `white-lightning/MOONSHINE_IMPORT.md` prüfen und die **Moonshine-Anleitung** anpassen. Keine stillen Änderungen an Datums- oder Meldungskennungen.
5. Bei Moonshine-Fachrubriken, Importfiltern oder Exportformaten auch den White-Lightning-Workflow auf Stimmigkeit prüfen.
6. Vor Freigabe `node docs/check-guides.cjs` und die bestehenden App-Tests ausführen; danach Links in einem Browser prüfen. Ein statischer Test ersetzt keine GUI-Abnahme.
7. Anschließend im jeweiligen Handbuch im Abschnitt **Versionsverlauf** die nutzerrelevanten Veränderungen und offenen Einschränkungen nennen.

## Referenzdateien

| Werkzeug | Benutzerhilfe | Bearbeitbare Anleitung |
| --- | --- | --- |
| White Lightning | [white-lightning/hilfe.html](../white-lightning/hilfe.html) | [white-lightning/ANLEITUNG.md](../white-lightning/ANLEITUNG.md) |
| Moonshine | [moonshine/hilfe.html](../moonshine/hilfe.html) | [moonshine/ANLEITUNG.md](../moonshine/ANLEITUNG.md) |

Die HTML-Seiten werden statisch über GitHub Pages bereitgestellt. Der Quelltext beider Anleitungen ist öffentlich, **nicht** die damit verarbeiteten Daten. Auch Codebeispiele und Testfixtures dürfen keine echten E-Mails, Lageberichte, personenbezogenen Daten oder urheberrechtlich eingeschränkte Volltexte enthalten.

**Stand der Dokumentationsintegration:** 8. November 2026. Dies ist eine Versions- und Prüfregel, **kein autonomer Dienst**. Künftige Änderungen erfordern weiterhin einen zugehörigen Dokumentations-Commit.
