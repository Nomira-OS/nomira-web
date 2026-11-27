---
weight: 40
title: Deployment
lead: From an OCI image to a booted system, and what changes with an update.
---

## Image to system

nomira's output is an OCI layout directory. bootc reads it with the
`oci` transport like a registry:

| Step | Command | What happens |
|---|---|---|
| First install | `bootc install … --target-transport oci --target-imgref /var/lib/nomira/<name>.oci` | partitions, composefs repository, boot entries |
| Follow a directory | `bootc switch --transport oci /var/lib/nomira/<name>.oci` | once, for a system installed otherwise |
| Update | `bootc upgrade [--apply]` | pulls new layers, stages a deployment |
| Back | `bootc rollback` | the previous deployment boots next |

Each deployment is a composefs image (EROFS metadata plus content-addressed
objects, checked by fs-verity) of the image's tree; see bootc's
[composefs backend](https://bootc.dev/bootc/bootc-composefs.7.html).
bootc keeps the booted, the rollback and a staged deployment.

## Boot

The base image boots with systemd-boot; bootc installs it on the ESP.
With a [unified kernel image](../../recipes/base-images/boot/#unified-kernel-image)
the kernel command line carries the composefs digest, so the UKI only
boots the tree it was built for; bootc's
[sealed images](https://bootc.dev/bootc/building/bootc-sealed-images.7.html)
describe the scheme nomira follows. The initramfs is rebuilt by pacman
hooks in the base image whenever a package changes what goes into it.

## What an update changes

| Path | With an update |
|---|---|
| `/usr` and the image's tree | replaced by the new deployment |
| `/etc` | three-way merge: image old → image new, local changes win |
| `/var` | untouched; filled from an image only at installation |
| Kernel, initramfs | a new boot entry; when kernel, initramfs and kernel arguments stay the same, a [soft reboot](https://bootc.dev/bootc/bootc-upgrades.7.html#soft-reboots) is possible |

Day-to-day use: [Updates](../../operating/updates/). Filesystem layout:
[Mounts](../mounts/#on-the-running-system).
