---
title: Booting
lead: Boot loader, initramfs, and the two ways to boot an image, with or without a unified kernel image.
weight: 10
aliases: [/docs/base-image/booting/]
---

## Boot loader and storage

`bootc install` decides on its own, from the image:

- The empty file `/usr/lib/composefs/setup-root-conf.toml` marks the
  image as composefs-native, so bootc uses its
  [composefs backend](https://bootc.dev/bootc/bootc-composefs.7.html).
- The image has no bootupd, so bootc installs **systemd-boot** itself,
  with `bootctl` from the `systemd` package.

No options are needed for either. GRUB is not an option: bootc installs
it through bootupd, which records metadata about the boot loader files
by asking rpm, and that fails on Arch Linux
([bootupd#468](https://github.com/coreos/bootupd/issues/468)). bootc
supports systemd-boot only with the composefs backend, hence both.

## The initramfs

Every base image keeps one initramfs per kernel in
`/usr/lib/modules/<kver>/initramfs.img`, built with dracut and the bootc
dracut module, not tied to the build host (`hostonly=no`), and
reproducible: the same packages give the same bytes. The base image
builds it once; after that it follows the packages:

| What changes | What happens |
|---|---|
| A package that goes into the initramfs (kernel, firmware, a dracut module, …) | The base image's package manager hooks rebuild it in the same step |
| Any other package | Nothing; the initramfs stays byte for byte the same |
| Configuration copied by the recipe (`/etc/vconsole.conf`, …) | Nothing; a recipe that wants it in the initramfs runs dracut after the copy |

How the hooks work is specific to each base image:
[arch-base](../arch-base/building-on-it/#the-initramfs). A recipe never
decides which packages need a new initramfs, with or without a unified
kernel image.

Because the bytes stay the same when nothing relevant changed, bootc
can often switch to a new image without a full reboot, see
[soft reboots](../../../operating/updates/#without-a-full-reboot).

## Two ways to boot

| | Kernel and initramfs | Unified kernel image (UKI) |
|---|---|---|
| In the recipe | nothing to do | the phases `kernel` and `uki`, last ([`uki.yml`](https://github.com/Nomira-OS/arch-base/tree/main/recipes)) |
| On the EFI system partition | kernel, initramfs and a boot entry with the command line | one file in `/boot/EFI/Linux` |
| Root partition | named on the command line by `bootc install` | found by its GPT type, see below |
| Kernel arguments | from `/usr/lib/bootc/kargs.d` and `bootc install --karg` | from `/usr/lib/bootc/kargs.d`, fixed when the UKI is built |
| Digest of the system | on the command line in the boot entry, which can be edited | inside the UKI, which can be signed |
| Secure Boot | the kernel can be signed, the command line not | the whole file can be signed (not done yet) |
| Example | [`minimal`](https://github.com/Nomira-OS/arch-base/blob/main/examples/minimal/recipe.yml) | [`uki`](https://github.com/Nomira-OS/arch-base/blob/main/examples/uki/recipe.yml) |

Both use the same initramfs: without a UKI, bootc copies kernel and
initramfs from `/usr/lib/modules/<kver>/` to the EFI system partition and
writes a boot entry; with a UKI, the initramfs is inside it. An image
without the UKI phases therefore boots as it is. We have not booted
either way on hardware yet.

### Kernel and initramfs

The default. Nothing in the recipe is about booting. bootc writes a
[Boot Loader Specification](https://uapi-group.org/specifications/specs/boot_loader_specification/)
entry for every deployment, with the composefs digest and the root
partition on its command line. It suits installations next to an
existing system and machines where the root partition does not have the
GPT type for root.

### Unified kernel image

A UKI puts kernel, initramfs and kernel command line into one file. The
command line carries the composefs digest of the system, so the UKI only
boots the system it was built for. bootc installs the UKI instead of the
kernel.

The recipe builds it the way bootc documents it for
[sealed images](https://bootc.dev/bootc/building/bootc-sealed-images.7.html):
the phase `kernel` takes kernel and initramfs out of the system, the
phase `uki` runs `bootc container ukify` on the system without them,
with kernel and initramfs as the phases before left them. Nothing is
rebuilt for the UKI. Both phases must be the last ones, since the digest
covers the finished system; `uki.yml` is therefore the last import.
`--erofs-version v1-only` makes bootc compute the digest once instead of
twice.

What that means:

- **No `root=`.** The UKI is built before the system is installed, so it
  cannot name the root partition. systemd finds it by its GPT partition
  type (*Linux root (x86-64)*), which `bootc install to-disk` sets. For
  an [installation over an existing Linux](../../../getting-started/installation/alongside/),
  the partition may have another type; change it, or leave the UKI out.
- **Kernel arguments come from the image**, from
  `/usr/lib/bootc/kargs.d`, when the UKI is built. Arguments passed to
  `bootc install --karg` may not reach a UKI; we have not tried.
- **fs-verity is enforced.** The root filesystem needs it: ext4 created
  by bootc and btrfs have it, an existing ext4 may not
  (`tune2fs -O verity`).
- **Not signed yet.** Signing comes with Secure Boot, see
  [Security](../security/).

## Boot loader updates

Every switch writes new boot entries, and kernel and initramfs or the
UKI, to the EFI system partition; bootc does that. systemd-boot itself
is installed once. It keeps booting newer kernels, but its own fixes
only arrive through `systemd-boot-update.service`, which the base image
does not enable yet: it is not clear whether it finds the EFI system
partition on a nomira system.

## What the composefs backend lacks

From the bootc 1.17 documentation, the points that matter here:

- **No boot counting.** A system that fails to boot does not fall back
  on its own. The previous system is still in the boot menu.
- **`--root-ssh-authorized-keys` is ignored** by `bootc install`. Put
  SSH keys into the recipe or set them after the first boot.
- **Install-time kernel argument deletions are ignored.** Adding
  arguments with `--karg` and `/usr/lib/bootc/kargs.d` works.
- **One EFI system partition**, no separate XBOOTLDR partition.

Sources: [bootc: Bootloaders](https://github.com/bootc-dev/bootc/blob/v1.17.4/docs/src/bootc-bootloaders.7.md),
[bootc: composefs backend](https://github.com/bootc-dev/bootc/blob/v1.17.4/docs/src/bootc-composefs.7.md)
