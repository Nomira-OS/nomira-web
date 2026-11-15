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
systemctl is-active NetworkManager
nmcli device status          # network devices and their state
aa-status | head -n 3        # AppArmor
```

Connect to a Wi-Fi network if the image did not bring one along:

```sh
nmtui
```

## Create a user

```sh
useradd -m -G wheel alice
passwd alice
```

Home directories live in `/var/home`, which belongs to the machine and
survives updates. To let the group `wheel` use `sudo`, add a file to
your recipe rather than editing the running system:

```yaml
- run echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/10-wheel && chmod 0440 /etc/sudoers.d/10-wheel
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
