---
title: Quick start
lead: Build a system image you could actually install. Nothing on your own system changes.
weight: 20
untested: true
---

You need the [CLI](../install-cli/). The recipe below builds on the
nomira base image and adds what a real machine needs first: network,
firmware and SSH.

Building the same recipe structure on a small test image has been
tried. This recipe on the nomira base image has not been built by us
yet.

## 1. Write the recipe

Create a directory, and in it the file `recipe.yml`:

```yaml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
settings:
  name: mysystem
  description: nomira base with network, firmware and SSH
  base: ghcr.io/nomira-os/nomira-image:TAG

phases:
  - name: packages
    groups:
      system:
        - run --mount=type=cache,target=/usr/lib/sysimage/cache/pacman/pkg pacman -S --needed --noconfirm networkmanager linux-firmware intel-ucode openssh
        - run /usr/libexec/nomira-initramfs

  - name: configuration
    groups:
      services:
        - run systemctl enable NetworkManager.service sshd.service
      locale:
        - copy files/locale.conf /etc/locale.conf
        - copy files/vconsole.conf /etc/vconsole.conf
```

And the two files the group `locale` copies:

```sh
mkdir -p files
echo 'LANG=en_US.UTF-8' > files/locale.conf
echo 'KEYMAP=us' > files/vconsole.conf
```

Replace `TAG` with a tag of the base image, see
[Tags and package set](../../base-image/versions/). On an AMD machine
use `amd-ucode` instead of `intel-ucode`.

What the recipe says:

- **Two phases**, one after the other: first packages, then
  configuration.
- **`packages` has one group.** Package installations all change the
  package database, so they cannot be independent.
- **`configuration` has two groups**, `services` and `locale`. They
  touch different files, so they build at the same time. The build
  checks that this is true.
- The second `run` regenerates the initramfs so that firmware and
  microcode needed early are in it.

## 2. Check it

```sh
nomira lint
```

This only reads the recipe. It finds typing errors and unknown fields
before anything is built.

## 3. Build it

```sh
nomira build
```

The first build downloads the base image and the packages; later builds
reuse what has not changed. The result is the archive
`.nomira/mysystem.oci.tar`.

## 4. Look at the result

```sh
skopeo copy oci-archive:.nomira/mysystem.oci.tar containers-storage:localhost/mysystem:latest
podman run --rm localhost/mysystem:latest pacman -Q networkmanager openssh
```

The image is an ordinary container image, so you can inspect it like
one.

## 5. Change something

Add a third group to the phase `configuration`:

```yaml
      motd:
        - run echo 'Built with nomira.' > /etc/motd
```

Build again. Only the new group is built; `services` and `locale` come
from the cache.

## Next

- [Start the image in a VM](../vm/)
- [Install it](../installation/)
- [More about writing recipes](../../recipes/writing/)
- If the build stops with "groups are not disjoint":
  [Groups conflict](../../troubleshooting/groups-conflict/)
