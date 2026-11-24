---
title: Updates and the way back
lead: An update is a new image. The previous state stays bootable.
weight: 10
untested: true
---

## Updating your own system

```sh
sudo nomira upgrade
```

That is `nomira build` (build, check, publish) and then `bootc upgrade`.
Nothing changes on the running system before the checks have passed. The
new system takes effect on the next boot; with `--apply` the machine
reboots right away.

## Getting newer packages

The package set depends on the base image. Enter a newer release in
`settings.base` and upgrade. All packages, including
those from your recipe, then come from the newer set.

## Back to the previous state

bootc keeps two systems: the one running and the one before it, plus a
new one waiting for the next boot. A new `switch` replaces only the
waiting one, never the running one; after a reboot the one that was
running becomes the previous one. You can select it in the boot menu; to
go back permanently:

```sh
sudo bootc rollback
```

## What is kept

- `/etc`: your changes stay and are merged with the new image.
- `/var` and `/home`: stay unchanged.
- `/usr`: comes entirely from the new image.
