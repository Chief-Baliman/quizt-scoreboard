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
