---
title: Quick start
lead: Build a system image you could install. Nothing on your machine changes.
weight: 10
untested: true
---

You need the [nomira CLI](../../cli/install/).

## 1. Write the recipe

In a new directory `mysystem`, create `recipe.yml`, the
[minimal example](https://github.com/Nomira-OS/arch-base/blob/main/examples/minimal/recipe.yml):

```yaml
# syntax=ghcr.io/nomira-os/nomira:sha-e1146b9
imports:
  - https://raw.githubusercontent.com/Nomira-OS/arch-base/50c6493a4e8520456e409f767b052ac2e3977861/recipes/services.yml
  - https://raw.githubusercontent.com/Nomira-OS/arch-base/50c6493a4e8520456e409f767b052ac2e3977861/recipes/lint.yml

settings:
  base: ghcr.io/nomira-os/arch-base:sha-50c6493

build:
  packages: {}            # features comes after packages (and before services)
  features:
    network:
      packages: [networkmanager]
      services: [NetworkManager.service]
```

The group `network` names what it needs. The rest comes from the
[recipe parts](https://github.com/Nomira-OS/arch-base/tree/main/recipes)
of the base image, imported by URL and pinned to a commit: the phase
`packages` installs the packages of all groups, `services` enables the
services, and `lint` runs `bootc container lint` on the result.
`nomira recipe export recipe.yml` shows the recipe with everything
imported. Newer tags than these: see
[Tags](../../recipes/base-images/arch-base/versions/#tags).

A system for a real machine needs more, firmware above all; the
[installation guide](../installation/prepare/) starts from a complete
example.

## 2. Check and build

```sh
export NOMIRA_RECIPE="$PWD/recipe.yml"
nomira lint
nomira build
```

Without `-f`, nomira uses `$NOMIRA_RECIPE`, otherwise the machine's own
recipe in `/etc/nomira`.

The result is the directory `.nomira/mysystem.oci`, named after the
directory the recipe is in (`--name` sets another).

## 3. Look inside

```sh
skopeo copy oci:.nomira/mysystem.oci containers-storage:localhost/mysystem:dev
podman run --rm localhost/mysystem:dev pacman -Q networkmanager
```

## 4. Change something

Add a group to `features` and build again:

```yaml
    motd:
      - copy files/motd /etc/motd
```

```sh
mkdir -p files && echo 'Built with nomira.' > files/motd
nomira build
```

Only the new group is built; the others come from the cache.
