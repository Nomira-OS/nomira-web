---
title: Prepare the image
lead: Build an image with network and firmware, and load it on the machine you install from.
weight: 10
untested: true
---

## Build

The base image has no network management and no firmware. A machine
installed from it boots, but cannot go online, so it cannot fix that
itself. Build the recipe from the [quick start](../../quickstart/), or
your own with at least:

| What | Arch Wiki |
|---|---|
| Network management | [Network configuration](https://wiki.archlinux.org/title/Network_configuration) |
| Firmware and microcode | [Linux firmware](https://wiki.archlinux.org/title/Linux_firmware), [Microcode](https://wiki.archlinux.org/title/Microcode) |
| SSH, if you want remote access | [OpenSSH](https://wiki.archlinux.org/title/OpenSSH) |

## Load

Copy `.nomira/mysystem.oci.tar` to the machine you install from, then:

```sh
sudo skopeo copy oci-archive:mysystem.oci.tar containers-storage:localhost/mysystem:latest
```
