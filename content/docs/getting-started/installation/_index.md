---
title: Installation
lead: How nomira gets onto a machine. Please try it in a VM first.
weight: 40
untested: true
---

> Installation on real hardware has not been tried yet. Do not run it on
> a machine whose data you need. The commands on these pages follow the
> bootc documentation and the upstream project our base image derives
> from; nobody has run them with the nomira image so far.

## How it works

nomira has no installer of its own. A bootc image installs itself: you
run the image as a container, and the `bootc` inside it writes the
system to a disk.

## You do not install bootc

bootc is part of the nomira base image, and so is everything it calls
during an installation: `bootctl` and the systemd-boot loader (both come
with the `systemd` package), and the tools to partition and format a
disk. The commands on these pages all run `bootc` from inside your
image with `podman run`. Nothing of bootc goes onto the machine you
install from.

What that machine needs, on Arch Linux:

| Purpose | Package |
|---|---|
| Running the image | `podman` |
| Loading the built image | `skopeo` |

And root, a UEFI firmware, and enough room for the image in
`/var/lib/containers`, see [Prepare the image](image/).

An installed nomira system has bootc as well, because it is the image.
`nomira switch` uses that copy. So there is no point at which you
install bootc yourself. The AUR has a `bootc` package; nomira does not
need it, and we have not tried it.

## Why systemd-boot and not GRUB

bootc installs GRUB through a second tool, bootupd. bootupd asks the
package manager about the boot loader files and only knows rpm, so it
fails on Arch Linux ([bootupd issue #468](https://github.com/coreos/bootupd/issues/468)).
bootc installs systemd-boot itself, with `bootctl`, which needs no
package manager. That is why every command here passes
`--bootloader systemd` together with `--composefs-backend`; bootc
supports systemd-boot only with that backend. bootupd is therefore not
in the base image. Leaving out `--bootloader systemd` selects GRUB and
makes the installation fail.

## The steps

1. **[Prepare the image](image/).** The bare base image has no
   network management, no firmware and no SSH. A machine installed from
   it boots, but cannot go online. Build a small recipe on top first.
2. **Install**, in one of two ways:
   - **[Onto a whole disk](whole-disk/)**: the disk is wiped and nomira
     becomes the only system on it.
   - **[Over an existing Linux](alongside/)**: the existing root
     filesystem is reused. The old system no longer boots, but its files
     stay on the disk.
3. **[First boot and what comes next](first-boot/).**

## Which way

| Question | Whole disk | Over an existing Linux |
|---|---|---|
| Start from | A live system, such as the Arch ISO | The installed Linux itself |
| Partitioning | Done by bootc | Kept as it is |
| Existing data | Lost | Kept on the disk, reachable below `/sysroot` |
| Other systems on the disk | Lost | Their boot entries are lost, see the page |
| bootc command | `bootc install to-disk` | `bootc install to-existing-root` |

Neither way sets up dual boot. To keep another operating system
bootable, use a separate disk.

## Open points

- **Boot loader.** systemd-boot needs a machine that boots with UEFI;
  BIOS machines are not supported. Whether the installation works with
  the nomira image is the main thing still to be tried.
- **Storage backend.** The commands pass `--composefs-backend`, as the
  upstream Arch image does. Whether `nomira switch` works on a system
  installed this way has not been tried either.
- **Updating systemd-boot** after the installation is not set up yet,
  see [Updates and the way back](../../operating/updates/#the-boot-loader).
- **Secure Boot** is not set up.
