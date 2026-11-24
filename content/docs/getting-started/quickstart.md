---
title: Quick start
lead: Build a system image you could install. Nothing on your machine changes.
weight: 10
untested: true
---

You need the [nomira CLI](../../cli/install/).

## 1. Write the recipe

In a new directory, create `recipe.yml`:

```yaml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
settings:
  name: mysystem
  base: ghcr.io/nomira-os/nomira-image:TAG

phases:
  - name: packages
    collect: run --mount=type=cache,target=/usr/lib/sysimage/cache/pacman/pkg nomira-pacman -S --needed --noconfirm ${items} && /usr/libexec/nomira-initramfs

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

```sh
mkdir files
echo 'LANG=en_US.UTF-8' > files/locale.conf
echo 'KEYMAP=us' > files/vconsole.conf
```

Adapt it to your machine:

- `TAG`: a tag of the [base image](https://github.com/orgs/Nomira-OS/packages).
- `hardware`: the firmware and microcode your machine needs, see
  [Linux firmware](https://wiki.archlinux.org/title/Linux_firmware) and [Microcode](https://wiki.archlinux.org/title/Microcode).
- `network`: NetworkManager is an example; any option from
  [Network configuration](https://wiki.archlinux.org/title/Network_configuration) works the same way.

Each group names what it needs. The phase `packages` installs all of it
in one step and rebuilds the initramfs; the phase `services` enables the
services.

## 2. Check and build

```sh
nomira lint
nomira build
```

The result is the directory `.nomira/mysystem.oci`.

## 3. Look inside

```sh
skopeo copy oci:.nomira/mysystem.oci containers-storage:localhost/mysystem:latest
podman run --rm localhost/mysystem:latest pacman -Q linux-firmware openssh
```

## 4. Change something

Add a group to `features` and build again:

```yaml
      motd:
        - copy files/motd /etc/motd
```

```sh
echo 'Built with nomira.' > files/motd
nomira build
```

Only the new group is built; the others come from the cache.
