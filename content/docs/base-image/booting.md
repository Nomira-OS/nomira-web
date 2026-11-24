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

## Unified kernel image

A unified kernel image (UKI) puts kernel, initramfs and kernel command
line into one file, in `/boot/EFI/Linux`. The command line carries the
composefs digest of the system, so the UKI only boots the system it was
built for. bootc installs the UKI instead of the kernel. It is not signed
yet; signing comes with Secure Boot.

The recipe builds it, with two phases at the end, the way bootc
documents it for sealed images: one takes kernel and initramfs out, the
next runs `bootc container ukify` on the system without them, with the
kernel mounted from the phase before. The image brings bootc and ukify.

```yaml
  - name: kernel
    groups:
      out: ["run rm /usr/lib/modules/*/vmlinuz /usr/lib/modules/*/initramfs.img"]
  - name: uki
    groups:
      uki:
        - >-
          run --mount=type=bind,from=kernel,target=/target
          --mount=type=bind,from=services,source=/usr/lib/modules,target=/kernels
          mkdir -p /boot/EFI/Linux &&
          for d in /kernels/*; do
          bootc container ukify --rootfs /target --kernel-dir "$d" --
          --output "/boot/EFI/Linux/$(basename "$d").efi"; done
```

`services` is the phase before `kernel`; use the name of yours.

What that means:

- **No `root=`.** The UKI is built before the system is installed, so it
  cannot name the root partition. systemd finds it by its GPT partition
  type (*Linux root (x86-64)*), which `bootc install to-disk` sets. For
  an [installation over an existing Linux](../../getting-started/installation/alongside/),
  the partition may have another type; change it, or leave the UKI
  phases out.
- **Kernel arguments come from the image**, from
  `/usr/lib/bootc/kargs.d`, when the UKI is built. Arguments passed to
  `bootc install --karg` may not reach a UKI; we have not tried.
- **fs-verity is enforced.** The root filesystem needs it: ext4 created
  by bootc and btrfs have it, an existing ext4 may not
  (`tune2fs -O verity`).
- **Older installations** boot without a UKI. Whether `bootc switch`
  takes them to an image with one is untested; reinstall if it fails.

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
