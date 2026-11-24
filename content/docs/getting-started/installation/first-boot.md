---
title: First boot
lead: Answer a few questions, check the system, make it your own.
weight: 40
untested: true
---

## Questions

The system asks on the console for locale, keymap, time zone and root
password, unless the image sets them. Then log in as `root`.

## Check

```sh
bootc status            # the running image
ip address              # network devices
ping -c 1 archlinux.org # connection and name resolution
aa-status | head -n 3   # AppArmor
```

## Users

Create users as on any Arch system, see
[Users and groups](https://wiki.archlinux.org/title/Users_and_groups). Home directories live in
`/var/home` and survive updates.

## From now on

The system changes through its recipe. Edit it on the machine and
switch:

```sh
sudo nomira switch
sudo reboot
```
