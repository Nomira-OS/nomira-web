---
title: Over an existing Linux
lead: bootc installs nomira into the root filesystem of a running Linux. Partitions and files stay; the old system no longer boots.
weight: 30
untested: true
---

bootc calls this installing "alongside". It is not dual boot: after the
reboot the machine starts nomira, and the previous system is only a set
of files on the disk.

## What happens to the existing system

- **`/boot` is wiped**, and so are the directories `EFI/` and `loader/`
  on the EFI system partition. Boot entries of other systems on the same
  disk, Windows included, are lost.
- **Everything else stays.** After the reboot the old root is reachable
  below `/sysroot`: home directories, `/etc`, container images.
- **Other partitions are not mounted automatically.** A separate
  `/home`, for instance, has to be mounted again by your recipe or by a
  kernel argument, see below.
- The kernel of the nomira image has to be able to mount the existing
  root filesystem. Plain ext4, btrfs and xfs are fine; an encrypted or
  otherwise special setup needs support in the image first.

Make a backup first. There is no way back to the old system except
restoring it.

## 1. Load the image

On the running Linux, install Podman and skopeo, then load your image as
described in [Build an image you can use](../image/). On Arch:

```sh
sudo pacman -S --needed podman skopeo
```

## 2. Install

```sh
sudo podman run --rm --privileged --pid=host \
  -v /dev:/dev \
  -v /var/lib/containers:/var/lib/containers \
  -v /:/target \
  --security-opt label=type:unconfined_t \
  localhost/mysystem:latest \
  bootc install to-existing-root \
    --composefs-backend \
    --bootloader systemd \
    --target-transport containers-storage \
    --skip-fetch-check
```

bootc prints a warning and waits before it starts. The differences to an
installation onto a whole disk:

| Option | Meaning |
|---|---|
| `-v /:/target` | Hands the existing root filesystem to bootc |
| no `--filesystem`, no `--wipe` | The filesystem is reused, nothing is formatted |
| `--acknowledge-destructive` | Optional: skips the waiting time |
| `--cleanup` | Optional: deletes the files of the previous system on the first boot. Leave it out to keep them |

The other options are explained on [the whole-disk page](../whole-disk/).

## 3. Mounts the new system needs

If `/home` or other data lived on a partition of its own, tell the new
system where it is. A kernel argument at installation does this without
a file:

```sh
    --karg "systemd.mount-extra=UUID=<uuid>:/var/home:ext4:defaults"
```

Append the line to the command above. `lsblk -f` shows the UUID. In a
nomira system `/home` is a link to `/var/home`, hence the path.

## 4. Reboot

```sh
sudo reboot
```

## Getting at the old files

After the reboot:

```sh
ls /sysroot
sudo cp -a /sysroot/home/alice /var/home/
```

When you no longer need the old system, delete its directories below
`/sysroot` by hand. Leave alone what bootc created there, among them
`/sysroot/composefs`, `/sysroot/state` and `/sysroot/boot`: those are
nomira itself. We have not gone through this clean-up yet; if in doubt,
look at the modification dates and delete nothing you cannot place.

Continue with [First boot and what comes next](../first-boot/).
