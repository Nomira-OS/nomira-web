---
title: arch-base
lead: The smallest Arch Linux that bootc can boot, plus Flatpak and the tools to build on the machine itself.
weight: 30
---

```yaml
settings:
  base: ghcr.io/nomira-os/arch-base:TAG
```

## What is in it

| Purpose | Packages |
|---|---|
| Base system | `base` |
| Booting with bootc | `linux`, `dracut`, `ostree`, bootc (built from source) |
| `bootc install` | `skopeo`, `bubblewrap`, `btrfs-progs`, `e2fsprogs`, `dosfstools`, `tpm2-tss`, `tpm2-tools` |
| Hardening | `apparmor`, active at boot, see [AppArmor](apparmor/) |
| Applications | `flatpak`, with Flathub preconfigured |
| nomira tools | `buildkit`, `sudo`, `systemd-ukify`, `sbsigntools`, the nomira CLI |

## What is deliberately missing

Network management, firmware, SSH, a desktop, a container runtime, and
any part of a recipe. Your recipe chooses those; for the network, the
Arch Wiki compares the options in
[Network configuration](https://wiki.archlinux.org/title/Network_configuration).

## Recipe parts

Parts to import by URL, pinned to a commit, are in
[`recipes/`](https://github.com/Nomira-OS/arch-base/tree/main/recipes) of
the repository:

| Part | What it adds |
|---|---|
| `mounts.yml` | A tmpfs over `/run`, `/tmp`, `/var/log`, `/var/tmp`; pacman's downloads and the initramfs cache in BuildKit caches |
| `packages.yml` | The collector `packages`, one `pacman -S` for all groups; the keyring in a BuildKit cache |
| `services.yml` | The collector `services`, one `systemctl enable` |
| `initramfs.yml` | The initramfs once more, late, for configuration copied after the packages |
| `lint.yml` | `bootc container lint` on the finished system |
| `uki.yml` | A [unified kernel image](../boot/#unified-kernel-image); import it last |

The [examples](https://github.com/Nomira-OS/arch-base/tree/main/examples)
are built from them: `minimal` boots with kernel and initramfs, `uki`
with a unified kernel image.

## What has been tried

The image builds in CI and passes `bootc container lint`. An earlier
build booted in a VM to the end of the boot process. CI does not boot
the image yet, and installation on hardware has not been tried.

Source: [github.com/Nomira-OS/arch-base](https://github.com/Nomira-OS/arch-base)
