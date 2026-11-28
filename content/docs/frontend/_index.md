---
weight: 50
title: Frontend
lead: The BuildKit frontend that turns a recipe into an image. What it does, how it is tested, and what it is not.
---

## What it does

A Containerfile is a chain: change one step, and all that follow run
again. The nomira frontend describes a build in **phases** and
**groups** instead.

- **Phases** run one after another.
- **Groups** of a phase start from the same state, run at the same time
  and are cached one by one; at the end of the phase their layers are
  merged. A changed group is rebuilt alone, not its siblings.
- **A group that only copies** is built apart from the state before it,
  the way `COPY --link` works in a Dockerfile, so neither a new base
  image nor a change in an earlier phase rebuilds it.
- **Collectors** run one command for what all groups contribute: the
  packages of every feature in one transaction, each feature still
  naming its own. A collector can fan out, so that a changed package
  unpacks only its own share.

The recipe only claims that groups are independent; every build checks
it and stops with the groups and paths if they are not. How all of this
maps to BuildKit: [The build](../architecture/build/) and
[The conflict check](../architecture/conflict-check/).

## How it is tested

Besides unit tests, every change builds a set of small recipes with a
real BuildKit and checks the results: conflicts between writes and
deletions, collectors and collectors that fan out, imports, that a group
without `run` comes from the cache after the base image changed, and
that symbolic links and directory modes survive. No image of the
frontend is published unless these pass.

## What it deliberately is not

- **Not a collection of modules.** There are three commands: `run`,
  `copy` and `env`, and collectors that pass a list to a command of your
  choice. Everything else is shell.
- **Not declarative.** A recipe lists commands that run in order. What
  the frontend adds is structure: which steps are independent, and the
  proof that they are.
- **Not a replacement for a Containerfile in every case.** It pays off
  where a build has many independent parts.
- **Not stable yet.** The schema may change; until the first release
  there are only `sha-<commit>` tags, see
  [Tags](standalone/#tags-of-the-frontend-image).

Source: [github.com/Nomira-OS/nomira](https://github.com/Nomira-OS/nomira)
