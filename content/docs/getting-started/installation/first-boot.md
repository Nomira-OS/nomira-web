---
title: First boot and what comes next
lead: Answer a few questions, check the network, then make the system your own.
weight: 40
untested: true
---

## The first boot

The system asks on the console for whatever the image does not set:
locale, keymap, time zone and root password. Then log in as `root`.
Details are in [First boot](../../../base-image/first-boot/) of the base
image.

## Check the basics

```sh
bootc status                 # which image is running
ip address                   # network devices and their addresses
ping -c 1 archlinux.org      # name resolution and connection
aa-status | head -n 3        # AppArmor
```

How to join a Wi-Fi network depends on the network manager in your
image; the [Arch Wiki](https://wiki.archlinux.org/title/Network_configuration) describes each one. With NetworkManager, as
in the quick start, it is `nmtui`.

## Create a user

```sh
useradd -m -G wheel alice
passwd alice
```

Home directories live in `/var/home`, which belongs to the machine and
survives updates. To let the group `wheel` use `sudo`, add a file to
your recipe rather than editing the running system:

```yaml
sudo:
  - copy --chmod=0440 files/sudoers-wheel /etc/sudoers.d/10-wheel
```

```sh
echo '%wheel ALL=(ALL:ALL) ALL' > files/sudoers-wheel
```

## Make it your own

From now on the system changes through its recipe. Copy the directory
with your `recipe.yml` to the machine, edit it, and switch:

```sh
cd ~/mysystem
sudo nomira switch
sudo reboot
```

`nomira switch` builds the recipe, checks the result and hands it to
bootc. The previous state stays bootable. More in
[What switch does](../../../cli/switch/) and
[Updates and the way back](../../../operating/updates/).

Keep the recipe in a git repository. It is the description of your
system.
