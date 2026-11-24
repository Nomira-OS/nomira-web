---
title: First boot
lead: The image does not set locale, keymap, time zone or root password. The first boot asks.
weight: 20
untested: true
---

On the first boot `systemd-firstboot` asks on the console for whatever
is still open:

- locale
- keymap
- time zone
- root password

Then log in as `root` with that password. No other user is created; add
one as described in
[Users and groups](https://wiki.archlinux.org/title/Users_and_groups),
or in the recipe.

## Answering in the recipe

A recipe that writes the values to `/etc` gets no question for them:

| Setting | File |
|---|---|
| Locale | `/etc/locale.conf` |
| Keymap | `/etc/vconsole.conf` |
| Time zone | `/etc/localtime` (a link into `/usr/share/zoneinfo`) |

## Unattended

- For installations without a console the values can be passed as
  systemd credentials, see `systemd-firstboot(1)`.
- The kernel argument `systemd.firstboot=off` turns the questions off
  entirely. The CLI passes it when it boots an image for a test.
