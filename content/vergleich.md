---
title: nomira und NixOS
lead: nomira ist nicht besser als NixOS. Es verfolgt andere Ziele. Diese Seite soll dir helfen zu entscheiden, was zu dir passt.
layout: vergleich
---

## Kurz gesagt

**NixOS** beschreibt ein System in einer eigenen Sprache. Daraus folgen
Garantien, die nomira nicht bieten kann: Fehler fallen vor dem Bau auf,
ein Stand lässt sich sehr genau wiederholen, und das Projekt ist seit
vielen Jahren erprobt.

**nomira** verzichtet auf diese Sprache. Ein Recipe besteht aus
gewöhnlichen Befehlen und Dateien, die Pakete kommen unverändert von
Arch Linux. Das ist weniger streng, dafür verhält sich das System so,
wie es die Dokumentation der jeweiligen Software beschreibt.

## Im Einzelnen

| Thema | NixOS | nomira |
|---|---|---|
| Beschreibung des Systems | Nix-Sprache mit Modulsystem | YAML-Recipe mit Shell-Befehlen und Dateien |
| Prüfung vor dem Bau | Optionen und Typen werden ausgewertet; viele Fehler fallen vor dem Bau auf | Nur der Aufbau des Recipes; inhaltliche Fehler zeigen sich beim Bau oder beim Teststart |
| Unabhängigkeit der Teile | Folgt aus der Sprache | Im Recipe erklärt, bei jedem Bau nachgewiesen |
| Wiederholbarkeit | Eine Sperrdatei legt alle Eingaben fest | Das Datum im Arch-Archiv legt den Paketstand fest; fertige Images über ihren Digest |
| Neubau nach einer Änderung | Nur die betroffenen Pakete | Die betroffene Gruppe und alle folgenden Phasen |
| Pakete | nixpkgs: sehr groß, eigens paketiert | Arch-Repos und AUR, unverändert |
| Mehrere Versionen nebeneinander | Ja | Nein |
| Updates und Rückweg | Atomar, beliebig viele frühere Stände | Atomar mit bootc, üblicherweise der vorherige Stand |
| AppArmor | Modul vorhanden. Profile, die für übliche Pfade geschrieben sind, passen nicht ohne Weiteres zum Nix-Store; daran wird gearbeitet | Im Basis-Image aktiv. Profile für übliche Pfade gelten unverändert |
| SSSD | Modul vorhanden | Das Arch-Paket, wie auf jedem Arch. Von uns noch nicht erprobt |
| SELinux | Nicht unterstützt | Nicht unterstützt |
| Reife | Seit 2003, große Gemeinschaft | Alpha, sehr kleines Projekt |

Die Angaben zu NixOS geben unseren Kenntnisstand wieder und können
veraltet sein. Maßgeblich ist die Dokumentation von NixOS.

## Wann NixOS die bessere Wahl ist

- Du willst, dass Fehler möglichst vor dem Bau auffallen.
- Du brauchst denselben Stand auf vielen Maschinen, über lange Zeit.
- Du willst mehrere Versionen einer Software nebeneinander.
- Du brauchst ein System, auf das du dich heute verlassen kannst.

## Wann nomira passen kann

- Du kennst Arch und willst dessen Pakete und Wiki weiter nutzen.
- Du willst Software so einrichten, wie ihre eigene Dokumentation es
  beschreibt, mit den üblichen Pfaden.
- Dir ist ein unveränderliches System mit Rückweg wichtig, aber keine
  neue Sprache.
- Du probierst gern etwas Frühes aus und kommst mit Brüchen zurecht.

## Quellen

- [AppArmor on NixOS Roadmap](https://discourse.nixos.org/t/apparmor-on-nixos-roadmap/57217)
- [NixOS-Wiki: Active Directory Client](https://wiki.nixos.org/wiki/Active_Directory_Client) (SSSD)
