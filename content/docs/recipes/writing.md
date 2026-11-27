---
title: Writing recipes
lead: A recipe builds your system in phases and groups. Keep run out of the groups, and most of it survives a new base image.
weight: 10
---

> Collectors, the long form of groups and `expects` are new. They are
> checked by end-to-end tests on small test images; a whole system on
> the nomira base image has not been built with them yet.

## A small example

```yaml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
settings:
  name: mysystem
  description: My system
  base: ghcr.io/nomira-os/arch-base:TAG

phases:
  - name: packages
    collect: run --mount=type=tmpfs,target=/etc/pacman.d/gnupg --mount=type=cache,target=/var/cache/pacman/pkg pacman-key --init && pacman-key --populate && pacman -S --needed --noconfirm ${items}

  - name: features
    groups:
      terminal:
        packages: [kmscon]
        services: [kmsconvt@tty1.service]
        commands:
          - copy files/kmscon/ /etc/kmscon/
      network:
        packages: [networkmanager]
        services: [NetworkManager.service]
        commands:
          - copy --chmod=0600 files/nm/ /etc/NetworkManager/system-connections/

  - name: services
    collect: run systemctl enable ${items}
```

NetworkManager stands for any network manager here; the Arch Wiki lists
the choices in [Network configuration](https://wiki.archlinux.org/title/Network_configuration).

Read it like this: there are two features, `terminal` and `network`.
Each says which packages and services it needs and which files it
brings. Two phases, `packages` and `services`, collect those wishes and
carry them out in one step each.

## Phases

Phases are a list and run in that order. A phase is one of two kinds:

- **A phase with `groups`** builds independent parts at the same time.
- **A phase with `collect`** runs one command, see
  [Collectors](../collectors/).

## Groups

Groups of a phase have names and no order. They are built at the same
time and must not change the same files; the build checks that.

A group has two forms. The short one is a list of commands:

```yaml
network:
  - copy files/nm/ /etc/NetworkManager/system-connections/
```

The long one is a mapping. Four keys have a fixed meaning:

| Key | Meaning |
|---|---|
| `commands` | The list of commands |
| `prepare` | Build stages that only this group uses |
| `expects` | Paths that must exist before the group is applied |
| `include` | Read the group from a file |

Every other key, such as `packages` above, is a contribution to the
collector of that name. A group may consist of contributions alone:

```yaml
editor:
  packages: [vim]
```

## The three commands

| Command | Purpose |
|---|---|
| `copy` | Copies files from the recipe directory, or from a `prepare` stage, into the image |
| `run` | Runs a shell command |
| `env` | Sets a variable for the following commands of the group |

Useful additions:

- `copy --chmod=0644` and `copy --chown=0:0` set mode and owner.
- `copy --from=<stage>` copies from a `prepare` stage.
- `run --mount=type=cache,target=/path` keeps a directory between
  builds, the package cache for instance.
- `run --no-cache` always runs a step.

## Prefer copy to run

A group that only copies does not look at the system it is applied to,
so nothing that happens before it can make it stale. A group that uses
`run` is executed on the system as it is at that point, and has to run
again whenever that changes, for instance with every new base image.

So the aim is: **`run` belongs in collectors and `prepare` stages,
groups copy.** What that means for common tasks:

| Task | Instead of `run` in a group |
|---|---|
| Install a package | Contribute it to a `packages` collector |
| Enable a service | Contribute it to a `services` collector |
| Generate a file with a script | Run the script in a `prepare` stage, copy the result |
| Write a one-line file | Keep the file in the recipe and copy it |

## Where files belong

In the finished system `/usr` is read-only, `/etc` is merged on updates,
and `/var` is not part of the image. Put the content of the system into
`/usr` and `/etc`, not into `/var`, `/opt` or `/usr/local`.

The initramfs is rebuilt by the base image whenever a package needs it,
see [Kernel, modules, firmware](../../base-image/building-on-it/#kernel-modules-firmware).

Every image carries its recipe in `/usr/share/nomira/recipe`, and the
first boot copies it to `/etc/nomira`; see `record` in the
[schema](../../frontend/schema/#settings).

## Build and check

```sh
export NOMIRA_RECIPE="$PWD/recipe.yml"   # or pass -f each time
nomira lint      # check the structure of the recipe
nomira build     # build the image
nomira graph     # print the pipeline as a diagram
```

All fields and flags are in the [recipe schema](../../frontend/schema/).
