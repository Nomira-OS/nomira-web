---
title: First boot
lead: Answer a few questions, check the system, make it your own.
weight: 40
untested: true
---

## Questions

The system asks on the console for locale, keymap, time zone and root
password, unless the image sets them, and then for a first user. Log in
as that user.

## Check

```sh
bootc status            # the running image
ip address              # network devices
ping -c 1 archlinux.org # connection and name resolution
aa-status | head -n 3   # AppArmor
```

## Users

Users are managed by [systemd-homed](https://wiki.archlinux.org/title/Systemd-homed);
each home is encrypted. More users:

```sh
sudo homectl create alice --member-of=wheel
```

The first user is put into `wheel`, whose members may use `sudo`. For a
user without it, log in as `root` and run
`homectl update <user> --member-of=wheel`.

## From now on

The system changes through its recipe in `/etc/nomira`, which the
[`uki` example](https://github.com/Nomira-OS/arch-base/blob/main/examples/uki/recipe.yml) puts there. Edit it and update:

```sh
sudo nano /etc/nomira/recipe.yml
sudo nomira build
sudo bootc upgrade
sudo reboot
```
