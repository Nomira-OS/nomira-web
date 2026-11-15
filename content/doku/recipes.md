---
title: Recipes schreiben
lead: Ein Recipe beschreibt dein System in Phasen und Gruppen.
weight: 30
---

## Ein kleines Beispiel

```yaml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
settings:
  name: meinsystem
  description: Mein System
  base: ghcr.io/nomira-os/nomira-image:TAG

phases:
  - name: pakete
    groups:
      system:
        - run pacman -S --needed --noconfirm networkmanager kmscon

  - name: konfiguration
    groups:
      terminal:
        - copy files/kmscon/ /etc/kmscon/
      netzwerk:
        - copy files/nm/ /etc/NetworkManager/system-connections/

  - name: abschluss
    groups:
      dienste:
        - run systemctl enable NetworkManager.service
```

## Phasen und Gruppen

- **Phasen** stehen in einer Liste und laufen in dieser Reihenfolge.
- **Gruppen** einer Phase haben Namen und keine Reihenfolge. Sie laufen
  gleichzeitig und dürfen nicht dieselben Dateien verändern.
- Eine Phase mit nur einer Gruppe ist der einfache Fall: ein Schritt
  nach dem anderen.

Faustregel: Paketinstallationen gehören in eine einzige Gruppe, weil
sie alle die Paketdatenbank verändern. Konfiguration lässt sich gut in
Gruppen aufteilen.

## Die drei Befehle

| Befehl | Zweck |
|---|---|
| `run` | Führt einen Shell-Befehl aus |
| `copy` | Kopiert Dateien aus dem Verzeichnis des Recipes ins Image |
| `env` | Setzt eine Variable für die folgenden Befehle der Gruppe |

Nützliche Zusätze:

- `run --mount=type=cache,target=/pfad` behält ein Verzeichnis zwischen
  Builds, etwa den Paket-Cache.
- `run --no-cache` führt einen Schritt immer aus.
- `copy --chmod=0644` und `copy --chown=0:0` setzen Rechte und
  Eigentümer.

## Wohin Dateien gehören

Im fertigen System ist `/usr` schreibgeschützt, `/etc` wird bei Updates
zusammengeführt, und `/var` gehört nicht zum Image. Lege Inhalte des
Systems deshalb nach `/usr` und `/etc`, nicht nach `/var`, `/opt` oder
`/usr/local`.

Nach einem Wechsel des Kernels oder dem Hinzufügen früh benötigter
Firmware erzeugt `/usr/libexec/nomira-initramfs` das Startabbild neu.

## Bauen und prüfen

```sh
nomira lint      # Aufbau des Recipes prüfen
nomira build     # Image bauen
nomira graph     # Ablauf als Diagramm ausgeben
```

Die vollständige Beschreibung des Schemas steht im
[README des Frontends](https://github.com/Nomira-OS/nomira).
