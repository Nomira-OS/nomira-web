---
title: Start in einer VM
lead: Der sichere Weg, nomira kennenzulernen. Am eigenen System ändert sich nichts.
weight: 10
untested: true
---

Eine virtuelle Maschine startet das Image mit eigenem Kernel. Podman
allein genügt dafür nicht, weil ein Container den Kernel des Rechners
mitbenutzt. Wir verwenden [bcvk](https://github.com/bootc-dev/bcvk), das
ein bootc-Image ohne Installation in einer VM startet.

Erprobt ist bisher, dass das Basis-Image in der VM bis zum Ende des
Systemstarts kommt. Der Start mit Konsole, wie unten beschrieben, folgt
der Dokumentation von bcvk und ist von uns noch nicht ausgeführt worden.

## Voraussetzungen

Auf Arch Linux:

```sh
sudo pacman -S --needed podman qemu-base virtiofsd openssh
```

bcvk gibt es fertig nur für Fedora. Auf Arch baust du es aus dem
Quelltext, siehe die
[Anleitung von bcvk](https://github.com/bootc-dev/bcvk).

## Starten

```sh
podman pull ghcr.io/nomira-os/nomira-image:TAG
bcvk ephemeral run --console -it --name nomira-test ghcr.io/nomira-os/nomira-image:TAG
```

Ersetze `TAG` durch ein Release des Basis-Images. Die verfügbaren
stehen unter
[Packages bei Nomira-OS](https://github.com/orgs/Nomira-OS/packages).

## Der erste Start

Das Basis-Image legt Sprache, Tastaturbelegung, Zeitzone und
root-Passwort nicht fest. Beim ersten Start fragt es auf der Konsole
danach. Danach meldest du dich als `root` an.

Soll die VM ohne Rückfragen starten, etwa in einem Test, gib den
Kernel-Parameter mit:

```sh
bcvk ephemeral run --karg systemd.firstboot=off ...
```

## Was die VM nicht zeigt

Das Basis-Image enthält weder Netzwerkverwaltung noch SSH. Der
SSH-Zugang von bcvk und sein Kurztest `test-basic` funktionieren
deshalb erst mit einem Recipe, das beides ergänzt.
