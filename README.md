# Quizt Scoreboard v44

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


## Änderungen in v36

- Quizt-Liga ergänzt.
- Feste Liga-Wertung:
  - Platz 1: 20 Punkte
  - Platz 2: 16 Punkte
  - Platz 3: 12 Punkte
  - Platz 4: 9 Punkte
  - Platz 5: 6 Punkte
  - Platz 6: 4 Punkte
  - Platz 7: 2 Punkte
  - Platz 8+: 1 Punkt
- Admin-Bereich „Quizt Liga verwalten“ ergänzt.
- Event kann manuell ins Liga-Ranking übernommen werden.
- Teamnamen und Liga-Punkte können vor Übernahme korrigiert werden.
- Manuelle Korrekturen sind möglich.
- Quartalsranking und All-Time-Ranking werden berechnet.
- Anzeige auf der Code-Seite kann im Admin aktiviert/deaktiviert werden.
- Firebase Rules haben einen neuen Bereich `quiztScoreboard/league`.


## Änderungen in v37

- Button heißt jetzt „Geöffnetes Event ins Liga-Ranking übernehmen“.
- Unter dem Button wird angezeigt, welches Event gerade geöffnet ist.
- Wenn ein Event bereits ins Liga-Ranking übernommen wurde, wird das angezeigt.
- Eine erneute Übernahme überschreibt den vorhandenen Liga-Eintrag für dieses Event, statt ihn doppelt zu zählen.
- Beim Prüfen der Übernahme erscheint eine Warnung, wenn der Eintrag überschrieben wird.


## Änderungen in v40

- Rollback auf die stabile Event-Öffnen-Logik aus v37.
- Die explizite Event-Dropdown-Auswahl aus v38/v39 wurde entfernt, weil sie die Event-Bearbeitung gestört hat.
- Zusätzlich gibt es jetzt direkt in der geöffneten Event-Bearbeitung den Button:
  `Dieses Event in Liga übernehmen`
- Der Liga-Button im Liga-Bereich nutzt weiterhin das aktuell geöffnete Event.
- Wenn kein Event geöffnet ist, erscheint eine Meldung statt eines scheinbar wirkungslosen Klicks.
- Nach Klick auf die Übernahme wird automatisch zur Prüfliste gescrollt.


## Änderungen in v41

- Die Liga-Übernahme-Prüfliste erscheint jetzt direkt im geöffneten Event.
- Der alte Prüflistenbereich unten im Liga-Admin wurde entfernt, damit der Klick nicht mehr „unsichtbar“ wirkt.
- Nach Klick auf „Dieses Event in Liga übernehmen“ wird direkt zur Prüfliste im Event gescrollt.
- Zusätzlich erscheint eine sichtbare Meldung im Event-Editor.


## Änderungen in v42

- Liga-Übernahme-Button hat jetzt drei Fallbacks:
  - normaler EventListener
  - globaler Inline-Fallback
  - dokumentweiter Klick-Fallback
- Beim Klick erscheint sofort eine sichtbare Meldung „Liga-Übernahme wird vorbereitet ...“.
- Fehler werden sichtbar im Editor ausgegeben, statt scheinbar nichts zu tun.


## Änderungen in v43

- Der Speichern-Button heißt jetzt klarer: `Liga-Eintrag jetzt speichern`.
- Beim Speichern erscheint sofort eine sichtbare Meldung.
- Falls Firebase das Speichern blockiert, wird die konkrete Fehlermeldung sichtbar angezeigt.
- Nach erfolgreichem Speichern wird die Liga-Tabelle sofort lokal aktualisiert, ohne auf den Firebase-Listener warten zu müssen.
- Zusätzlicher Fallback für den Speichern-Klick ergänzt.


## Änderungen in v44

- Fehler behoben: `leagueResults is not defined`.
- Fehlende Liga-Zustandsvariablen wurden ergänzt.
- Liga-Übernahme kann jetzt wieder vorbereitet werden.
