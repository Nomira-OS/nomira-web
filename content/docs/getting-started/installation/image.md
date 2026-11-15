---
title: Build an image you can use
lead: The base image is deliberately bare. Add network, firmware and SSH before you install.
weight: 10
untested: true
---

## What the base image lacks

| Missing | Consequence | Arch package |
|---|---|---|
| Network management | No connection, wired or wireless | `networkmanager` |
| Firmware | Wi-Fi and many graphics cards do not work | `linux-firmware` |
| CPU microcode | Processor fixes are not loaded | `intel-ucode` or `amd-ucode` |
| SSH server | No remote login | `openssh` |

Without a network the installed system cannot build a new image, so it
cannot fix this itself. Put these into the image you install.

## A recipe for it

On any Linux with the [CLI](../../../cli/), create a directory with this
`recipe.yml`:

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

- Replace `TAG` with a tag of the base image and `intel-ucode` with
  `amd-ucode` on an AMD machine.
- The second `run` regenerates the initramfs so that firmware and
  microcode needed early are in it.
- The group `locale` is optional. With it the first boot no longer asks
  for locale and keymap. The two files look like this:

```sh
mkdir -p files
echo 'LANG=en_US.UTF-8' > files/locale.conf
echo 'KEYMAP=us' > files/vconsole.conf
```

## Wi-Fi without a cable

NetworkManager reads connections from files. To have the machine join a
network on its first boot, add a connection file to the recipe.

`files/nm/home.nmconnection`:

```ini
[connection]
id=home
type=wifi

[wifi]
ssid=YOUR-NETWORK

[wifi-security]
key-mgmt=wpa-psk
psk=YOUR-PASSWORD

[ipv4]
method=auto

[ipv6]
method=auto
```

And one more group in the phase `configuration`:

```yaml
      wifi:
        - copy --chmod=0600 files/nm/ /etc/NetworkManager/system-connections/
```

The password is then part of the image. Do not push such an image to a
public registry. Without this file, connect after the first boot with
`nmtui`.

## Build

```sh
nomira lint
nomira build
```

The result is `.nomira/mysystem.oci.tar`.

## Bring the image to the machine

`bootc install` needs the image in the container storage of root on the
machine that installs. Copy the archive there (USB stick, `scp`) and
load it:

```sh
sudo skopeo copy oci-archive:mysystem.oci.tar containers-storage:localhost/mysystem:latest
sudo podman images localhost/mysystem
```

On a live system, the container storage lives in memory. An image of
this size needs a few gigabytes of RAM, or a storage directory on a
disk.

Alternatively push the image to a registry and use its name in place of
`localhost/mysystem:latest` on the next pages. The installed system then
also knows where to look for updates.

Continue with [a whole disk](../whole-disk/) or
[an existing Linux](../alongside/).
