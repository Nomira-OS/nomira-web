---
title: Starting in a VM
lead: Boot an image in a throwaway virtual machine, without installing it.
weight: 20
untested: true
---

## Requirements

On Arch Linux:

```sh
sudo pacman -S --needed podman qemu-base virtiofsd openssh
```

Install [bcvk](https://github.com/bootc-dev/bcvk) from source as its
README describes. The AUR has packages for it, which we have not tried.

## Start

```sh
skopeo copy oci-archive:.nomira/mysystem.oci.tar containers-storage:localhost/mysystem:latest
bcvk ephemeral run --console -it --name nomira-test localhost/mysystem:latest
```

The first boot asks for locale, keymap, time zone and root password,
then you log in as `root`. Add `--karg systemd.firstboot=off` to skip
the questions.

The bare base image boots as well, but has no network and no SSH, so
`bcvk ephemeral ssh` and `bcvk ephemeral test-basic` do not work with it.
