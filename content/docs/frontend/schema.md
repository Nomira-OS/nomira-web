---
title: Recipe schema
lead: Every field and every flag of a recipe.
weight: 20
---

The schema is still in alpha and may change. Decoding is strict: unknown
keys are an error.

## The whole schema in one example

```yaml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
imports: [features/editor.yml]
settings:
  name: mysystem
  description: My system
  base: docker.io/library/archlinux:base
  validation: strict
  labels:
    org.example.owner: me
  env:
    LANG: C.UTF-8
  args:
    VERSION: "1.0"

stages:
  aurbuild:
    from: docker.io/library/archlinux:base-devel
    commands:
      - run --no-cache git clone https://aur.archlinux.org/example.git /src

build:
  packages:
    collect: run --mount=type=tmpfs,target=/etc/pacman.d/gnupg --mount=type=cache,target=/var/cache/pacman/pkg pacman-key --init && pacman-key --populate && pacman -S --needed --noconfirm ${items}

  features:
    validation: allow-identical
    shared: [/usr/lib/tmpfiles.d/]
    env: {MAKEFLAGS: -j4}
    groups:
      network:
        - copy files/nm/ /etc/NetworkManager/
      terminal:
        packages: [kmscon]
        services: [kmsconvt@tty1.service]
        expects: [/usr/lib/systemd/system/kmsconvt@.service]
        stages:
          theme:
            from: docker.io/library/alpine:3.22
            commands: [run mkdir /out && echo dark > /out/theme.conf]
        commands:
          - copy --chmod=0644 files/kmscon/ /etc/kmscon/
          - copy --from=theme /out/theme.conf /etc/kmscon/theme.conf
      aur:
        - copy --from=aurbuild /out/ /usr/lib/aur/

  services:
    collect: run systemctl enable ${items}
```

## settings

| Field | Meaning |
|---|---|
| `name` | Name of the image |
| `description` | Becomes the label `org.opencontainers.image.description` |
| `base` | The image the build starts from. Pin it by digest in real recipes |
| `validation` | Default policy for all phases: `strict` or `allow-identical` |
| `toolbox` | Image with busybox tools used by the check; has a default |
| `labels` | Labels on the finished image |
| `env` | Environment for all `run` commands, at build time only |
| `args` | Declared build arguments with defaults, used as `${NAME}`. Callers of BuildKit may override them (`--opt build-arg:NAME=…`); the nomira CLI does not |
| `source_date_epoch` | Seconds since 1970. Every `run` sees it as `SOURCE_DATE_EPOCH`, the image takes it as its creation time, and the file times in the recipe's layers are clamped to it (the CLI asks BuildKit for that). Default (`true`): the creation time of the base image. `false` turns all of it off |
| `record` | `true` (default) or `false`: whether the image carries the resolved recipe in its label `org.nomira.recipe`, see below |
| `volatile` | Paths every `run` gets as an empty tmpfs, so that nothing written there ends up in the image. Default `[/run, /tmp, /var/cache, /var/log, /var/tmp]`; `[]` turns it off |

