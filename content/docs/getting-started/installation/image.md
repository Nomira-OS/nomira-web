---
title: Prepare the image
lead: The base image is deliberately bare. Install an image of your own that has network, firmware and SSH.
weight: 10
untested: true
---

## What the base image lacks

| Missing | Consequence | Arch package |
|---|---|---|
| Network management | No connection, wired or wireless | Your choice, see [Network configuration](https://wiki.archlinux.org/title/Network_configuration) in the Arch Wiki |
| Firmware | Wi-Fi and many graphics cards do not work | `linux-firmware` |
| CPU microcode | Processor fixes are not loaded | `intel-ucode` or `amd-ucode` |
| SSH server | No remote login | `openssh` |

Without a network the installed system cannot build a new image, so it
cannot fix this itself. These have to be in the image you install.

## Build it

The recipe from the [quick start](../../quickstart/) adds all of these,
with NetworkManager as its example for the network. Replace it with any
other network manager the Arch Wiki describes; the recipe only has to
install it and enable its service. Build it on any Linux:

```sh
nomira lint
nomira build
```

The result is `.nomira/mysystem.oci.tar`.

If the machine will only have Wi-Fi, add a connection to the recipe
first, see the example [Wi-Fi on first boot](../../../recipes/examples/wifi/).

## Bring it to the machine

`bootc install` needs the image in the container storage of root on the
machine that installs. Copy the archive there (USB stick, `scp`) and
load it:

```sh
sudo skopeo copy oci-archive:mysystem.oci.tar containers-storage:localhost/mysystem:latest
sudo podman images localhost/mysystem
```

On a live system the container storage lives in memory. An image of
this size needs a few gigabytes of RAM, or a storage directory on a
disk.

Alternatively push the image to a registry and use its name in place of
`localhost/mysystem:latest` on the next pages. The installed system then
also knows where to look for updates.

Continue with [a whole disk](../whole-disk/) or
[an existing Linux](../alongside/).
