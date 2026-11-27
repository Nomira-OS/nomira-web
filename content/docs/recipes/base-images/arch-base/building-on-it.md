---
title: Building on arch-base
lead: pacman, the initramfs and Flatpak in a recipe on arch-base.
weight: 20
aliases: [/docs/base-image/building-on-it/]
---

The layout every base image shares, `/usr`, `/etc` and `/var`, is on
[Base images](../../#where-files-belong).

## pacman

- The package database is in `/usr/lib/sysimage/lib/pacman`, not in
  `/var`, so that it is part of the image.
- Cache and log are where Arch has them, in `/var/cache/pacman/pkg` and
  `/var/log/pacman.log`. A recipe keeps both out of the image with
  [`settings.mounts`](../../../../frontend/schema/#settings): a tmpfs at
  `/var/log`, and a cache at `/var/cache/pacman/pkg` that keeps the
  downloads across builds. `mounts.yml` does that.
- The image ships no pacman keyring, because a keyring holds a private
  key that would then be the same on every machine. The collector keeps
  one in a BuildKit cache on the build machine, so it never ends up in
  the image.
- Install packages with a [collector](../../../collectors/). Two groups
  that each call pacman would both write the package database and
  conflict. `packages.yml` is that collector:

```yaml
build:
  packages:
    collect: >-
      run --mount=type=cache,target=/etc/pacman.d/gnupg,id=pacman-keyring,sharing=locked
      { [ -s /etc/pacman.d/gnupg/trustdb.gpg ] || pacman-key --init; } &&
      pacman-key --populate && pacman -S --needed --noconfirm ${items}
```

- The mirrorlist points to the day of the Arch Linux Archive the image
  was built from, so `pacman -S` installs from the same package set; see
  [Tags and package set](../versions/).

## The initramfs

Arch's own dracut hooks write a host-specific initramfs to `/boot`,
which bootc does not boot. The image masks them and installs one pacman
hook with the same triggers, collected from those hooks when the image
is built, which runs dracut for `/usr/lib/modules/<kver>/initramfs.img`
instead:

| Triggered by | Like on Arch |
|---|---|
| a kernel package | yes |
| firmware, microcode, dracut and its modules, anything Arch's hooks name | yes |
| any other package | no rebuild |

dracut runs with the image's configuration in
`/usr/lib/dracut/dracut.conf.d`: `hostonly=no`, `reproducible=yes`,
zstd, and the modules `bootc`, `systemd-cryptsetup` and `tpm2-tss`, so
that the initramfs can unlock an encrypted root partition with a TPM.
The frontend sets `SOURCE_DATE_EPOCH` for every step, so the same
packages give the same bytes.

Configuration copied into the image does not trigger the hook. What the
initramfs should know, the keymap in `/etc/vconsole.conf` for instance,
needs dracut run after the copy:

```yaml
    keymap:
      - copy files/vconsole.conf /etc/vconsole.conf
      - run for d in /usr/lib/modules/*/; do dracut --force --tmpdir /tmp --kver "$(basename "$d")" "${d}initramfs.img"; done
```

The same initramfs serves both ways to boot, see
[Booting](../../boot/#two-ways-to-boot).

## Flatpak

`flatpak` is installed, with Flathub as a remote. Applications and their
runtimes live in `/var/lib/flatpak` (system-wide) or in the user's home,
so they are not part of the image and survive every update; `flatpak
update` updates them independently of the system. A recipe should not
install Flatpak applications: anything it puts below `/var` never
reaches an installed machine.

## Reproducible layers

pacman's install dates become `SOURCE_DATE_EPOCH` (a hook in the image;
the frontend sets the variable for every step), logs never reach a layer
with the mounts above, and the nomira CLI clamps the file times of every
layer to the same time. The same recipe on the same base image thus
gives the same layers, wherever it is built. The time is
[`settings.source_date_epoch`](../../../../frontend/schema/#settings), by
default the creation time of the base image.

## Building on the machine

`buildkit.socket` is enabled. buildkitd runs as root and only on demand:
it starts when `sudo nomira build` talks to it. The image has no
container runtime, so `nomira build` without root has no buildkitd to
fall back to.
