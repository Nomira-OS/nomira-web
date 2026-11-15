# nomira-web

> **Alpha.** Die Website von nomira: Überblick, Vergleich mit NixOS, FAQ
> und Dokumentation. Vieles ist Entwurf; Seiten, deren Schritte noch
> niemand ausgeführt hat, sind als solche gekennzeichnet.

## Lokal ansehen

Gebraucht wird [Hugo](https://gohugo.io/) in der erweiterten Fassung; die
Version steht in `.github/workflows/site.yml`.

```sh
hugo server
```

## Aufbau

- `content/`: die Texte als Markdown. `untested: true` im Kopf einer
  Seite blendet den Hinweis „Entwurf, noch nicht erprobt“ ein.
- `layouts/`, `assets/`: eigenes, kleines Theme ohne fremde Abhängigkeiten.
  Farben für dunkles und helles Design stehen oben in `assets/css/main.css`.
- `static/fonts/`: Inter und IBM Plex Mono, selbst ausgeliefert. Die Seite
  lädt nichts von fremden Servern.

## Veröffentlichen

`hugo --minify` erzeugt in `public/` reine statische Dateien. Die CI
veröffentlicht sie über GitHub Pages; ebenso gut kann sie jeder Webserver
ausliefern, etwa ein nginx-Container in einem Kubernetes-Cluster. Alle
internen Verweise sind relativ zur Basis-URL, die beim Bau mit `--baseURL`
gesetzt wird.

## Barrierefreiheit

Ziel ist WCAG 2.1 AA: ausreichende Kontraste in beiden Designs, sichtbarer
Tastaturfokus, Sprungmarke zum Inhalt, Tabellen und Codeblöcke per
Tastatur scrollbar, Grafiken mit Textentsprechung. Fehler bitte als Issue
melden.

Verwandte Repos: [nomira](https://github.com/Nomira-OS/nomira) (das
Build-Frontend), [nomira-cli](https://github.com/Nomira-OS/nomira-cli),
[nomira-image](https://github.com/Nomira-OS/nomira-image) (das
Basis-Image), [ci](https://github.com/Nomira-OS/ci) (gemeinsame CI).

## Lizenz

EUPL-1.2; die Schriften stehen unter OFL-1.1. Siehe `LICENSES/` und
`REUSE.toml`.