**Not in a recipe:** what only the BuildKit client can set: platform,
image names, layer compression, `rewrite-timestamp`, the files behind
secrets, the pull policy. They are flags of the client, for the nomira
CLI also lines in [nomira.conf](../../architecture/client/#nomiraconf).
A recipe that still has `compression`, `secrets`, `tags` or `platforms`
in its settings is rejected with a note where they went. See
[Who decides what](../../architecture/client/#who-decides-what).

**The record.** Every image carries the recipe it was built from in its
label `org.nomira.recipe`: resolved, with all [imports](../../recipes/imports/)
merged, so later changes to an imported file cannot change it. Comments
name the file each setting, stage, phase and group came from. The label
belongs to the image's config and with it to the image digest and its
signature; it is no layer, so a change to the recipe alone rebuilds no
step. Files that `copy` takes from the recipe directory are not in it;
they are in the image where they were copied to. `nomira recipe export`
prints the label, `nomira recipe diff` compares two recipes.

**Volatile paths.** On a bootc system `/run` and `/tmp` are tmpfs, and
bootc takes `/var` from an image only at the first install, never with an
update. Logs, caches and temporary files written during the build are
therefore build artifacts; `bootc container lint` warns about them. The
frontend gives every `run` an empty tmpfs at the `volatile` paths, so
they never reach a layer, and the image stays the same however often it
is built. A `--mount` at the same path takes the place of the tmpfs, and
mounts below it, a package cache in `/var/cache/pacman/pkg` for
instance, work as usual.

**What is loaded.** From the recipe directory the frontend reads only
the entry file and the files it imports, and only what `copy` commands
name; nothing else leaves the machine. `.nomira/`, the CLI's build
output, is always left out.

## imports

A list of further recipe files, relative to the file that names them,
merged into the recipe: settings, stages, phases and groups are merged
key by key, other values are replaced, `null` removes a key. See
[Imports](../../recipes/imports/).

## stages

Optional named stages, as in a multi-stage build. Each has `from` (an
image, or a phase: the system after it) and `commands`. A group copies
from a stage with `copy --from=<stage>` or mounts it with
`--mount=type=bind,from=<stage>`. Stages at the top of the recipe are
available to all groups; a group can also have stages of its own.

## build

The phases, as a mapping from phase name to phase; the order of the keys
is the order of the phases. Each phase has either `groups` or `collect`.

| Field | Meaning |
|---|---|
| `groups` | Mapping from group name to a group. Groups are independent |
| `collect` | A `run` command containing `${items}`; makes the phase a collector |
| `validation` | Overrides the default policy for this phase (groups only) |
| `shared` | Paths exempt from the check. A trailing `/` makes it a prefix (groups only) |
| `env` | Environment for the commands of this phase |

A phase with a single group that uses `run` is the serial case and skips
the check.

## Groups

The short form is a list of commands. The long form is a mapping:

| Key | Meaning |
|---|---|
| `commands` | The list of commands |
| `stages` | Stages local to this group. They win over stages of the same name at the top |
| `expects` | Clean absolute paths that must exist in the state the phase starts from |
| any other key | A contribution, a list of items, to the collector phase of that name |

A group needs commands or at least one contribution.

## Collectors

`${items}` is replaced by the contributions of all groups of the recipe,
sorted and without duplicates, separated by spaces. Without
contributions the phase is skipped.

- A collector cannot be named `commands`, `stages` or `expects`.
- An item consists of letters, digits and `@%+=:,./_-` and does not
  start with `-`.
- A contribution to a name that is not a collector is an error.
- `items` cannot be used as the name of an arg.

## Commands

Commands are strings that start with a verb. Use a YAML block scalar for
several lines.

| Command | Flags |
|---|---|
| `run <shell>` | `--no-cache`, `--mount=type=cache,target=/path[,id=…][,sharing=shared\|private\|locked]`, `--mount=type=tmpfs,target=/path`, `--mount=type=bind,from=NAME,target=/path[,source=/path]` (read-only), `--mount=type=secret,id=ID[,target=/path][,required=true]` |
| `copy <src>… <dst>` | `--from=<stage or phase>`, `--chmod=0644`, `--chown=UID:GID` |
| `env NAME=VALUE` | none; everything after the first `=` is the value |

- **Args:** `${NAME}` is replaced only for args declared in
  `settings.args`; `$repo` and the like are left alone. A changed arg
  invalidates exactly the commands that use it.
- **Environment:** `settings.env` applies everywhere, `env` on a phase
  to its groups, the `env` command to the rest of its group. The more
  specific one wins. Nothing of it ends up in the image configuration.
- **`run --no-cache`:** the step always runs, and so does everything
  that builds on it: the rest of its group and all following phases. Put
  such steps in a group of their own, as late as possible, or in a
  stage.

## The check

For every phase with more than one group, the build records what each
group wrote or deleted and compares the groups pairwise.

| Policy | Behaviour |
|---|---|
| `strict` | Two groups touching the same file is an error |
| `allow-identical` | The same path is allowed if content and metadata are identical |

Rules that hold under both policies:

- Directories that several groups create are never a conflict.
- A file in one group and a directory of the same name in another is a
  conflict.
- Deleting a directory conflicts with anything another group does below
  it.
- Changing only mode or owner counts as writing the path.

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

## Known limits

- `copy` does not support paths with spaces; `--chown` is numeric only.
- `copy --from` inside a stage is not supported yet.
- Extended attributes and hard links are not yet recorded as writes of
  their own.
- The platform follows the build host; multi-architecture builds are
  open.
- Checked by end-to-end tests with a real BuildKit: everything on this
  page except args, `run --no-cache`, `labels` and `--chown`.
