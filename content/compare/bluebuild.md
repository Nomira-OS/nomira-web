---
title: nomira and BlueBuild
lead: Both build a bootable system image from a YAML recipe. BlueBuild is the more mature project and offers far more out of the box.
layout: comparison
weight: 20
axes:
  - title: What is a recipe made of?
    left: Ready-made modules
    right: Plain commands
    marks:
      - {name: BlueBuild, at: 14}
      - {name: nomira, at: 88}
    text: BlueBuild recipes are made of ready-made modules. nomira recipes are made of plain commands.
  - title: How does the build run?
    left: One step after another
    right: Phases with parallel, verified groups
    marks:
      - {name: BlueBuild, at: 10}
      - {name: nomira, at: 80}
    text: A BlueBuild recipe runs one step after another. A nomira recipe runs in phases whose groups build in parallel and are verified to be independent.
  - title: How mature is the project?
    left: Established
    right: Early stage of development
    marks:
      - {name: BlueBuild, at: 14}
      - {name: nomira, at: 92}
    text: BlueBuild is established. nomira is at an early stage of development.
---

## In short

**BlueBuild** turns a recipe into a Containerfile. A recipe is a list of
modules, such as installing packages, copying files or enabling
services, that run in order. There are modules for many tasks, a
community, and tooling around it. It is made for atomic Fedora images.

**nomira** has no modules. A recipe consists of three commands (`run`,
`copy`, `env`), and a frontend translates it directly for BuildKit. In
return the recipe says which steps are independent: those build in
parallel, are cached separately, and every build checks that they really
do not touch the same files. It is made for Arch Linux.

## In detail

| Topic | BlueBuild | nomira |
|---|---|---|
| Recipe | YAML: a list of modules, run in order | YAML: phases in order, each with independent groups |
| Building blocks | About 25 modules, among them `dnf`, `files`, `systemd`, `fonts`, `default-flatpaks`, `script`; your own modules as scripts | Three commands (`run`, `copy`, `env`) and collectors that hand a list to a command of your choice |
| How it builds | The CLI generates a Containerfile; each module becomes a `RUN` step | A BuildKit frontend translates the recipe directly into a build graph |
| Rebuild after a change | As in any Containerfile: the changed step and those after it | The changed group and later steps that run commands; sibling groups come from the cache |
| Check for conflicts | Not needed, steps run one after another | On every build: groups of a phase must not write the same files |
| Base systems | Atomic Fedora and images based on it are supported officially; Arch, Debian, openSUSE and others through bootc are experimental | Arch Linux only, with our own minimal base image |
| Build tools | Works with the usual container tools | Needs BuildKit |
| Signing your image | Built in | Not built in |
| Multi-architecture builds | Yes, through `platforms` | Can be declared in the recipe; the CLI does not act on it yet |
| Switching the local system | Yes | Yes: `nomira switch`, with checks before the switch |
| Maturity | Established, with a community and templates | Alpha, very small project |

The statements about BlueBuild reflect what we know and may be out of
date. The BlueBuild documentation is authoritative.

## When BlueBuild is the better choice

- You use an atomic Fedora desktop or want to.
- You prefer ready-made modules to writing shell commands.
- You want signing and a build in CI without setting them up yourself.
- You need something you can rely on today.

## When nomira may fit

- You want Arch Linux, starting from a minimal image.
- You prefer a few primitives and plain shell to a module per task.
- Your system has many independent parts, and you want a change to one
  of them to leave its siblings in the cache.
- You like trying something early and can live with breakage.

## Sources

- [BlueBuild](https://blue-build.org/)
- [BlueBuild reference: recipe](https://blue-build.org/reference/recipe)
- [BlueBuild reference: module](https://blue-build.org/reference/module)
