# Quizt Scoreboard v35

Responsive Punkteübersicht für Quizt Events mit Firebase Realtime Database und GitHub Pages.

## Dateien hochladen

Diese Dateien in dein bestehendes GitHub-Repo hochladen und die alten ersetzen bzw. ergänzen:

- index.html
- styles.css
- app.js
- database.rules.json
- README.md
- quizt-story-template.png
- moderator.html

## Wichtig

`moderator.html` ist neu und muss zusätzlich ins Repo.

Firebase Rules bleiben wie bei v27. Wenn du die v27-Rules schon veröffentlicht hast, musst du sie nicht erneut ändern.

## Änderung in v32

- Moderator-View ist eine eigene Datei: `moderator.html`
- Moderator-View kann jetzt nach Gesamtwertung oder einzelner Runde sortieren.
- Dadurch kann der Moderator gezielt das Ranking einer bestimmten Runde vorlesen.
- Der Admin-Bereich erzeugt jetzt Links wie:
  `https://chief-baliman.github.io/quizt-scoreboard/moderator.html?mod=CODE`
- Alte Links mit `?mod=CODE` auf der Hauptseite werden automatisch auf `moderator.html` umgeleitet.
- Die Haupt-App bleibt dadurch unberührt und die bisher funktionierenden Admin-/Gäste-Funktionen werden nicht unnötig verändert.
- Entwurfsstatus im Admin-Bereich bleibt sichtbar.

## Ablauf beim Quiz

1. Punkte eintragen.
2. „Entwurf speichern“ klicken.
3. Status zeigt „Unveröffentlichter Entwurf gespeichert“.
4. Moderator-Link kopieren und öffnen.
5. Moderator-View aktualisiert sich automatisch.
6. Moderator liest die Punkte vor.
7. Danach „Änderungen veröffentlichen“ klicken.


## Änderungen in v33

- Moderator-View mobil überarbeitet.
- Inhalte bleiben auf kleinen Displays im Rahmen.
- Runden-Tabelle ist mobil seitlich scrollbar.
- Logo-Bereich hat einen Fallback, falls `logo.png` nicht geladen wird.
- „Normale Ansicht“-Button ist mobil sauber formatiert.


## Änderungen in v34

- Moderator-Gesamtranking ist auf kleinen Displays und bei großer Schrift nicht mehr abgeschnitten.
- Punkte werden mobil unter dem Teamnamen angezeigt, damit sie nicht rechts aus dem Rahmen laufen.
- Runden-Tabelle bekommt eine feste Scroll-Breite und ist mobil direkt seitlich scrollbar.
- Hinweis zur Scrollbarkeit wurde klarer formuliert.


## Änderungen in v35

- Runden-Tabelle im Moderator-View wurde technisch neu als echter horizontaler Scroll-Container aufgebaut.
- Scroll liegt jetzt auf einem eigenen äußeren Container, nicht mehr auf der Tabelle selbst.
- Parent-Container blockieren das seitliche Scrollen nicht mehr.


## Zusatz: Quizt Liga als getrennte Admin-Seite

Dieser Stand basiert auf dem bestätigten stabilen v35-Scoreboard.

Wichtig:
- `app.js` bleibt unverändert gegenüber v35.
- `moderator.html` bleibt unverändert gegenüber v35.
- Das Haupt-Scoreboard wird nicht mit Liga-Logik vermischt.
- Neue Datei: `liga.html`.
- Im Admin-Bereich gibt es nur einen Link `Quizt Liga verwalten`, der `liga.html` öffnet.
- `liga.html` nutzt die getestete funktionierende Liga-Logik aus `liga-test.html`.

Upload:
- kompletten Inhalt ersetzen/hochladen
- alte Debug-Dateien wie `app-v49.js` oder frühere Teststände entfernen
- `logo.png` separat behalten, falls vorhanden

Firebase:
- `database.rules.json` enthält den Pfad `quiztScoreboard/league`.


## v2 Liga-Seite

- Links ausgewähltes Event kann durch erneutes Anklicken geschlossen werden.
- `liga.html` enthält Links zurück zum Scoreboard / normalen Admin-Bereich.
- Anzeige-Einstellungen:
  - Button auf Code-Eingabe-Seite anzeigen
  - Button auf Event-/Ranking-Seiten anzeigen
  - Standard-Ranking: Quartal, All-Time oder beide
- `index.html` zeigt Liga-Buttons basierend auf diesen Einstellungen.
- Haupt-`app.js` wurde nur minimal ergänzt, um öffentliche Liga-Buttons einzublenden.


## v3 Optik & öffentliche Ansicht

- Öffentliche Liga-Ansicht ist bereinigt:
  - keine JavaScript-/Firebase-/Admin-Texte sichtbar
  - kein Loginbereich sichtbar
  - nur Ranking mit Rücksprung zur Code-Eingabe bzw. zum Event
  - Admin-Login nur dezent unten
- Event-Seiten-Link enthält jetzt den Event-Code und kann zurück zum Event führen.
- Buttons auf Event-Seiten wurden für Mobile sauberer angeordnet.


## v4 Moderator-Liga

- In `moderator.html` kann zwischen normaler Moderationsansicht und Liga gewechselt werden.
- Liga-Ansicht bietet Umschalter für Quartalsranking und All-Time-Ranking.
- Rückwechsel zur normalen Moderationsansicht ist jederzeit möglich.
- Liga-Daten werden direkt aus `quiztScoreboard/league/results` gelesen.
- Haupt-Scoreboard bleibt getrennt, Liga-Verwaltung bleibt `liga.html`.


## v5 Optik

- Liga-Buttons auf Code- und Event-Seiten deutlich kompakter.
- Auf Mobile werden „Liga“ und „Anderer Code“ nicht mehr als riesige Vollbreiten-Buttons angezeigt.
- Öffentliche Liga-Ansicht blendet die Versionsplakette aus.
- Öffentliche Liga-Ansicht nutzt neutraleren Headertext.


## v6 Liga-Wording

- Öffentliches Liga-Ranking nutzt jetzt kein technisches „Eintrag/Einträge“ mehr.
- Anzeige lautet jetzt z. B. „bei 1 Quizt-Event dabei“ oder „bei 3 Quizt-Events dabei“.
- Gleiches Wording auch in der Liga-Ansicht der Moderator-View.
- Mobile Ranking-Karten in der öffentlichen Liga wurden etwas kompakter und klarer strukturiert.


## v7 Wording-Fix & Cache-Bust

- Öffentliche Liga-Links erhalten `v=7`, damit alte `liga.html` nicht weiter aus dem Browsercache angezeigt wird.
- Öffentliches Ranking verwendet jetzt konsequent:
  - `bei 1 Quizt-Event dabei`
  - `bei X Quizt-Events dabei`
- Restliche sichtbare Liga-Wording-Stellen wurden von „Eintrag“ auf „Liga-Event“ bzw. Quizt-Event-Wording umgestellt.


## v8 Kompakte öffentliche Liga & Suche

- Öffentliche Liga-Karten sind mobil kompakter.
- Text „bei X Quizt-Events dabei“ ist kleiner und weniger dominant.
- Öffentliche Liga hat ein Suchfeld für Teamnamen.
- Suche filtert Quartals- und All-Time-Ranking, behält aber die echte Platzierung bei.
- Öffentliche Liga-Links verwenden `v=8` gegen alte Cache-Stände.


## v9 Moderator-Ansicht

- Button `Normale Ansicht` aus der Moderator-Toolbar entfernt.
- Moderator-Toolbar enthält jetzt nur noch:
  - Moderation
  - Liga
