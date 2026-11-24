---
title: Boot loader and storage
lead: The image is installed with bootc's composefs backend and boots with systemd-boot. Why, and what that means.
weight: 15
---

## How the choice is made

`bootc install` decides on its own, from the image:

- The empty file `/usr/lib/composefs/setup-root-conf.toml` marks the
  image as composefs-native, so bootc uses its **composefs backend**.
- The image has no bootupd, so bootc installs **systemd-boot**, itself,
  with `bootctl` from the `systemd` package.

No options are needed for either.

## Why not GRUB

bootc installs GRUB through bootupd. bootupd records metadata about the
boot loader files when the image is built and asks rpm for it, which
fails on Arch Linux
([bootupd#468](https://github.com/coreos/bootupd/issues/468)).
systemd-boot needs none of that. bootc supports systemd-boot only with
the composefs backend, hence both.

## Boot loader updates

bootc installs systemd-boot once. `systemd-boot-update.service`, enabled
by default, updates it at boot when the image brings a newer one.

## What the composefs backend lacks

From the bootc 1.17 documentation, the points that matter here:

- **No boot counting.** A system that fails to boot does not fall back
  on its own. The previous system is still in the boot menu.
- **`--root-ssh-authorized-keys` is ignored** by `bootc install`. Put
  SSH keys into the recipe or set them after the first boot.
- **Install-time kernel argument deletions are ignored.** Adding
  arguments with `--karg` and `/usr/lib/bootc/kargs.d` works.
- **One EFI system partition**, no separate XBOOTLDR partition.

These limits belong to the composefs backend; the ostree backend cannot
boot with systemd-boot.

## Updating the boot loader

Every switch writes new boot entries, a kernel and an initramfs to the
EFI system partition; bootc does that.

systemd-boot itself is not updated after the installation. It keeps
booting newer kernels, but its own fixes do not arrive. systemd's
`systemd-boot-update.service` would do this at boot; the base image does
not enable it yet, because it is not clear whether it finds the EFI
system partition on a nomira system. bootupd does not manage
systemd-boot yet; upstream support is pending.

Sources: [bootc: Bootloaders](https://github.com/bootc-dev/bootc/blob/v1.17.4/docs/src/bootc-bootloaders.7.md),
[bootc: composefs backend](https://github.com/bootc-dev/bootc/blob/v1.17.4/docs/src/bootc-composefs.7.md)
