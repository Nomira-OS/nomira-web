---
title: Collectors
lead: Groups say what they need; one command does it for all of them.
weight: 12
---

## The problem they solve

Some things have to happen in one step. Two groups that both install a
package both write the package database, so they can never be
independent. Without collectors, a feature would be torn apart: its
package in one phase, its files in another, its service in a third.

## How they work

A group with `collect` is a collector. It runs one command. `${items}`
in that command is replaced by everything the groups of the recipe
contributed under the collector's name. A phase that is one collector
can say so in short: `collect` directly under the phase, and the
collector is named after the phase.

```yaml
build:
  packages:
    collect: run pacman -S --needed --noconfirm ${items}

  features:
    terminal:
      packages: [kmscon]
      commands:
        - copy files/kmscon/ /etc/kmscon/
    editor:
      packages: [vim]
```

This runs `pacman -S --needed --noconfirm kmscon vim` once.

- **nomira knows nothing about pacman.** A collector is whatever command
  you write. The same mechanism enables services, generates locales or
  adds users.
- **Where the collector stands decides when it runs.** Contributions
  come from groups of any phase, also from later ones.
- **The order of items is fixed.** They are sorted and duplicates are
  removed, so moving a group to another file changes nothing.
- **A collector without items is skipped.**
- **Names are unique.** Contributions name the collector, so two
  collectors cannot share a name, wherever they stand.
- **Several in one phase** run side by side, as groups do, and are
  checked like them: they must not change the same files differently.

## What an item may be

A single word of letters, digits and `@%+=:,./_-` that does not start
with `-`. Anything else is an error before the build starts. This keeps
a contribution from changing the meaning of the command.

## Useful collectors

```yaml
build:
  packages:
    collect: >-
      run --mount=type=cache,target=/etc/pacman.d/gnupg,id=pacman-keyring,sharing=locked
      { [ -s /etc/pacman.d/gnupg/trustdb.gpg ] || pacman-key --init; } &&
      pacman-key --populate && pacman -S --needed --noconfirm ${items}

  setup:
    services:
      collect: run systemctl enable ${items}
    locales:
      collect: run for l in ${items}; do echo "$l UTF-8" >> /etc/locale.gen; done && locale-gen
```

`packages` and `services` are also
[recipe parts](https://github.com/Nomira-OS/arch-base/tree/main/recipes)
of the base image, to import by URL.

## When not to use one

A collector is one step. If one item changes, the whole command runs
again. That is harmless for anything quick such as enabling services;
for packages, use a collector that fans out.

For slow, unrelated steps use groups instead: there, changing one leaves
the others in the cache.

## Collectors that fan out

Installing packages in one step means: one new package, and all of them
are unpacked again into one new, large layer. A collector can fan out
instead, in three commands that all run where the collector stands:

```yaml
build:
  packages:
    collect:
      resolve: run …   # gets ${items}, prints per file: name URL sha256:<hex> [key]
      each: run …      # once per bucket: its files in /nomira/in, writes /nomira/out
      then: run …      # once: all files in /nomira/in, on the merged result
```

- **resolve** turns the items into files to fetch, dependencies
  included. The key in the fourth column decides the bucket; files with
  the same key share one. Without it, the name is the key.
- **BuildKit downloads** every file itself, checked against its sha256
  and cached by it.
- **each** unpacks one bucket. Its result is a layer of its own, which
  only changes when one of the bucket's files changes: an unchanged
  package is neither unpacked nor exported nor downloaded by bootc again.
- **then** finishes on the whole: package database, install scripts,
  hooks. Optional.
- A file in two buckets is a conflict and stops the build.

The frontend knows no package manager; the base image offers the
commands as a part, for arch-base
[`packages.yml`](https://github.com/Nomira-OS/arch-base/tree/main/recipes).
The order of the steps and what runs in parallel:
[A collector that fans out](../../architecture/build/#a-collector-that-fans-out).

## One thing to keep in mind

A contribution acts backwards: the group stands in the phase `features`,
but its package is installed earlier, in `packages`. The resolved recipe
(`nomira recipe export`) lists every contribution next to its group.
