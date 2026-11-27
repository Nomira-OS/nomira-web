---
title: Recipe schema
lead: Every field and every flag of a recipe.
weight: 20
---

The schema is still in alpha and may change. Decoding is strict: an
unknown key is an error, and every error names the file and line. For editors there is a
[JSON Schema](https://github.com/Nomira-OS/nomira/blob/main/schema/recipe.schema.json);
recipes stay YAML.

## The whole schema in one example

```yaml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
imports: [features/editor.yml]
settings:
  base: docker.io/library/archlinux:base
  labels:
    org.opencontainers.image.description: My system
  env:
    LANG: C.UTF-8
  mounts:
    /var/cache/pacman/pkg: type=cache,sharing=locked
    /var/log: type=tmpfs
  source_date_epoch: 1794268800
  record: true

stages:
  aurbuild:
    from: docker.io/library/archlinux:base-devel
    commands:
      - run --no-cache git clone https://aur.archlinux.org/example.git /src

build:
  packages:
    collect: run pacman -S --needed --noconfirm ${items}

  features:
    env: {MAKEFLAGS: -j4}
    network:
      - copy files/nm/ /etc/NetworkManager/
    terminal:
      packages: [kmscon]
      services: [kmsconvt@tty1.service]
      commands:
        - env THEME=dark
        - copy --chmod=0644 files/kmscon/ /etc/kmscon/
    aur:
      - copy --from=aurbuild /out/ /usr/lib/aur/
    locales:
      collect: run locale-gen ${items}

  services:
    collect: run systemctl enable ${items}
```

## settings

| Field | Meaning |
|---|---|
| `base` | The image the build starts from. Pin it by digest in real recipes |
| `labels` | Labels on the finished image, `org.opencontainers.image.description` for one |
| `env` | Environment for every `run`, at build time only |
| `mounts` | Mounts for every `run`, also in stages: target → what `--mount=` takes without the target. Only `type=tmpfs` and `type=cache`. A run's own mount at the same target wins. None by default |
| `source_date_epoch` | Seconds since 1970. Every `run` sees it as `SOURCE_DATE_EPOCH`, the image takes it as its creation time, and the file times in the recipe's layers are clamped to it (the CLI asks BuildKit for that). Default (`true`): the creation time of the base image. `false` turns all of it off |
| `record` | `true` (default) or `false`: whether the image carries the resolved recipe in its label `org.nomira.recipe`, see below |

**Not in a recipe:** what only the BuildKit client can set: platform,
image names, layer compression, `rewrite-timestamp`, the files behind
secrets, the pull policy. They are flags of the client, for the nomira
CLI also lines in [nomira.conf](../../architecture/client/#nomiraconf).
See [Who decides what](../../architecture/client/#who-decides-what).

**The record.** Every image carries the recipe it was built from in its
label `org.nomira.recipe`: resolved, with all [imports](../../recipes/imports/)
merged, so later changes to an imported file cannot change it. Comments
name the file each setting, stage, phase and group came from. The label
belongs to the image's config and with it to the image digest and its
signature; it is no layer, so a change to the recipe alone rebuilds no
step. Files that `copy` takes from the recipe directory are not in it;
they are in the image where they were copied to. `nomira recipe export`
prints the label, `nomira recipe diff` compares two recipes. The label
`org.nomira.frontend.version` names the frontend that built the image.

**Mounts for every run.** On a bootc system `/run` and `/tmp` are tmpfs,
and bootc takes `/var` from an image only at the first install, never
with an update. Logs, caches and temporary files written during the
build are therefore build artifacts; `bootc container lint` warns about
them. `settings.mounts` keeps them out: a tmpfs there, and a BuildKit
cache where downloads should survive between builds. Mounts nest, so a
cache below a tmpfs works. The base image's
[`recipes/mounts.yml`](https://github.com/Nomira-OS/arch-base/tree/main/recipes)
sets the usual ones. See [Mounts](../../architecture/mounts/).

**What is loaded.** From the recipe directory the frontend reads only
the entry file and the files it imports, and only what `copy` commands
name; nothing else leaves the machine. `.nomira/`, the CLI's build
output, is always left out.

## imports

A list of further recipe files, merged into the recipe: settings,
stages, phases and groups key by key, other values replaced, `null`
removes a key. An entry is a path relative to the importing file, or a
URL, which BuildKit fetches; `#sha256=<hex>` at its end pins the content
(required for `http`). See [Imports](../../recipes/imports/).

## stages

Optional named stages, as in a multi-stage build. Each has `from`, an
image, and `commands`. A group copies from a stage with
`copy --from=<stage>` or mounts it with `--mount=type=bind,from=<stage>`.

## build

The phases, as a mapping from phase name to phase; the order of the keys
is the order of the phases. Under a phase stand its groups, by name;
groups are independent of each other.

| Key under a phase | Meaning |
|---|---|
| `env` | Environment for the commands of this phase |
| `collect` | The short form of a phase that is one collector, named after the phase; then `env` is the only other key |
| any other key | A group |

A phase with a single group that uses `run` is the serial case and has
nothing to check.

## Groups

The short form is a list of commands. The long form is a mapping:

| Key | Meaning |
|---|---|
| `commands` | The list of commands |
| `collect` | Makes the group a collector named after the group; then it has no other key |
| any other key | A contribution, a list of items, to the collector of that name |

A group needs commands or at least one contribution. `env` is not a key
of a group: use the phase's `env` or the `env` command.

## Collectors

`${items}` is replaced by the contributions of all groups of the recipe,
sorted and without duplicates, separated by spaces. Without
contributions the collector is skipped.

- A collector is a group with `collect`, or a phase with `collect`
  directly under it. Its name is unique in the recipe.
- Several collectors in one phase run side by side, like other groups,
  and are checked like them.
- An item consists of letters, digits and `@%+=:,./_-` and does not
  start with `-`.
- A contribution to a name that is not a collector is an error.

## Commands

Commands are strings that start with a verb. Use a YAML block scalar for
several lines.

| Command | Flags |
|---|---|
| `run <shell>` | `--no-cache`, `--mount=type=cache,target=/path[,id=…][,sharing=shared\|private\|locked]`, `--mount=type=tmpfs,target=/path`, `--mount=type=bind,from=NAME,target=/path[,source=/path]` (read-only), `--mount=type=secret,id=ID[,target=/path][,required=true]` |
| `copy <src>… <dst>` | `--from=<stage or phase>`, `--chmod=0644`, `--chown=UID:GID` |
| `env NAME=VALUE` | none; everything after the first `=` is the value |

- **Environment:** `settings.env` applies everywhere, `env` on a phase
  to its groups, the `env` command to the commands after it in its group
  or stage. The more specific one wins. Nothing of it ends up in the
  image configuration. A changed value reruns what it reaches:
  `settings.env` every run, the `env` command only the commands after
  it.
- **`${…}`** is left to the shell; the frontend replaces nothing.
- **`run --no-cache`:** the step always runs, and so does everything
  that builds on it: the rest of its group and all following phases. Put
  such steps in a group of their own, as late as possible, or in a
  stage.

## The check

For every phase with more than one group, the build compares what the
groups wrote and deleted. Allowed is what is the same in every order:
the same file with the same content, mode and owner; the same deletion.
Everything else two groups both touch is a conflict. How it works:
[The conflict check](../../architecture/conflict-check/).

## Groups without run

A group without `run` is built on an empty state and merged, so that it
does not depend on the base image or on earlier phases. On every build a
check compares it with the state the phase starts from. The group is
built on that state instead if

- one of its directories is a symbolic link or anything but a directory
  there, or exists with another mode, owner or group, or
- one of its files or symbolic links meets a directory or a symbolic
  link there.

The steps of such a group carry the note `WARNING: not independent of
earlier state` with the first path in the way.

## Build options

What a BuildKit client passes with `--opt`; the nomira CLI sets them.

| Option | Meaning |
|---|---|
| `filename` | The recipe in the `dockerfile` local; default `recipe.yml` |
| `mode` | `build` (default), `lint` (only parse the recipe and its imports) or `resolve` (output the merged recipe as `recipe.yml`); lint and resolve also output `version` |
| `image-resolve-mode` | `default`, `pull` or `local`, for the base image and stages |
| `toolbox` | The busybox image the checks run in; has a default |

## Known limits

- `copy` does not support paths with spaces; `--chown` is numeric only.
- `copy --from` inside a stage is not supported yet.
- Extended attributes and hard links are not yet recorded as writes of
  their own.
- The platform follows the build host; multi-architecture builds are
  open.
- Checked by end-to-end tests with a real BuildKit: everything on this
  page except `run --no-cache`, `labels` and `--chown`.
