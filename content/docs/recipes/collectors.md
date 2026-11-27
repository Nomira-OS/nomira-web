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
again. That is right for packages, which form one transaction anyway,
and harmless for anything quick such as enabling services.

For slow, unrelated steps use groups instead: there, changing one leaves
the others in the cache.

## One thing to keep in mind

A contribution acts backwards: the group stands in the phase `features`,
but its package is installed earlier, in `packages`. The resolved recipe
(`nomira recipe export`) lists every contribution next to its group.
