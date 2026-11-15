---
title: Writing recipes
lead: A recipe builds your system in phases and groups.
weight: 10
---

## A small example

```yaml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
settings:
  name: mysystem
  description: My system
  base: ghcr.io/nomira-os/nomira-image:TAG

phases:
  - name: packages
    groups:
      system:
        - run pacman -S --needed --noconfirm networkmanager kmscon

  - name: configuration
    groups:
      terminal:
        - copy files/kmscon/ /etc/kmscon/
      network:
        - copy files/nm/ /etc/NetworkManager/system-connections/

  - name: finish
    groups:
      services:
        - run systemctl enable NetworkManager.service
```

## Phases and groups

- **Phases** are a list and run in that order.
- **Groups** of a phase have names and no order. They run at the same
  time and must not change the same files.
- A phase with a single group is the simple case: one step after
  another.

Rule of thumb: package installations belong in a single group, because
they all change the package database. Configuration splits well into
groups.

## The three commands

| Command | Purpose |
|---|---|
| `run` | Runs a shell command |
| `copy` | Copies files from the recipe directory into the image |
| `env` | Sets a variable for the following commands of the group |

Useful additions:

- `run --mount=type=cache,target=/path` keeps a directory between
  builds, the package cache for instance.
- `run --no-cache` always runs a step.
- `copy --chmod=0644` and `copy --chown=0:0` set mode and owner.

## Where files belong

In the finished system `/usr` is read-only, `/etc` is merged on updates,
and `/var` is not part of the image. Put the content of the system into
`/usr` and `/etc`, not into `/var`, `/opt` or `/usr/local`.

After changing the kernel or adding firmware that is needed early,
`/usr/libexec/nomira-initramfs` regenerates the initramfs. More in
[Building on the base image](../../base-image/building-on-it/).

## Build and check

```sh
nomira lint      # check the structure of the recipe
nomira build     # build the image
nomira graph     # print the pipeline as a diagram
```

All fields and flags are in the [recipe schema](../../frontend/schema/).
