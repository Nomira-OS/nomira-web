---
weight: 20
title: Mounts
lead: What is mounted where, at build time and on the running system.
---

## At build time

Every `run` is an `Exec` in BuildKit. Its root is the state before it;
these mounts come on top. What is written below a mount never reaches the
layer.

| Mount | Source | Writable | In the cache key | Typical use |
|---|---|---|---|---|
| `type=cache` | a BuildKit cache directory (`id`, `sharing`) | yes, kept across builds | no | package cache, pacman keyring |
| `type=tmpfs` | empty memory | yes, gone after the step | no | scratch space |
| `type=bind` | a stage or an earlier phase (`from`, `source`) | no | the definition of the source | building a UKI from the finished system |
| `type=secret` | a file the client passes (`--secret`) | no | no | signing keys |

`settings.mounts` adds a cache or tmpfs mount to every `run` of the
recipe, in stages too; a `--mount` of the run at the same target takes
its place. Without the setting nothing is added. The base image's
[`recipes/mounts.yml`](https://github.com/Nomira-OS/arch-base/tree/main/recipes)
mounts a tmpfs at `/run`, `/tmp`, `/var/log` and `/var/tmp`, and a cache
at `/var/cache/pacman/pkg`.

- Mounts are applied parents first, so a cache at `/var/cache/pacman/pkg`
  works inside a tmpfs at `/var/cache`.
- BuildKit always adds `/proc`, `/sys`, `/dev`, and `/etc/resolv.conf`
  and `/etc/hosts`; none of them reaches a layer.
- `copy` mounts nothing: what it copies always lands in the layer.

Details: BuildKit's
[RUN --mount](https://docs.docker.com/reference/dockerfile/#run---mount),
which these options mirror.

## On the running system

bootc's [filesystem](https://bootc.dev/bootc/bootc-filesystem.7.html)
with the [composefs backend](https://bootc.dev/bootc/bootc-composefs.7.html):

| Path | What it is | Changes with an update |
|---|---|---|
| `/usr` | the image, read-only, a composefs mount; fs-verity checks every file on read | replaced |
| `/etc` | the image's `/etc`, merged with local changes (three-way: local wins) | merged |
| `/var` | machine state, persistent; taken from an image only at installation | never |
| `/run`, `/tmp` | tmpfs | n/a |
| `/home`, `/root`, `/opt`, `/srv`, `/mnt`, `/usr/local` | links into `/var` | never |
| `/boot` | the boot partition: systemd-boot entries, UKIs | bootc writes new entries |
| `/sysroot` | the physical root: composefs repository and deployments | bootc |

The digest in the kernel command line (from a UKI) covers the image's
tree, `/usr` and `/etc` as the image ships them; not the machine's `/etc`
changes, not `/var`, and not the image config with its labels.
