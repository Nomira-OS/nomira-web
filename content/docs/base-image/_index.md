---
title: Base image
lead: The smallest Arch Linux that bootc can boot, plus the tools to build and switch on the machine itself.
weight: 40
---

Recipes for a nomira system start from this image:

```yaml
settings:
  base: ghcr.io/nomira-os/arch-base:TAG
```

## What is in it

| Purpose | Packages |
|---|---|
| Base system | `base` |
| Booting with bootc | `linux`, `dracut`, `ostree`, bootc (built from source) |
| `bootc install` | `skopeo`, `bubblewrap`, `btrfs-progs`, `e2fsprogs`, `dosfstools` |
| Hardening | `apparmor`, active at boot |
| nomira tools | `podman`, `passt`, `buildkit`, `sudo`, the nomira CLI |

## What is deliberately missing

Network management, firmware, SSH, a desktop, and the boot test with
bcvk (it would need QEMU). Your recipe chooses those; for the network,
the Arch Wiki compares the options in
[Network configuration](https://wiki.archlinux.org/title/Network_configuration).

## What has been tried

The image builds in CI and passes `bootc container lint`. An earlier
build booted in a VM to the end of the boot process. CI does not boot
the image yet, and installation on hardware has not been tried.

Source: [github.com/Nomira-OS/arch-base](https://github.com/Nomira-OS/arch-base)
