---
title: Recipes aufteilen
lead: Mit include verteilt sich ein Recipe auf mehrere Dateien und Ordner.
weight: 40
---

Ein Recipe hat eine Einstiegsdatei. Alles Weitere lässt sich
auslagern:

```yaml
# recipe.yml
settings:
  base: ghcr.io/nomira-os/nomira-image:TAG

phases:
  - include: phasen/pakete.yml
  - name: konfiguration
    groups:
      terminal: {include: gruppen/terminal.yml}
      netzwerk:
        - copy files/nm/ /etc/NetworkManager/system-connections/
```

```yaml
# gruppen/terminal.yml
- copy files/kmscon/ /etc/kmscon/
```

## Regeln

- Wo eine Liste von Befehlen steht, geht stattdessen
  `include: <datei>`.
- In der Liste der Phasen bindet `- include: <datei>` eine Phase oder
  mehrere Phasen ein.
- Pfade gelten relativ zur einbindenden Datei und müssen im Verzeichnis
  des Recipes bleiben.
- Eingebundene Dateien dürfen selbst einbinden. Ein Kreis ist ein
  Fehler.
- `settings` steht nur in der Einstiegsdatei.
- Die Quellen von `copy` beziehen sich immer auf das Verzeichnis des
  Recipes, nicht auf die eingebundene Datei.
