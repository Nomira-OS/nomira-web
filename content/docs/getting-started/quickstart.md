---
title: Quick start
lead: Build a system image you could install. Nothing on your machine changes.
weight: 10
untested: true
---

You need the [nomira CLI](../../cli/install/).

## 1. Write the recipe

In a new directory, create `recipe.yml`, the
[minimal example](https://github.com/Nomira-OS/arch-base/blob/main/examples/minimal/recipe.yml):

```yaml
# syntax=ghcr.io/nomira-os/nomira:sha-051c82c
settings:
  name: mysystem
  base: ghcr.io/nomira-os/arch-base:sha-e9d5101

phases:
  - name: packages
    collect: >-
      run --mount=type=tmpfs,target=/etc/pacman.d/gnupg
      --mount=type=cache,target=/var/cache/pacman/pkg
      pacman-key --init && pacman-key --populate &&
      pacman -S --needed --noconfirm ${items}

  - name: features
    groups:
      network:
        packages: [networkmanager]
        services: [NetworkManager.service]

  - name: services
    collect: run systemctl enable ${items}
```

The group `network` names what it needs; the phase `packages` installs
the packages of all groups in one step, and `services` enables the
services. The pacman keyring lives in a tmpfs for that step only, so no
private key ends up in the image.

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

The result is the directory `.nomira/mysystem.oci`.

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
