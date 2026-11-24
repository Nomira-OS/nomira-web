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
  platforms: [linux/amd64]
  tags: ["${VERSION}", stable]

prepare:
  aurbuild:
    from: docker.io/library/archlinux:base-devel
    commands:
      - run --no-cache git clone https://aur.archlinux.org/example.git /src

phases:
  - name: packages
    collect: run --mount=type=tmpfs,target=/etc/pacman.d/gnupg --mount=type=cache,target=/usr/lib/sysimage/cache/pacman/pkg pacman-key --init && pacman-key --populate && pacman -S --needed --noconfirm ${items}

  - name: features
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
        prepare:
          theme:
            from: docker.io/library/alpine:3.22
            commands: [run mkdir /out && echo dark > /out/theme.conf]
        commands:
          - copy --chmod=0644 files/kmscon/ /etc/kmscon/
          - copy --from=theme /out/theme.conf /etc/kmscon/theme.conf
      aur:
        - copy --from=aurbuild /out/ /usr/lib/aur/

  - name: services
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
| `uki` | `true` or `false`: end with a unified kernel image. Default: if `base` is a bootc image (label `containers.bootc=1`). `--opt uki=` overrides it |
| `args` | Declared build arguments with defaults; `--build-arg` overrides them |
| `platforms`, `tags` | Checked and reported, but not acted on by the frontend. The caller decides |

## prepare

Optional named stages, as in a multi-stage build. Each has `from` (an
image) and `commands`. A group copies from a stage with
`copy --from=<stage>`. Stages at the top of the recipe are available to
all groups; a group can also have stages of its own.

## phases

A list; the order matters. Each phase has a `name`, required and unique,
and either `groups` or `collect`.

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
| `prepare` | Stages local to this group. They win over stages of the same name at the top |
| `expects` | Clean absolute paths that must exist in the state the phase starts from |
| `include` | Read the group from a file; no other key next to it |
| any other key | A contribution, a list of items, to the collector phase of that name |

A group needs commands or at least one contribution.

## Collectors

`${items}` is replaced by the contributions of all groups of the recipe,
sorted and without duplicates, separated by spaces. Without
contributions the phase is skipped.

- A collector cannot be named `commands`, `prepare`, `expects` or
  `include`.
- An item consists of letters, digits and `@%+=:,./_-` and does not
  start with `-`.
- A contribution to a name that is not a collector is an error.
- `items` cannot be used as the name of an arg.

## Commands

Commands are strings that start with a verb. Use a YAML block scalar for
several lines.

| Command | Flags |
|---|---|
| `run <shell>` | `--no-cache`, `--mount=type=cache,target=/path[,id=…][,sharing=shared\|private\|locked]`, `--mount=type=tmpfs,target=/path` |
| `copy <src>… <dst>` | `--from=<stage>`, `--chmod=0644`, `--chown=UID:GID` |
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
  `prepare` stage.

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
- `copy --from` inside a `prepare` stage is not supported yet.
- Extended attributes and hard links are not yet recorded as writes of
  their own.
- The platform follows the build host; multi-architecture builds are
  open.
- Checked by end-to-end tests with a real BuildKit: everything on this
  page except args, `run --no-cache`, `labels` and `--chown`.
