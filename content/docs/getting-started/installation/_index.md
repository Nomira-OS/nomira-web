---
title: Installation
lead: Install your image onto a disk. Try it in a VM first.
weight: 30
untested: true
---

> Nobody has installed the nomira image yet. Do not try it on a machine
> whose data you need.

The image installs itself: you run it with Podman, and the bootc inside
it writes the system to a disk. Nothing else needs to be installed.

## Requirements

- A machine that boots with UEFI.
- On the Linux you install from: `podman`, `skopeo` and root.

## Steps

1. [Prepare the image](prepare/)
2. Install it, one of two ways:
   - [Onto a whole disk](whole-disk/): the disk is wiped.
   - [Over an existing Linux](alongside/): partitions and files stay;
     the old system no longer boots.
3. [First boot](first-boot/)

Neither way sets up dual boot. To keep another system bootable, use a
separate disk.
