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
# syntax=ghcr.io/nomira-os/nomira:sha-64866c7
imports:
  - https://raw.githubusercontent.com/Nomira-OS/arch-base/1411e93895fd5905ded7ab547e4cbfd82ffa6fa0/recipes/services.yml
  - https://raw.githubusercontent.com/Nomira-OS/arch-base/1411e93895fd5905ded7ab547e4cbfd82ffa6fa0/recipes/lint.yml

settings:
  base: ghcr.io/nomira-os/arch-base:sha-1411e93

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
`packages` installs the packages of all groups in one step, `services`
enables the services, and `lint` runs `bootc container lint` on the
result. The pacman keyring lives in a build cache on your machine, so no
private key ends up in the image. `nomira recipe export recipe.yml`
shows the recipe with everything imported.

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
skopeo copy oci:.nomira/mysystem.oci containers-storage:localhost/mysystem:latest
podman run --rm localhost/mysystem:latest pacman -Q networkmanager
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
