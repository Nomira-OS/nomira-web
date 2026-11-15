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
  mount must point there:

```yaml
- run --mount=type=cache,target=/usr/lib/sysimage/cache/pacman/pkg pacman -S --needed --noconfirm kmscon
```

- Put all package installations of a phase into one group. They all
  write the package database, so two groups that install packages
  conflict.

## Kernel, modules, firmware

After adding or changing the kernel, kernel modules or firmware that is
needed early, regenerate the initramfs:

```yaml
- run /usr/libexec/nomira-initramfs
```

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
