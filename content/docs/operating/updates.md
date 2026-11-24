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

## The boot loader

Every switch writes new boot entries, a kernel and an initramfs to the
EFI system partition. bootc does that, and nothing else is needed for
it.

systemd-boot itself is not updated by bootc. It stays at the version it
was installed with; it keeps booting newer kernels, but its own fixes do
not arrive. systemd has a service for this, `systemd-boot-update.service`,
which copies a newer systemd-boot from the running system to the EFI
system partition at boot. The base image does not enable it yet, because
we have not checked whether it finds the EFI system partition on a
nomira system.

## What is kept

- `/etc`: your changes stay and are merged with the new image.
- `/var` and `/home`: stay unchanged.
- `/usr`: comes entirely from the new image.
