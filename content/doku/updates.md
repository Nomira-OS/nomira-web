---
title: Updates und Rückweg
lead: Ein Update ist ein neues Image. Der vorherige Stand bleibt startbar.
weight: 50
untested: true
---

## Das eigene System aktualisieren

```sh
sudo nomira switch
```

Der Befehl baut das Recipe, prüft das Ergebnis und übergibt das Image
erst danach an bootc. Bis dahin ändert sich am laufenden System nichts.
Das neue System gilt ab dem nächsten Start; mit `--apply` startet der
Rechner sofort neu.

`nomira switch --dry-run` zeigt, welche Befehle ausgeführt würden.

## Neuere Pakete bekommen

Der Paketstand hängt am Basis-Image. Trage in `settings.base` ein
neueres Release ein und führe `sudo nomira switch` aus. Alle Pakete,
auch die aus deinem Recipe, kommen dann aus dem neueren Stand.

## Zurück zum vorherigen Stand

bootc behält den vorherigen Stand. Im Startmenü lässt er sich
auswählen, dauerhaft zurück geht es mit:

```sh
sudo bootc rollback
```

## Was erhalten bleibt

- `/etc`: Deine Änderungen bleiben und werden mit dem neuen Image
  zusammengeführt.
- `/var` und `/home`: bleiben unverändert.
- `/usr`: kommt vollständig aus dem neuen Image.
