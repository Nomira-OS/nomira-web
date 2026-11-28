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

```mermaid
flowchart TD
  accTitle: An update, from the recipe to the running system
  accDescr: sudo nomira build builds the recipe. If a step or a check fails, nothing is published and the running system stays as it is. Otherwise the image is published to /var/lib/nomira/system.oci. sudo bootc upgrade stages it as a new deployment, which starts with the next boot, or with a soft reboot when kernel, initramfs and kernel arguments stay the same. The previous system stays in the boot menu, and bootc rollback goes back to it.
  edit["change the recipe"] --> build["sudo nomira build"]
  build --> ok{"every step and<br/>check passed?"}
  ok -->|no| keep["nothing is published;<br/>the system stays as it is"]
  ok -->|yes| pub["published to<br/>/var/lib/nomira/system.oci"]
  pub --> up["sudo bootc upgrade"]
  up --> staged["new deployment, staged"]
  staged -->|"next boot, or<br/>a soft reboot"| run["the new system runs"]
  run -.->|"bootc rollback"| prev["the previous system,<br/>still in the boot menu"]
  class ok accent
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

With a [unified kernel image](../../recipes/base-images/boot/#unified-kernel-image)
that is the case whenever no package changed what goes into the
initramfs: it is then either not rebuilt at all or rebuilt to the same
bytes. If a soft reboot is not possible, `auto` does nothing on the
composefs backend instead of rebooting; `sudo reboot` then.
`bootc status --verbose` shows whether the staged image can be
soft-rebooted into.

## Getting newer packages

The package set depends on the base image. Enter a newer tag in
`settings.base` and upgrade. All packages, including those from your
recipe, then come from the newer set; see
[Tags and package set](../../recipes/base-images/arch-base/versions/).

## Back to the previous state

bootc keeps two systems: the one running and the one before it, plus a
new one waiting for the next boot. A new `upgrade` or `switch` replaces
only the waiting one, never the running one; after a reboot the one
that was running becomes the previous one. You can select it in the
boot menu; to go back permanently:

```sh
sudo bootc rollback
```

## What is kept

`/usr` comes entirely from the new image. Your changes in `/etc` stay and
are merged with the new image; `/var` and `/home` stay unchanged. In
detail: [What an update changes](../../architecture/deployment/#what-an-update-changes).
