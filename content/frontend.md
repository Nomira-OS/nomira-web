---
title: Das Frontend
lead: Der Kern von nomira ist ein BuildKit-Frontend. Es wird in diesem Projekt entwickelt, steht aber für sich und baut jedes Container-Image.
---

## Was es tut

Ein Containerfile ist eine Kette: Ändert sich ein Schritt, laufen alle
folgenden neu. Das nomira-Frontend beschreibt einen Build stattdessen in
**Phasen** und **Gruppen**.

- **Phasen** laufen nacheinander.
- **Gruppen** einer Phase sind voneinander unabhängig. Sie starten alle
  vom selben Stand, laufen gleichzeitig und liegen einzeln im Cache.
- Am Ende der Phase werden ihre Ergebnisse zusammengeführt.

Ändert sich eine Gruppe, wird nur sie neu gebaut, nicht ihre
Geschwister.

## Unabhängigkeit wird nachgewiesen

Dass Gruppen unabhängig sind, behauptet das Recipe nur. Das Frontend
prüft es bei jedem Build: Es ermittelt, welche Dateien jede Gruppe
geschrieben oder gelöscht hat. Überschneiden sich zwei Gruppen, bricht
der Build ab und nennt die Gruppen und den Pfad.

```
phase "configs": declared-independent groups are not disjoint (policy: strict):
  groups "a" and "b": /etc/a (both write)
```

## Ohne den Rest von nomira nutzen

Das Frontend braucht weder die nomira-CLI noch das Basis-Image und auch
kein bootc. Es genügt eine Zeile am Anfang der Datei:

```yaml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
settings:
  base: docker.io/library/alpine:3.22
phases:
  - name: app
    groups:
      config:
        - copy files/app.conf /etc/app.conf
      assets:
        - run mkdir -p /srv/www && echo hallo > /srv/www/index.html
```

Gebaut wird mit BuildKit selbst:

```sh
buildctl build --frontend gateway.v0 \
  --opt source=ghcr.io/nomira-os/nomira:1-alpha \
  --local context=. --local dockerfile=. --opt filename=recipe.yml \
  --output type=oci,dest=image.tar
```

Dieser Weg ist erprobt. Werkzeuge, die BuildKit verwenden und die
`# syntax=`-Zeile auswerten, etwa `docker buildx`, sollten das Recipe
ebenfalls bauen; das haben wir noch nicht ausprobiert.

## Was es bewusst nicht ist

- **Keine Modulsammlung.** Es gibt drei Befehle: `run`, `copy` und
  `env`. Alles Weitere ist Shell.
- **Kein Ersatz für ein Containerfile in jedem Fall.** Der Gewinn
  entsteht dort, wo ein Build viele unabhängige Teile hat.
- **Noch nicht stabil.** Das Schema kann sich ändern, deshalb der Tag
  `1-alpha`.

Quelltext und vollständige Beschreibung des Schemas:
[github.com/Nomira-OS/nomira](https://github.com/Nomira-OS/nomira)
