---
title: Building on the base image
lead: What a recipe has to know about the layout of the image.
weight: 40
---

## Where files belong

| Path | In the running system | In a recipe |
|---|---|---|
| `/usr` | Read-only, comes entirely from the image | Put the system here |
| `/etc` | Writable; local changes are merged on updates | Put configuration here |
| `/var` | Writable, belongs to the machine | Do not put files here |
| `/opt`, `/usr/local`, `/home` | Links into `/var` | Do not put files here |

## pacman

- The package database is in `/usr/lib/sysimage`, not in `/var`, so that
  it is part of the image.
- Cache and log are where Arch has them, in `/var/cache/pacman/pkg` and
  `/var/log/pacman.log`. The frontend gives every step a tmpfs over
  `/var/cache` and `/var/log` ([`volatile`](../../frontend/schema/#settings)),
  so neither ends up in the image; a cache mount at
  `/var/cache/pacman/pkg` keeps the downloads across builds.
- The image ships no pacman keyring, because a keyring holds a private
  key that would then be the same on every machine. A step that runs
  pacman sets one up in a tmpfs (`--mount=type=tmpfs`), so it never
  ends up in the image.
- Install packages with a [collector](../../recipes/collectors/). Two
  groups that each call pacman would both write the package database
  and conflict.

```yaml
- name: packages
  collect: run --mount=type=tmpfs,target=/etc/pacman.d/gnupg --mount=type=cache,target=/var/cache/pacman/pkg pacman-key --init && pacman-key --populate && pacman -S --needed --noconfirm ${items}
```

## Kernel, modules, firmware

Install them like any other package. The image's pacman hooks rebuild
the initramfs in the same step whenever a package changes what goes into
it, see [The initramfs follows the packages](../booting/#the-initramfs-follows-the-packages).

## Reproducible layers

pacman's install dates become `SOURCE_DATE_EPOCH` (a hook in the image;
the frontend sets the variable for every step), logs and caches never
reach a layer, and the nomira CLI clamps the file times of every layer to
the same time. The same recipe on the same base image thus gives the
same layers, wherever it is built. The time is
[`settings.source_date_epoch`](../../frontend/schema/#settings), by
default the creation time of the base image.

## Symbolic links and restricted directories

`/usr/local`, `/opt` and `/home` are symbolic links into `/var`, and
some directories, `/etc/sudoers.d` for one, are not readable by
everyone. A group that copies into such a place still works, but it is
built on the system instead of on its own, and the build output says
so.

## Kernel arguments

bootc reads kernel arguments from files in `/usr/lib/bootc/kargs.d/`.
A recipe adds its own file there:

```toml
# files/kargs/20-quiet.toml
kargs = ["quiet"]
```

## Building on the machine

`buildkit.socket` is enabled. buildkitd runs as root and only on demand:
it starts when `sudo nomira build` talks to it.
