---
title: Häufige Fragen
lead: Kurze Antworten. Ausführliches steht in der Doku.
---

## Ist nomira besser als NixOS?

Nein. NixOS prüft mehr, wiederholt einen Stand genauer und ist viel
reifer. nomira verfolgt andere Ziele: Arch-Pakete und gewöhnliche
Konfigurationsdateien statt einer eigenen Sprache. Der
[Vergleich](../vergleich/) stellt beides nebeneinander.

## Worin unterscheidet sich nomira von BlueBuild?

Beide bauen ein unveränderliches System aus einer YAML-Datei und
stellen es mit bootc bereit. Sie setzen aber unterschiedlich an.

| Thema | BlueBuild | nomira |
|---|---|---|
| Zielsysteme | Fedora Atomic und Ableger | Arch Linux |
| Bausteine | Viele fertige Module, etwa für Pakete, Flatpaks oder Schriften | Drei Befehle: `run`, `copy`, `env` |
| Arbeitsweise | Erzeugt ein Containerfile, das Schritt für Schritt läuft | Übersetzt direkt für BuildKit in Phasen und gleichzeitig laufende Gruppen |
| Prüfung | Aufbau des Recipes | Aufbau des Recipes und Nachweis, dass Gruppen sich nicht überschneiden |
| Reife | Etabliert, mit Gemeinschaft und Vorlagen | Alpha |

Wer Fedora nutzt oder fertige Module schätzt, ist bei BlueBuild besser
aufgehoben.

## Kann ich das Frontend ohne den Rest nutzen?

Ja. Das Frontend baut jedes Container-Image und braucht weder die CLI
noch das Basis-Image. Siehe [Das Frontend](../frontend/).

## Läuft nomira nur mit Arch Linux?

Das Frontend ist an keine Distribution gebunden. Als Basis kommt
grundsätzlich jedes System infrage, das bootc unterstützt. Unterstützt
und erprobt wird derzeit aber nur Arch Linux, und nur dafür gibt es ein
Basis-Image.

## Kann ich nomira schon im Alltag einsetzen?

Davon raten wir ab. Das Projekt ist im Alpha-Stand: Das Recipe-Schema
kann sich ändern, und die Installation auf echter Hardware ist noch
nicht erprobt. Zum Ausprobieren eignet sich eine virtuelle Maschine.

## Was bedeutet „geprüft parallel“?

Die Gruppen einer Phase laufen gleichzeitig. Bei jedem Build wird
festgestellt, welche Dateien jede Gruppe verändert hat. Überschneiden
sich zwei Gruppen, bricht der Build ab. Die Unabhängigkeit ist also
nicht nur behauptet, sondern bei jedem Build nachgewiesen.

## Wie halte ich einen Stand fest?

Über das Basis-Image. Jedes Release enthält den Paketstand eines
bestimmten Tages aus dem Arch-Archiv, und Pakete, die dein Recipe
nachinstalliert, kommen aus demselben Stand. Wer ganz sicher gehen
will, verweist auf den Digest des Basis-Images statt auf einen Tag.

## Gibt es SELinux?

Nein. Arch Linux bringt die nötige Bibliothek nicht mit. Das
Basis-Image setzt stattdessen auf AppArmor.
