---
title: Onto a whole disk
lead: bootc partitions the disk and installs nomira as the only system on it. Everything on the disk is lost.
weight: 20
untested: true
---

## 1. Boot a live system

With the Arch ISO, booted in UEFI mode:

```sh
mount -o remount,size=8G /run/archiso/cowspace
pacman -Sy --noconfirm podman skopeo
```

The first line makes room for the image, which the live system keeps in
RAM. Then [load the image](../prepare/#load).

## 2. Find the disk

```sh
lsblk -o NAME,SIZE,MODEL,TYPE
```

Take the whole disk, such as `/dev/nvme0n1`, not a partition.

## 3. Install

```sh
sudo podman run --rm --privileged --pid=host --ipc=host \
  -v /dev:/dev \
  -v /var/lib/containers:/var/lib/containers \
  localhost/mysystem:latest \
  bootc install to-disk \
    --filesystem ext4 \
    --wipe \
    --target-transport containers-storage \
    --skip-fetch-check \
    /dev/DISK
```

| Option | Meaning |
|---|---|
| `--filesystem ext4` | Root filesystem; `xfs` and `btrfs` are possible too |
| `--wipe` | Erase the disk |
| `--target-transport …`, `--skip-fetch-check` | The image was loaded locally; leave both out for an image from a registry |
| `--karg NAME=VALUE` | Optional: a kernel argument for this machine |

## 4. Reboot

Remove the live medium and reboot.

## Trying it in a VM first

Write to a disk image instead of a disk:

```sh
truncate -s 20G nomira.raw
sudo podman run --rm --privileged --pid=host --ipc=host \
  -v /dev:/dev \
  -v /var/lib/containers:/var/lib/containers \
  -v .:/output \
  localhost/mysystem:latest \
  bootc install to-disk \
    --filesystem ext4 \
    --target-transport containers-storage --skip-fetch-check \
    --generic-image --via-loopback /output/nomira.raw
```

Boot `nomira.raw` in a VM with UEFI firmware, for example
virt-manager, or QEMU with OVMF.
