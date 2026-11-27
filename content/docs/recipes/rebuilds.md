---
title: What gets rebuilt
lead: Which parts of a recipe run again after a change, and how to keep that small.
weight: 14
---

## The rules

| What changed | What runs again |
|---|---|
| A group | That group, and every later phase that uses `run` |
| The items of a collector | The collector, and every later phase that uses `run` |
| The base image | Collectors and groups that use `run` |
| `settings.env` | Every `run` of the recipe |
| An `env` command | The commands after it in its group, and every later phase that uses `run` |
| Nothing | Nothing |

Sibling groups of a changed group always stay in the cache.

The second column says "that uses `run`" for a reason. A group that only
copies files does not look at what came before it. nomira builds it on
its own and lays the result on top, so its cache depends only on the
files it copies. A new base image leaves it alone.

## Large collectors

A collector runs once with all its items. When one item changes, it runs
again with all of them: pacman takes the packages from the cache mount
instead of downloading them, but still unpacks every one, runs every
hook and, when firmware or a kernel is among them, builds the initramfs
again. The result is the same; only the time grows with the collector.

When that matters, split the collector: what rarely changes goes to a
collector of its own in a phase before the others, with the same
command.

```yaml
build:
  firmware:        # changes with new hardware, rarely
    collect: run … pacman -S --needed --noconfirm ${items}
  packages:        # changes often
    collect: run … pacman -S --needed --noconfirm ${items}
  features:
    hardware:
      firmware: [linux-firmware-intel, intel-ucode]
    editor:
      packages: [nano]
```

Adding an editor then reruns only `packages` and what follows; the
firmware stays in the cache. Which collector a package goes to never
changes what ends up in the image.

## An example

```yaml
imports: [features/terminal.yml, features/network.yml]   # two groups that only copy
build:
  packages:
    collect: run pacman -S --needed --noconfirm ${items}
  features: {}            # its groups come from the imports
  services:
    collect: run systemctl enable ${items}
```

After a new base image: `packages` runs again, which is right, because
the packages are different ones. `services` runs again and takes a
moment. `terminal` and `network` come from the cache.

After a change to `terminal`: only `terminal` is rebuilt, then
`services` runs again.

## Checked, not assumed

Building a group on its own is only correct if laying it on top gives
the same result as copying into the system directly. Two things can get
in the way:

- **A symbolic link in the path.** In the base image `/usr/local` is a
  link into `/var`. Copied directly, a file for `/usr/local/bin` follows
  the link. Laid on top, the group would bring a real directory
  `/usr/local` and replace the link.
- **A directory with its own mode or owner.** `/etc/sudoers.d` is not
  readable by everyone. A group built on its own creates the directory
  with default rights; laid on top, those would replace the restricted
  ones.

The same goes for a file that meets a directory, or the other way round.

nomira checks this on every build. Where one of these applies, it builds
the group the ordinary way, on the system. The result is then right in
every case. What you lose is the independence: such a group is rebuilt
whenever the base image or an earlier phase changes.

## The warning

Because that is easy to miss, the steps of such a group say so in the
build output every time, also when they come from the cache:

```text
[features/sudo, WARNING: not independent of earlier state: /etc/sudoers.d has mode.uid.gid 750.0.0 there, not 755.0.0] copy files/sudoers-wheel -> /etc/sudoers.d/10-wheel
```

The note names the first path in the way and says how many more there
are.

What you can do about it:

- **Accept it.** For a small group the rebuild costs a second.
- **Split the group.** Move the one command that touches such a path
  into a group of its own, so that the rest stays independent.
- **Choose another path** where there is one: `/usr/lib/…` instead of
  `/usr/local/…`, for example.

## Overrides that outlive their target

A drop-in that comes from the cache is applied even if the thing it
overrides is gone, for example because a unit was renamed in a new
version. A check as a step of the recipe guards against that: a group
in a late phase, `lint` for instance, which the feature file adds next
to its own group.

```yaml
# features/terminal.yml
build:
  features:
    terminal:
      packages: [kmscon]
      commands:
        - copy files/kmscon-override.conf /etc/systemd/system/kmsconvt@.service.d/override.conf
  lint:
    terminal: ["run test -e /usr/lib/systemd/system/kmsconvt@.service"]
```

The check uses `run`, so it runs again whenever anything before it
changed, a new base image included, and takes a fraction of a second.
The group with the drop-in stays independent and comes from the cache.

## Generated files

A script that produces a file needs `run`, but not in a group. Give it a
stage with its own image. The stage does not depend on the
base image either, and the group only copies:

```yaml
stages:
  theme:
    from: docker.io/library/alpine:3.22
    commands:
      - copy tools/gen-theme.sh /gen-theme.sh
      - run mkdir /out && sh /gen-theme.sh > /out/theme.conf
build:
  features:
    terminal:
      commands:
        - copy --from=theme /out/theme.conf /etc/kmscon/theme.conf
```

A feature file that needs a stage brings it along: `stages` at the top
of the file is merged like everything else.

## When run in a group is fine

When the step really depends on the system: rebuilding the initramfs,
compiling against installed headers, changing a file a package shipped.
Put such steps into a late phase, so that little comes after them.
