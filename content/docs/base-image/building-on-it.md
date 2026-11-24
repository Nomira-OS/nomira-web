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
- The package cache is in `/usr/lib/sysimage/cache/pacman/pkg`. A cache
  mount must point there.
- Call `nomira-pacman` instead of `pacman`; it takes the same arguments.
  The image ships no pacman keyring, because a keyring holds a private
  key that would then be the same on every machine. `nomira-pacman`
  sets up a throwaway keyring for each call, retries when the Arch Linux
  Archive is slow, and makes install dates reproducible.
- Install packages with a [collector](../../recipes/collectors/). Two
  groups that each call pacman would both write the package database
  and conflict.

```yaml
- name: packages
  collect: run --mount=type=cache,target=/usr/lib/sysimage/cache/pacman/pkg nomira-pacman -S --needed --noconfirm ${items}
```

## Kernel, modules, firmware

After adding or changing the kernel, kernel modules or firmware that is
needed early, regenerate the initramfs. The simplest place is the end of
the package collector:

```yaml
collect: run nomira-pacman -S --needed --noconfirm ${items} && /usr/libexec/nomira-initramfs
```

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
it starts when `sudo nomira switch` talks to it.
