---
title: Splitting recipes
lead: With include a recipe spreads over several files. A feature file carries everything the feature needs.
weight: 20
---

## One rule

`include: <file>` can stand in place of a phase, a group or a list of
commands. It is replaced by the content of the file.

```yaml
# recipe.yml
settings:
  base: ghcr.io/nomira-os/nomira-image:TAG

phases:
  - include: phases/collectors.yml          # one phase or a list of phases
  - name: features
    groups:
      terminal: {include: features/terminal.yml}   # a group
      network:
        commands: {include: features/network-commands.yml}   # a list of commands
```

## A feature in one file

A group file in the long form brings its packages, services, build
stages and files together:

```yaml
# features/terminal.yml
packages: [kmscon]
services: [kmsconvt@tty1.service]
expects: [/usr/lib/systemd/system/kmsconvt@.service]
prepare:
  theme:
    from: docker.io/library/alpine:3.22
    commands: {include: theme-commands.yml}
commands:
  - copy files/kmscon/ /etc/kmscon/
  - copy --from=theme /out/theme.conf /etc/kmscon/theme.conf
```

To add the feature to a system, one line in the recipe is enough. To
remove it, delete that line.

Stages under `prepare` in a group belong to that group. Two feature
files can both have a stage called `build` without getting in each
other's way. Stages that several groups share stay at the top of the
recipe.

## Rules

- Included files may include further files, to any depth. A cycle is an
  error.
- Paths are relative to the including file and must stay inside the
  recipe directory.
- `include` stands alone: no other key next to it.
- `settings` exists only in the entry file.
- The sources of `copy` always refer to the recipe directory, not to the
  included file.

Includes, group files and their stages are checked by end-to-end tests
with a real BuildKit.
