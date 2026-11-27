---
title: Commands
lead: All commands, flags and environment variables.
weight: 10
---

```text
nomira build    [flags]          build the recipe and publish the image
nomira lint     [flags]          check the recipe and its imports
nomira recipe export [-o FILE] [SOURCE]   the recipe an image was built from
nomira recipe diff [--origin] [A [B]]     compare two recipes
nomira version                   print the version
```

`nomira <command> -h` shows the flags of a command. `build`, `lint` and
resolving a recipe file for `recipe` all go through BuildKit. Checks of
the image are steps of the recipe, such as `run bootc container lint`.

## Flags

| Flag | Meaning |
|---|---|
| `-f recipe.yml` | Entry file of the recipe; default `$NOMIRA_RECIPE`, otherwise `/etc/nomira/recipe.yml` |
| `-o DIR` | Output directory, see below for the default |
| `--dry-run` | Only print the commands, run nothing |
| `--progress plain` | buildctl's own progress display (`plain`, `tty`, `auto`) instead of nomira's (`nomira`, the default) |
| `--log-format json` | Output for log collectors, see [Output](#output); default `text` |
| `--color never` | Colour in text output: `auto` (on a terminal, unless `NO_COLOR` is set), `always` or `never` |
| `--origin` | `recipe diff`: also compare where each part came from |
| `--name NAME` | Image name, for the output directory; default `system` for the recipe in `/etc`, else the recipe directory's name |
| `--compression gzip` | Layer compression: `zstd` (default), `gzip`, `uncompressed` |
| `--secret id=ID,src=FILE` | A secret the recipe mounts; may be repeated |
| `--pull always` | `always` pull images again (a moved `latest`), pull `missing` ones (default), `never` |
| `--config FILE` | The `nomira.conf` to read |

Flags may come before or after the other arguments.

Not every flag applies to every command. What a frontend can act on is
in the recipe; what only the BuildKit client can set is a flag: see
[Who decides what](../../architecture/client/#who-decides-what).

## nomira.conf

Flags for repeated runs go into `nomira.conf` next to the recipe, or the
file `--config` or `$NOMIRA_CONFIG` names, one `flag = value` per line:

```ini
# /etc/nomira/nomira.conf
name = laptop
compression = zstd
secret = id=db.key,src=keys/db.key       # relative to this file
secret = id=db.crt,src=/etc/kernel/secureboot/db.crt
pull = always
```

The command line and the flag's environment variable win over the file.
A flag of another command is skipped, a name no command knows is an
error. `f`, `config` and `dry-run` cannot be set there.

## Versions

`nomira version` prints the CLI's version; after a build, and after
lint, nomira compares it with the frontend's, which the frontend writes
into the image as the label `org.nomira.frontend.version`. The same `major.minor` works together; patches do
not matter. Another `major.minor`, or a build that is not a release
(`sha-…`), gives a warning and builds anyway.

## Environment variables

| Variable | Meaning |
|---|---|
| `NOMIRA_RECIPE` | Recipe to use without `-f` |
| `NOMIRA_CONFIG` | `nomira.conf` to read |
| `BUILDKIT_HOST` | Use this buildkitd instead of looking for one |
| `NOMIRA_BUILDKIT_IMAGE` | Image for the buildkitd container that the CLI manages |
| `NOMIRA_LOG_FORMAT` | `text` or `json`, as `--log-format` |
| `NOMIRA_COLOR` | `auto`, `always` or `never`, as `--color` |
| `NO_COLOR` | Any value turns colour off in `auto` |

## Where the result goes

`nomira build` writes an OCI image layout directory: for the machine's
recipe in `/etc/nomira` to `/var/lib/nomira/system.oci`, for a recipe
anywhere else to `.nomira/<name>.oci` next to it. It is built in
`.build/<name>.oci` next to that and published only when the build
succeeded, with every check the recipe runs. A rebuild adds only the layers that changed and removes
those no longer used.

## The recipe of an image

Every image carries the recipe it was built from, with all imports
merged, in its label `org.nomira.recipe`. `nomira recipe export` prints
it, or writes it to a file with `-o`; `nomira recipe diff A B` compares
two recipes. A source is one of:

| Source | Meaning |
|---|---|
| `booted` | The image the running system booted, as `bootc status` names it; the default. nomira checks that the image it finds there is still that one |
| `recipe.yml` | A recipe file, resolved by its frontend through BuildKit as a build would, imports by URL included |
| a directory | An OCI layout directory, such as the output of `nomira build`; nomira reads it itself |
| `docker://…`, `containers-storage:…` | Any other image, read with skopeo |

Without arguments, `nomira recipe diff` compares the booted image with
the recipe `-f` names: what the next build would change. Both sides are
complete recipes, so imports cannot get in the way. Comments on where
each part came from are left out, unless `--origin`.

```sh
sudo nomira recipe export -o /etc/nomira/recipe.yml   # on a freshly installed machine
nomira recipe diff                                   # booted image vs. /etc/nomira/recipe.yml
nomira recipe diff docker://ghcr.io/me/laptop:1 recipe.yml
```

## Output

Text output, the default, puts the time since the start in front of
every line and shows the commands nomira runs in bold. The build itself
appears one line per event: a finished step with its time, a step still
running after three seconds, the output of steps indented below them.
Steps from the cache are only counted; bookkeeping such as resolving
images or the frontend's checks shows only when it fails or is slow.
`--progress plain` or `tty` shows buildctl's own display instead.
Colour on a terminal, unless `NO_COLOR` is set.

```text
 0:00  + buildctl … build …
 0:03  ▸ [1/5 packages] run pacman -S --needed --noconfirm … …
        │ [1/5 packages] installing nano...
 0:41  ✓ [1/5 packages] run pacman -S --needed --noconfirm …  0:41
 0:42  ✓ [3/5 features/ssh] copy files/sshd/ /etc/ssh/sshd_config.d/  0.0s
 0:58  ✓ [5/5 uki/uki] run mkdir -p /boot/EFI/Linux && …  0:16
 1:04  ✓ exporting to oci image format  6.1s
 1:04  • 9 steps from the cache
```

`--log-format json` writes one JSON object per line to stderr, for Loki,
an OpenTelemetry collector or any other log collector:

```json
{"time":"…","level":"INFO","msg":"command started","component":"nomira","cmd":"buildctl","args":"…"}
{"time":"…","level":"INFO","msg":"step finished","component":"buildkit","step":"[1/5 packages] run pacman …","cached":false,"duration_ms":41230}
{"time":"…","level":"INFO","msg":"installing nano…","component":"buildkit","step":"[1/5 packages] run pacman …","stream":"stdout"}
{"time":"…","level":"INFO","msg":"command finished","component":"nomira","cmd":"buildctl","duration_ms":61042}
```

A failed step is `step failed` at level `ERROR` with the `error`. The
path of the published image stays on stdout as in text mode.

Step names say where in the recipe a step belongs: `[2/5 features/ssh]`
is the group `ssh` of the second of five phases, `[stage aur]` a stage,
`[check 2/5 features/ssh]` the frontend's check of that group, `[load]`
what is read from the recipe directory or fetched by URL.
