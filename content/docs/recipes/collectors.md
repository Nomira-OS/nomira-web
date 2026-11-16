---
title: Collectors
lead: Groups say what they need; one command does it for all of them.
weight: 12
---

> The mechanism is checked by end-to-end tests with a real BuildKit. The
> collectors shown here for pacman and systemd have not been run on the
> nomira base image yet.

## The problem they solve

Some things have to happen in one step. Two groups that both install a
package both write the package database, so they can never be
independent. Without collectors, a feature would be torn apart: its
package in one phase, its files in another, its service in a third.

## How they work

A phase with `collect` instead of `groups` is a collector. It runs one
command. `${items}` in that command is replaced by everything the groups
of the recipe contributed under the name of the phase.

```yaml
phases:
  - name: packages
    collect: run pacman -S --needed --noconfirm ${items}

  - name: features
    groups:
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

## What an item may be

A single word of letters, digits and `@%+=:,./_-` that does not start
with `-`. Anything else is an error before the build starts. This keeps
a contribution from changing the meaning of the command.

## Useful collectors

```yaml
- name: packages
  collect: run --mount=type=cache,target=/usr/lib/sysimage/cache/pacman/pkg pacman -S --needed --noconfirm ${items}

- name: services
  collect: run systemctl enable ${items}

- name: locales
  collect: run for l in ${items}; do echo "$l UTF-8" >> /etc/locale.gen; done && locale-gen
```

## When not to use one

A collector is one step. If one item changes, the whole command runs
again. That is right for packages, which form one transaction anyway,
and harmless for anything quick such as enabling services.

For slow, unrelated steps use groups instead: there, changing one leaves
the others in the cache.

## One thing to keep in mind

A contribution acts backwards: the group stands in the phase `features`,
but its package is installed earlier, in `packages`. `nomira graph`
draws these connections as dotted lines.
