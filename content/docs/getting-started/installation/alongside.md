---
title: Over an existing Linux
lead: bootc installs nomira into the root filesystem of a running Linux. Partitions and files stay; the old system no longer boots.
weight: 30
untested: true
---

Make a backup first. There is no way back to the old system except
restoring it.

The image's [unified kernel image](../../../recipes/base-images/boot/#unified-kernel-image)
needs a root partition of GPT type *Linux root (x86-64)* and a
filesystem with fs-verity. If yours has neither, leave the phases
`kernel` and `uki` out of the recipe.

## What happens

- `/boot` is wiped, and so are `EFI/` and `loader/` on the EFI system
  partition. Boot entries of other systems on the disk are lost.
- Everything else stays and is reachable below `/sysroot` afterwards.
- Other partitions, a separate `/home` for instance, are not mounted
  automatically; see step 2.

## 1. Load the image

```sh
sudo pacman -S --needed podman skopeo
```

Then [load the image](../prepare/#load).

## 2. Install

```sh
sudo podman run --rm --privileged --pid=host \
  -v /dev:/dev \
  -v /var/lib/containers:/var/lib/containers \
  -v /:/target \
  localhost/mysystem:latest \
  bootc install to-existing-root \
    --target-transport oci --target-imgref /var/lib/nomira/mysystem.oci \
    --skip-fetch-check
```

bootc warns and waits before it starts. Optional additions:

| Option | Meaning |
|---|---|
| `--karg "systemd.mount-extra=UUID=<uuid>:/var/home:ext4:defaults"` | Mount a separate home partition; `lsblk -f` shows the UUID |
| `--cleanup` | Delete the files of the old system on the first boot |
| `--acknowledge-destructive` | Skip the waiting time |

## 3. Reboot

```sh
sudo reboot
```

## The old files

```sh
sudo cp -a /sysroot/home/alice /var/home/
```

Delete the old system below `/sysroot` by hand when you no longer need
it. Leave `/sysroot/composefs`, `/sysroot/state` and `/sysroot/boot`
alone: those are nomira.
