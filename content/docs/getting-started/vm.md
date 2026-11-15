---
title: Starting in a VM
lead: The safe way to get to know nomira. Nothing changes on your own system.
weight: 30
untested: true
---

A virtual machine boots the image with its own kernel. Podman alone is
not enough for that, because a container shares the kernel of the host.
We use [bcvk](https://github.com/bootc-dev/bcvk), which boots a bootc
image in a VM without installing it.

What has been tried so far: the base image reaches the end of the boot
process in the VM. Starting with a console, as described below, follows
the bcvk documentation and has not been run by us yet.

## Requirements

On Arch Linux:

```sh
sudo pacman -S --needed podman qemu-base virtiofsd openssh
```

bcvk is available ready-made only for Fedora. On Arch you build it from
source, see the [bcvk instructions](https://github.com/bootc-dev/bcvk).

## Starting

```sh
podman pull ghcr.io/nomira-os/nomira-image:TAG
bcvk ephemeral run --console -it --name nomira-test ghcr.io/nomira-os/nomira-image:TAG
```

Replace `TAG` with a tag of the base image. The available ones are
listed under
[Packages at Nomira-OS](https://github.com/orgs/Nomira-OS/packages).

## The first boot

The base image does not set locale, keymap, time zone or root password.
On the first boot it asks for them on the console. After that you log in
as `root`. See [First boot](../../base-image/first-boot/).

If the VM should start without questions, in a test for instance, pass
the kernel argument:

```sh
bcvk ephemeral run --karg systemd.firstboot=off ...
```

## What the VM does not show

The base image contains neither network management nor SSH. The SSH
access of bcvk and its quick test `test-basic` therefore only work with
a recipe that adds both.
