---
title: Schnellstart
weight: 5
lead: Ein erstes Recipe bauen, auf einem beliebigen Linux und ohne etwas am eigenen System zu ändern.
---

> **Erprobt.** Diese Schritte wurden auf Arch Linux ausgeführt: der Bau
> mit zwei Gruppen und der Abbruch bei einem Konflikt.

## Voraussetzungen

Du brauchst `go`, `podman`, `buildctl` und `skopeo`. Auf Arch Linux:

```sh
sudo pacman -S --needed go buildkit podman skopeo
```

## Die Kommandozeile bauen

```sh
git clone https://github.com/Nomira-OS/nomira-cli
cd nomira-cli && go build -o nomira . && cd ..
```

## Ein Recipe schreiben

Lege einen Ordner an und darin die Datei `recipe.yml`:

```yaml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
settings:
  name: test
  base: docker.io/library/alpine:3.22
phases:
  - name: inhalt
    groups:
      a: ["run echo a > /etc/a"]
      b: ["run echo b > /etc/b"]
```

## Prüfen und bauen

```sh
../nomira-cli/nomira lint
../nomira-cli/nomira build
```

Die Kommandozeile startet bei Bedarf einen BuildKit-Dienst in einem Container. Das Ergebnis liegt als Archiv unter `.nomira/test.oci.tar`.

## Einen Konflikt auslösen

Lass beide Gruppen dieselbe Datei schreiben, also in Gruppe `b` ebenfalls `/etc/a`, und baue erneut. Der Bau bricht ab und nennt die beiden Gruppen und die Datei:

```text
phase "inhalt": declared-independent groups are not disjoint (policy: strict):
  groups "a" and "b": /etc/a (both write)
```

Weiter geht es mit dem [Recipes schreiben](../recipes/).
