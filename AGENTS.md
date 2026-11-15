# AGENTS.md

Guidance for coding agents (and humans) working in this repository.

## What this is

The reference recipe of the nomira OS and the website that explains the
OS and its installation. The recipe is the documentation: the website is
generated from the recipe and its explanations. The repository is still
empty apart from this scaffolding.

Sibling repositories: `nomira` (BuildKit frontend), `nomira-cli`,
`nomira-image` (base image), `ci` (shared workflows).

## Rules

- **The recipe must build.** Whatever the website shows is the recipe
  that CI builds; never document a snippet that is not part of it.
- **CI is shared.** Workflows only call `Nomira-OS/ci`.
- **Conventional Commits** for every commit; releases are cut by hand
  with the `release` workflow, never by pushing a tag.
- **Versions are pinned.** Never `latest`; the base image is referenced
  by a release tag or digest.
- **Licence:** EUPL-1.2 via `REUSE.toml`; `reuse lint` must pass.
- **Languages:** website and README are German. Code, comments, commit
  messages and this file are English.
