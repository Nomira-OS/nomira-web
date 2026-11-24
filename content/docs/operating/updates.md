---
title: Updates and the way back
lead: An update is a new image. The previous state stays bootable.
weight: 10
untested: true
---

## Updating your own system

```sh
sudo nomira build
sudo bootc upgrade
```

`nomira build` builds the recipe, checks the result and only then
publishes it; nothing changes on the running system. `bootc upgrade`
takes the new image. It takes effect on the next boot; with `--apply`
the machine reboots right away.

## Without a full reboot

When kernel, initramfs and kernel arguments stay the same, bootc can
switch to the new image with a soft reboot: systemd stops and starts
userspace on the new system, the kernel keeps running.

```sh
sudo bootc upgrade --apply --soft-reboot=auto
```

With a [unified kernel image](../../base-image/booting/#unified-kernel-image)
that is the case whenever the packages did not change, since the
initramfs then comes unchanged from the cache. If a soft reboot is not
possible, `auto` does nothing on the composefs backend instead of
rebooting; `sudo reboot` then. `bootc status --verbose` shows whether the staged
image can be soft-rebooted into.

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
