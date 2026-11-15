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
    groups:
      system:
        - run --mount=type=cache,target=/usr/lib/sysimage/cache/pacman/pkg pacman -S --needed --noconfirm kmscon
  - name: configs
    validation: allow-identical
    shared: [/usr/lib/tmpfiles.d/]
    env: {MAKEFLAGS: -j4}
    groups:
      kmscon:
        - env THEME=dark
        - copy --chmod=0644 files/kmscon/ /etc/kmscon/
      aur:
        - copy --from=aurbuild /out/ /usr/lib/aur/
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
| `args` | Declared build arguments with defaults; `--build-arg` overrides them |
| `platforms`, `tags` | Checked and reported, but not acted on by the frontend. The caller decides |

## prepare

Optional named stages, as in a multi-stage build. Each has `from` (an
image) and `commands`. A phase copies from a stage with
`copy --from=<stage>`.

## phases

A list; the order matters. Each phase has:

| Field | Meaning |
|---|---|
| `name` | Required and unique; appears in messages |
| `groups` | Mapping from group name to a list of commands. Groups are independent |
| `validation` | Overrides the default policy for this phase |
| `shared` | Paths exempt from the check. A trailing `/` makes it a prefix |
| `env` | Environment for the groups of this phase |

A phase with a single group is the serial case and skips the check.

## Commands

Commands are strings that start with a verb. Use a YAML block scalar for
several lines.

| Command | Flags |
|---|---|
| `run <shell>` | `--no-cache`, `--mount=type=cache,target=/path[,id=…][,sharing=shared\|private\|locked]` |
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

## Known limits

- `copy` does not support paths with spaces; `--chown` is numeric only.
- Extended attributes and hard links are not yet recorded as writes of
  their own.
- The platform follows the build host; multi-architecture builds are
  open.
- New in the schema and covered by tests, but not yet run in a real
  build: `env`, `run --no-cache`, `labels` and `include`.
