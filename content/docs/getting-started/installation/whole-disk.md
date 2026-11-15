---
title: Onto a whole disk
lead: bootc partitions the disk and installs nomira as the only system on it. Everything on the disk is lost.
weight: 20
untested: true
---

Use this for a new machine, an empty disk or a VM.

## 1. Boot a live system

Any Linux with Podman works. With the Arch ISO:

```sh
pacman -Sy --noconfirm podman skopeo
```

Then load your image as described in
[Prepare the image](../image/).

## 2. Find the disk

```sh
lsblk -o NAME,SIZE,MODEL,TYPE
```

Take the name of the whole disk, such as `/dev/nvme0n1` or `/dev/sda`,
not of a partition. Check it twice: the next command erases it.

## 3. Install

```sh
sudo podman run --rm --privileged --pid=host --ipc=host \
  -v /dev:/dev \
  -v /var/lib/containers:/var/lib/containers \
  --security-opt label=type:unconfined_t \
  localhost/mysystem:latest \
  bootc install to-disk \
    --composefs-backend \
    --bootloader systemd \
    --filesystem ext4 \
    --wipe \
    --target-transport containers-storage \
    --skip-fetch-check \
    /dev/DISK
```

What the options do:

| Option | Meaning |
|---|---|
| `--privileged`, `--pid=host`, `-v /dev:/dev` | Let the container write to the disks of the host |
| `-v /var/lib/containers:…` | Lets bootc read its own image |
| `--composefs-backend`, `--bootloader systemd` | Storage and boot loader as in the upstream Arch image; needs UEFI |
| `--filesystem ext4` | Root filesystem; `btrfs` and `xfs` are possible too. The image sets no default, so the option is required |
| `--wipe` | Erase what is on the disk |
| `--target-transport containers-storage`, `--skip-fetch-check` | The image was loaded locally and comes from no registry. Leave both out if you installed from a registry |

Useful additions:

- `--root-ssh-authorized-keys /path/to/key.pub` lets you log in as root
  over SSH with that key. The path is seen from inside the container, so
  mount the file with `-v`.
- `--karg NAME=VALUE` adds a kernel argument for this machine.

## 4. Reboot

```sh
sudo reboot
```

Remove the live medium. Continue with
[First boot and what comes next](../first-boot/).

## Trying it without a machine

The same command can write to a file instead of a disk. The file is a
disk image that a VM can boot:

```sh
truncate -s 20G nomira.raw
sudo podman run --rm --privileged --pid=host --ipc=host \
  -v /dev:/dev \
  -v /var/lib/containers:/var/lib/containers \
  -v .:/output \
  --security-opt label=type:unconfined_t \
  localhost/mysystem:latest \
  bootc install to-disk \
    --composefs-backend --bootloader systemd --filesystem ext4 \
    --target-transport containers-storage --skip-fetch-check \
    --generic-image --via-loopback /output/nomira.raw
```

Boot `nomira.raw` in a VM with UEFI firmware, for example with
virt-manager or `qemu-system-x86_64` and OVMF. This is the best way to
check the open points before touching a real disk.
