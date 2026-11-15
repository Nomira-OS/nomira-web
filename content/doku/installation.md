---
title: Installation
lead: Wie nomira auf einen Rechner kommt. Bitte zuerst in einer VM ausprobieren.
weight: 20
untested: true
---

> Die Installation auf echter Hardware ist noch nicht erprobt. Führe
> sie nicht auf einem Rechner aus, dessen Daten du brauchst.

## Der vorgesehene Weg

nomira wird nicht mit einem eigenen Installer eingerichtet, sondern mit
bootc. Das Image bringt bootc selbst mit, auf dem Rechner muss nur
Podman vorhanden sein.

1. Starte ein beliebiges Linux mit Podman, etwa ein Arch-Livesystem
   oder ein bestehendes Arch.
2. Lass das Image sich selbst installieren. bootc kennt dafür zwei
   Wege: auf eine leere Platte (`bootc install to-disk`) oder neben ein
   bestehendes System (`bootc install to-existing-root`).
3. Starte neu. Beim ersten Start fragt das System nach Sprache,
   Tastaturbelegung, Zeitzone und root-Passwort.

Die genauen Aufrufe beschreibt die
[Dokumentation von bootc](https://bootc-dev.github.io/bootc/bootc-install.html).
Sobald wir die Installation mit dem nomira-Image durchgespielt haben,
stehen die Befehle hier.

## Offene Punkte

- Welcher Bootloader mit dem Arch-Image zusammenspielt, ist noch nicht
  geklärt.
- Das Basis-Image enthält keine Firmware. Für WLAN oder manche
  Grafikkarten muss ein Recipe sie ergänzen, bevor das System auf
  echter Hardware sinnvoll nutzbar ist.

## Danach

Das installierte System ist das Basis-Image: bewusst klein. Dein
eigenes System beschreibst du in einem [Recipe](../recipes/) und
wechselst mit `sudo nomira switch` darauf.
