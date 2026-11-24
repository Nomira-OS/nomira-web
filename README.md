# nomira-web

> **Alpha.** The nomira website: overview, comparisons with other
> projects, FAQ and documentation. Much of it is a draft; pages whose
> steps nobody has run yet are marked as such.

## Viewing it locally

You need the extended edition of [Hugo](https://gohugo.io/); the version
is in `.github/workflows/site.yml`.

```sh
hugo server
```

## Layout

- `content/`: the texts as Markdown. `untested: true` in the front
  matter of a page shows the notice "Draft, not tried yet".
- `content/docs/`: the documentation. Every directory with an
  `_index.md` is a section and may contain pages and further sections,
  to any depth. Navigation tree, breadcrumb and previous/next links are
  generated; `weight` in the front matter sets the order.
- `content/compare/`: the overview and one page per project. The axes of
  the graphics are in the front matter.
- `content/frontend.md`: the landing page of the frontend; its text is
  in `layouts/_default/frontend.html`.
- `layouts/`, `assets/`: a small theme of our own without external
  dependencies. The colours for the dark and the light theme are at the
  top of `assets/css/main.css`.
- `static/fonts/`: Inter and IBM Plex Mono, served by the site itself.
  The site loads nothing from other servers.

## Publishing

`hugo --minify` writes plain static files to `public/`. CI publishes
them through GitHub Pages; any web server can serve them just as well,
an nginx container in a Kubernetes cluster for instance. All internal
links are relative to the base URL, which is set at build time with
`--baseURL`.

## Accessibility

The goal is WCAG 2.1 AA: sufficient contrast in both themes, a visible
keyboard focus, a skip link, tables and code blocks that can be scrolled
with the keyboard, graphics with a text equivalent. Please report
problems as an issue.

Related repositories: [nomira](https://github.com/Nomira-OS/nomira) (the
build frontend), [nomira-cli](https://github.com/Nomira-OS/nomira-cli),
[arch-base](https://github.com/Nomira-OS/arch-base) (the base
image), [ci](https://github.com/Nomira-OS/ci) (shared CI).

## Licence

EUPL-1.2; the fonts are under OFL-1.1. See `LICENSES/` and `REUSE.toml`.
