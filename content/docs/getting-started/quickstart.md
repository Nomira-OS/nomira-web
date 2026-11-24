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
    collect: >-
      run --mount=type=tmpfs,target=/etc/pacman.d/gnupg
      --mount=type=cache,target=/usr/lib/sysimage/cache/pacman/pkg
      pacman-key --init && pacman-key --populate &&
      pacman -S --needed --noconfirm ${items}

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
      editor:
        packages: [nano]
      locale:
        - copy files/locale.conf /etc/locale.conf
        - copy files/vconsole.conf /etc/vconsole.conf
      recipe:
        - copy recipe.yml /etc/nomira/recipe.yml
        - copy files/ /etc/nomira/files/

  - name: services
    collect: run systemctl enable ${items}

  - name: kernel
    groups:
      out: ["run rm /usr/lib/modules/*/vmlinuz /usr/lib/modules/*/initramfs.img"]

  - name: uki
    groups:
      uki:
        - >-
          run --mount=type=bind,from=kernel,target=/target
          --mount=type=bind,from=services,source=/usr/lib/modules,target=/kernels
          --mount=type=tmpfs,target=/tmp
          mkdir -p /boot/EFI/Linux &&
          for d in /kernels/*; do k="$(basename "$d")";
          mkdir "/tmp/$k" && cp "$d/vmlinuz" "/tmp/$k/" &&
          TMPDIR=/tmp dracut --kver "$k" "/tmp/$k/initramfs.img" &&
          bootc container ukify --rootfs /target --kernel-dir "/tmp/$k" --
          --output "/boot/EFI/Linux/$k.efi"; done
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
- `editor`: the base image has no editor; you need one to change the
  recipe on the installed machine. Any other editor works as well.
- `network`: NetworkManager is an example; any option from
  [Network configuration](https://wiki.archlinux.org/title/Network_configuration) works the same way.

Each group names what it needs. The phase `packages` installs all of it
in one step; the pacman keyring lives in a tmpfs for that step only, so
no private key ends up in the image; the phase `services` enables the
services. The group `recipe` puts the recipe into the system, to
`/etc/nomira`, where `nomira` looks for it on the installed machine. The
last two phases replace kernel and initramfs with a
[unified kernel image](../../base-image/booting/#unified-kernel-image); the
initramfs is only built for it and never lands in the image itself.

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
