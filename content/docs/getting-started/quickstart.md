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
    collect: run --mount=type=cache,target=/usr/lib/sysimage/cache/pacman/pkg pacman -S --needed --noconfirm ${items} && /usr/libexec/nomira-initramfs

  - name: features
    groups:
      hardware:
        packages: [linux-firmware, intel-ucode]
      network:
        packages: [networkmanager]
        services: [NetworkManager.service]
      ssh:
        packages: [openssh]
        services: [sshd.service]
      locale:
        - copy files/locale.conf /etc/locale.conf
        - copy files/vconsole.conf /etc/vconsole.conf

  - name: services
    collect: run systemctl enable ${items}
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

- **Four features**: `hardware`, `network`, `ssh` and `locale`. Each
  names the packages and services it needs, or the files it brings.
- **Two collectors**: the phase `packages` installs everything the
  features asked for in one step and then regenerates the initramfs, so
  that firmware and microcode needed early are in it. The phase
  `services` enables the services.
- The features are independent of each other. The build checks that
  they do not touch the same files.

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

Add a feature to the phase `features`:

```yaml
      motd:
        - copy files/motd /etc/motd
```

```sh
echo 'Built with nomira.' > files/motd
```

Build again. The packages are not installed again, and the other
features come from the cache. Only the new group is built; after it the
services are enabled once more, which takes a moment.

## Next

- [Start the image in a VM](../vm/)
- [Install it](../installation/)
- [More about writing recipes](../../recipes/writing/)
- If the build stops with "groups are not disjoint":
  [Groups conflict](../../troubleshooting/groups-conflict/)
