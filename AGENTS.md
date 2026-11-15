# AGENTS.md

Guidance for coding agents (and humans) working in this repository.

## What this is

The nomira website: a Hugo site with its own small theme. Landing page,
comparison with NixOS, FAQ and documentation.

Sibling repositories: `nomira` (BuildKit frontend), `nomira-cli`,
`nomira-image` (base image), `ci` (shared workflows).

## Rules

- **Be honest about the project.** nomira is alpha and is not presented
  as better than NixOS or BlueBuild; it serves different goals. Claims
  about other projects need a source and a hedge.
- **Mark what is untested.** A documentation page whose steps nobody has
  run carries `untested: true`. Remove it only after running the steps.
- **Little text on the landing page.** Long explanations go to the docs.
- **Accessibility (WCAG 2.1 AA).** Keep contrast >= 4.5:1 in both themes,
  keep focus visible, never convey meaning by colour alone, give graphics
  a text equivalent. Check changed pages with axe-core in dark and light.
- **No third-party requests.** Fonts and scripts are self-hosted.
- **Portable output.** Use `relURL`/`RelPermalink` in templates; the site
  must work under any base URL and on any static web server.
- **CI:** checks come from `Nomira-OS/ci`; `site.yml` builds and deploys.
  Actions are pinned by commit SHA, Hugo by version. Never `latest`.
- **Conventional Commits** for every commit.
- **Licence:** EUPL-1.2 via `REUSE.toml`, fonts OFL-1.1; `reuse lint`
  must pass.
- **Languages:** website and README are German. Code, comments, commit
  messages and this file are English.
