---
title: Updates and the way back
lead: An update is a new image. The previous state stays bootable.
weight: 10
untested: true
---

## Updating your own system

```sh
sudo nomira switch
```

The command builds the recipe, checks the result and only then hands the
image to bootc. Until then nothing changes on the running system. The
new system takes effect on the next boot; with `--apply` the machine
reboots right away.

`nomira switch --dry-run` shows which commands would run.

## Getting newer packages

The package set depends on the base image. Enter a newer release in
`settings.base` and run `sudo nomira switch`. All packages, including
those from your recipe, then come from the newer set.

## Back to the previous state

bootc keeps the previous state. You can select it in the boot menu; to
go back permanently:

```sh
sudo bootc rollback
```

## What is kept

- `/etc`: your changes stay and are merged with the new image.
- `/var` and `/home`: stay unchanged.
- `/usr`: comes entirely from the new image.
