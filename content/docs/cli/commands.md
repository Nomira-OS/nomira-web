---
title: Commands
lead: All commands, flags and environment variables.
weight: 10
---

```text
nomira build    [flags]          build the recipe and check the image
nomira switch   [flags]          hand the last checked build to bootc switch
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
| `--dry-run` | Only print the commands, run nothing |
| `--build-arg NAME=VALUE` | Override an arg declared in `settings.args` |
| `--frontend IMAGE` | Frontend image; otherwise the `# syntax=` line of the recipe, otherwise `ghcr.io/nomira-os/nomira:1-alpha` |
| `--name NAME` | Image name; otherwise `settings.name`, otherwise the directory name |
| `--no-boot-test` | Skip the bcvk boot test |
| `--apply` | Reboot into the new image right after `switch` |

Not every flag applies to every command.

## Environment variables

| Variable | Meaning |
|---|---|
| `NOMIRA_RECIPE` | Recipe to use without `-f` |
| `BUILDKIT_HOST` | Use this buildkitd instead of looking for one |
| `NOMIRA_BUILDKIT_IMAGE` | Image for the buildkitd container that the CLI manages |
| `NOMIRA_SUDO` | Command used to become root (default: `sudo`) |

## Where the result goes

`nomira build` writes an OCI image layout directory: for the machine's
recipe in `/etc/nomira` to `/var/lib/nomira/<name>.oci`, for a recipe
anywhere else to `.nomira/<name>.oci` next to it. A rebuild adds only the layers that
changed and removes those no longer used.
