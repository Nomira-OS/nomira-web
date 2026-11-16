---
title: What gets rebuilt
lead: Which parts of a recipe run again after a change, and how to keep that small.
weight: 14
untested: true
---

## The rules

| What changed | What runs again |
|---|---|
| A group | That group, and every later phase that uses `run` |
| The items of a collector | The collector, and every later phase that uses `run` |
| The base image | Collectors and groups that use `run` |
| Nothing | Nothing |

Sibling groups of a changed group always stay in the cache.

The second column says "that uses `run`" for a reason. A group that only
copies files does not look at what came before it. nomira builds it on
its own and lays the result on top, so its cache depends only on the
files it copies. A new base image leaves it alone.

## An example

```yaml
phases:
  - name: packages
    collect: run pacman -S --needed --noconfirm ${items}
  - name: features
    groups:
      terminal: {include: features/terminal.yml}   # copies only
      network: {include: features/network.yml}     # copies only
  - name: services
    collect: run systemctl enable ${items}
```

After a new base image: `packages` runs again, which is right, because
the packages are different ones. `services` runs again and takes a
moment. `terminal` and `network` come from the cache.

After a change to `terminal`: only `terminal` is rebuilt, then
`services` runs again.

## Checked, not assumed

Building a group on its own is only correct if laying it on top gives
the same result as copying into the system directly. nomira checks that
on every build and quietly builds the group the ordinary way if

- a directory the group copies into is a symbolic link in the system, or
  exists there with another mode or owner, or
- the group puts a file where the system has a directory or a symbolic
  link, or the other way round.

You do not have to do anything for this. The only effect is that such a
group is rebuilt when the system before it changes. In the nomira base
image `/usr/local`, `/opt` and `/home` are symbolic links, and
directories such as `/etc/sudoers.d` have a restricted mode.

## Overrides that outlive their target

A drop-in that comes from the cache is applied even if the thing it
overrides is gone, for example because a unit was renamed in a new
version. `expects` guards against that:

```yaml
terminal:
  packages: [kmscon]
  expects: [/usr/lib/systemd/system/kmsconvt@.service]
  commands:
    - copy files/kmscon-override.conf /etc/systemd/system/kmsconvt@.service.d/override.conf
```

The paths are checked on every build against the state the phase starts
from. If one is missing, the build stops and names the group and the
path. The group itself is not rebuilt for the check.

## Generated files

A script that produces a file needs `run`, but not in a group. Give it a
`prepare` stage with its own image. The stage does not depend on the
base image either, and the group only copies:

```yaml
terminal:
  prepare:
    theme:
      from: docker.io/library/alpine:3.22
      commands:
        - copy tools/gen-theme.sh /gen-theme.sh
        - run mkdir /out && sh /gen-theme.sh > /out/theme.conf
  commands:
    - copy --from=theme /out/theme.conf /etc/kmscon/theme.conf
```

## When run in a group is fine

When the step really depends on the system: rebuilding the initramfs,
compiling against installed headers, changing a file a package shipped.
Put such steps into a late phase, so that little comes after them.
