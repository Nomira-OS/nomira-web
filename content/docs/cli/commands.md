---
title: Commands
lead: All commands, flags and environment variables.
weight: 10
---

```text
nomira build    [flags]          build the recipe, check and publish the image
nomira validate [flags] [image]  run validation.d hooks and the boot test
nomira lint     [flags]          check the recipe
nomira graph    [flags]          print the pipeline as a Mermaid flowchart
nomira recipe export [-o FILE] [SOURCE]   the recipe an image was built from
nomira recipe diff [--origin] [A [B]]     compare two recipes
nomira version                   print the version
```

`nomira <command> -h` shows the flags of a command.

## Flags

| Flag | Meaning |
|---|---|
| `-f recipe.yml` | Entry file of the recipe; default `$NOMIRA_RECIPE`, otherwise `/etc/nomira/recipe.yml` |
| `-o DIR` | Output directory, see below for the default |
| `--dry-run` | Only print the commands, run nothing |
| `--progress plain` | A log with every step and its time (text output) |
| `--no-boot-test` | Skip the bcvk boot test |
| `--log-format json` | Output for log collectors, see [Output](#output); default `text` |
| `--color never` | Colour in text output: `auto` (on a terminal, unless `NO_COLOR` is set), `always` or `never` |
| `--origin` | `recipe diff`: also compare where each part came from |

Flags may come before or after the other arguments.

Not every flag applies to every command. No flag changes the image:
the frontend (the recipe's first line, `# syntax=…`), base image, args,
compression and secrets all come from the recipe, so the same recipe
builds the same image whoever runs it.

## Environment variables

| Variable | Meaning |
|---|---|
| `NOMIRA_RECIPE` | Recipe to use without `-f` |
| `BUILDKIT_HOST` | Use this buildkitd instead of looking for one |
| `NOMIRA_BUILDKIT_IMAGE` | Image for the buildkitd container that the CLI manages |
| `NOMIRA_LOG_FORMAT` | `text` or `json`, as `--log-format` |
| `NOMIRA_COLOR` | `auto`, `always` or `never`, as `--color` |
| `NO_COLOR` | Any value turns colour off in `auto` |

## Where the result goes

`nomira build` writes an OCI image layout directory: for the machine's
recipe in `/etc/nomira` to `/var/lib/nomira/<name>.oci`, for a recipe
anywhere else to `.nomira/<name>.oci` next to it. It is built and
checked in `.build/<name>.oci` next to that and published only when the
checks pass. A rebuild adds only the layers that changed and removes
those no longer used.

## The recipe of an image

Every image carries the recipe it was built from, with all imports
merged, in its label `org.nomira.recipe`. `nomira recipe export` prints
it, or writes it to a file with `-o`; `nomira recipe diff A B` compares
two recipes. A source is one of:

| Source | Meaning |
|---|---|
| `booted` | The image the running system booted, as `bootc status` names it; the default. nomira checks that the image it finds there is still that one |
| `recipe.yml` | A recipe file, resolved by its frontend as a build would |
| a directory | An OCI layout directory, such as the output of `nomira build` |
| `docker://…`, `oci:…`, `containers-storage:…` | Any image skopeo reads |

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
every line, shows the commands nomira runs in bold and frames the output
of buildctl with two rules. Colour on a terminal, unless `NO_COLOR` is
set.

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
what is read from the recipe directory.
