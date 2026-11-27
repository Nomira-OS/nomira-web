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
nomira version                   print the version
```

`nomira <command> -h` shows the flags of a command.

## Flags

| Flag | Meaning |
|---|---|
| `-f recipe.yml` | Entry file of the recipe; default `$NOMIRA_RECIPE`, otherwise `/etc/nomira/recipe.yml` |
| `-o DIR` | Output directory, see below for the default |
| `--dry-run` | Only print the commands, run nothing |
| `--progress plain` | A log with every step and its time |
| `--no-boot-test` | Skip the bcvk boot test |

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

## Where the result goes

`nomira build` writes an OCI image layout directory: for the machine's
recipe in `/etc/nomira` to `/var/lib/nomira/<name>.oci`, for a recipe
anywhere else to `.nomira/<name>.oci` next to it. It is built and
checked in `.build/<name>.oci` next to that and published only when the
checks pass. A rebuild adds only the layers that changed and removes
those no longer used.
