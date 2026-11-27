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
  key that would then be the same on every machine. It needs none for
  `packages.yml`: the sync database was checked when the image was
  built, and BuildKit checks every package against its sha256 from it.
- Install packages with a [collector](../../../collectors/). Two groups
  that each call pacman would both write the package database and
  conflict. `packages.yml` is that collector, one that fans out:

| Step | What pacman does there |
|---|---|
| resolve | `pacman -Sp --needed --print-format '%n %l sha256:%h %e'`: the packages to install with their dependencies, URL, sha256 and pkgbase as the key |
| each | `pacman --root /nomira/out -U --nodeps --noscriptlet` with every hook removed: only the files of one bucket's packages, with the image's `NoExtract` lines and file capabilities |
| then | `pacman -U --overwrite '*'` with `NoExtract = *` and a `!` for every path a hook triggers on: database, install scripts and hooks as in a normal install, no file written again except those; then `depmod` and the initramfs script |

  libalpm ignores files under `NoExtract` for path triggers, hence the
  negations. Modules and firmware stay excluded, so that they are not
  written twice; that is why `then` runs `depmod` and the initramfs
  script itself, the latter taking an unchanged initramfs from its cache.
  Tried by hand against a normal install of cups: the same hooks, no
  file missing. Not yet in a real build.

- The mirrorlist points to the day of the Arch Linux Archive the image
  was built from, so `pacman -S` installs from the same package set; see
  [Tags and package set](../versions/).

## The initramfs

Arch's own dracut hooks write a host-specific initramfs to `/boot`,
which bootc does not boot. The image masks them and installs one pacman
hook with the same triggers, collected from those hooks when the image
is built:

| Triggered by | Like on Arch |
|---|---|
| a kernel package | yes |
| firmware, microcode, dracut and its modules, anything Arch's hooks name | yes |
| any other package | no rebuild |

The hook runs `/usr/lib/nomira/initramfs`, which writes
`/usr/lib/modules/<kver>/initramfs.img` for every kernel and removes it
with its kernel. dracut runs with the image's configuration in
`/usr/lib/dracut/dracut.conf.d`: `hostonly=no`, `reproducible=yes`,
zstd, and the modules `bootc`, `systemd-cryptsetup` and `tpm2-tss`, so
that the initramfs can unlock an encrypted root partition with a TPM.
The frontend sets `SOURCE_DATE_EPOCH` for every step, so the same files
give the same bytes.

### Without running dracut again

A collector installs all its packages again whenever one of them
changes, firmware included, and the hook fires every time. dracut does
not have to: with a cache mount at `/var/cache/nomira/initramfs`
([`mounts.yml`](https://github.com/Nomira-OS/arch-base/tree/main/recipes)
sets it), the script keeps every initramfs it built and takes one again
when nothing it would contain has changed:

1. **Find a candidate** by a fingerprint of what decides which files
   dracut takes: kernel version, `SOURCE_DATE_EPOCH`, dracut's
   configuration by content, and path, size, mtime, mode and owner of
   every file below `/usr/lib/modules/<kver>`, `/usr/lib/firmware`,
   `/usr/lib/dracut` and of the configuration in `/etc` that dracut
   takes (`vconsole.conf`, `locale.conf`, `modprobe.d`, `sysctl.d`,
   `systemd/*.conf`, `udev/rules.d`, …).
2. **Check it**: every file the cached initramfs contains, binaries and
   libraries included, must still have the same path, size, mtime, mode
   and owner on the system.
3. **Use it, or run dracut** and store the result.

The result is the same initramfs that dracut would build, byte for
byte. Checking costs a `stat` over some thousand files, well under a
second; dracut takes from 20 seconds to a minute. An initramfs that is
already in place unchanged is not written again, so it does not end up
in the step's layer a second time.

The cache lives with BuildKit's other caches below `/var/lib/buildkit`
on the build machine, so it survives reboots and image updates. The
script keeps the eight newest entries. Without the cache mount it runs
dracut every time and stores nothing, since a cache must never end up in
the image.

### Configuration copied by the recipe

Configuration that belongs into the initramfs, the keymap in
`/etc/vconsole.conf` or a file in `/etc/dracut.conf.d`, triggers no
package hook. The recipe part `initramfs.yml` runs the script once more
in a late phase, after `services.yml` and before `lint.yml` and
`uki.yml`; when nothing changed, it takes the initramfs that is already
there.

```yaml
imports:
  - …/recipes/services.yml
  - …/recipes/initramfs.yml   # after the configuration is in place
  - …/recipes/lint.yml
  - …/recipes/uki.yml
build:
  packages: {}
  features:
    keymap:
      - copy files/vconsole.conf /etc/vconsole.conf
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
