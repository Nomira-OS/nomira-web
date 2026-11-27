---
title: Base images
lead: The image a recipe starts from, and what every base image for nomira has in common.
weight: 20
aliases: [/docs/base-image/]
---

A recipe names its base image in `settings.base`. Any bootc image works
with the frontend; a base image *for nomira* also brings what a recipe
relies on:

- a system that bootc boots and installs, marked as composefs-native;
- an initramfs in `/usr/lib/modules/<kver>/initramfs.img` that follows
  the packages, so that a recipe never rebuilds it by hand;
- the tools to build on the machine itself: buildkit and the nomira CLI,
  and ukify for a unified kernel image;
- reproducible layers, and a package set fixed by the tag;
- no part of a recipe. Parts to import by URL live next to the image, in
  its repository.

## Available base images

| Image | Distribution | Recipe parts |
|---|---|---|
| [arch-base](arch-base/) | Arch Linux, from one day of the Arch Linux Archive | [`recipes/`](https://github.com/Nomira-OS/arch-base/tree/main/recipes) |

More may follow, each under its own name.

## The same in every base image

| Topic | Page |
|---|---|
| Where files belong: `/usr`, `/etc`, `/var` | below |
| Boot loader, the initramfs, with or without a unified kernel image | [Booting](boot/) |
| The chain of checks from firmware to home directory | [Security](security/) |

### Where files belong

| Path | In the running system | In a recipe |
|---|---|---|
| `/usr` | Read-only, comes entirely from the image | Put the system here |
| `/etc` | Writable; local changes are merged on updates | Put configuration here |
| `/var` | Writable, belongs to the machine | Do not put files here |
| `/opt`, `/usr/local`, `/home` | Links into `/var` | Do not put files here |

bootc takes `/var` from an image only at the first installation, so
anything a recipe puts there never reaches an installed machine with an
update. Logs, caches and temporary files of the build are kept out with
[`settings.mounts`](../../frontend/schema/#settings). Details:
[bootc filesystem](https://bootc.dev/bootc/bootc-filesystem.7.html).

`/usr/local`, `/opt` and `/home` are symbolic links into `/var`, and
some directories, `/etc/sudoers.d` for one, are not readable by
everyone. A group that copies into such a place still works, but it is
built on the system instead of on its own, and the build output says
so; see [What gets rebuilt](../rebuilds/#checked-not-assumed).

### Kernel arguments

bootc reads kernel arguments from files in `/usr/lib/bootc/kargs.d/`.
A recipe adds its own file there:

```toml
# files/kargs/20-quiet.toml
kargs = ["quiet"]
```
