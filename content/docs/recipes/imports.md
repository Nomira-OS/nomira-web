---
title: Imports
lead: A recipe spread over several files, and parts shared between recipes. A feature file carries everything the feature needs.
weight: 13
aliases: [../includes/]
---

`imports:` at the top of a recipe lists further recipe files. Each is a
recipe or a part of one, and may import further files itself. The files
are merged into one recipe.

```yaml
# recipe.yml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
imports:
  - base.yml               # what all my machines share
  - features/terminal.yml
settings:
  name: laptop
build:
  features:
    groups:
      network: null        # base.yml has it, this machine does not
```

```yaml
# features/terminal.yml: a feature is a part of a recipe
build:
  features:
    groups:
      terminal:
        packages: [kmscon]
        services: [kmsconvt@tty1.service]
        commands:
          - copy --chmod=0644 files/kmscon/ /etc/kmscon/
```

## How files are merged

The imports in the order listed, each after its own imports, then the
importing file. The rules are those of JSON Merge Patch (RFC 7386):

- **Mappings are merged** key by key: settings, labels, env, stages,
  phases, groups.
- **Everything else is replaced** by the later file: strings, numbers,
  and lists, such as a group's commands or packages and `settings.tags`.
- **`key: null` removes** a key: a group, a stage, a phase, a label.

## Order

The first file that names a key decides its place; keys new in a later
file come after it. Groups and stages have no order, so that is all.

Phases do, and there a new phase goes where its own file puts it: after
the phase that comes before it there, or, if it is the first there,
before the next phase it names. An import can thus put `firmware` in
front of `packages`:

```yaml
# machine/laptop.yml
build:
  firmware:
    collect: run … pacman -S --needed --noconfirm ${items}
  packages: {}             # only to say where firmware goes
```

Two files that order the same phases differently are an error: the
frontend cannot know which order is meant.

## Rules

- Paths are relative to the file that imports, and must stay inside the
  recipe directory. A cycle is an error.
- Source paths of `copy` always refer to the build context, the recipe
  directory, not to the importing file.
- The frontend reads only the entry file and what it imports; other
  files in the directory never leave the machine.
- The image records the merged recipe, not the files: see
  [the record](../../frontend/schema/#settings). `nomira recipe export`
  on a recipe file shows the merge without building, with comments that
  name the file each part came from.
