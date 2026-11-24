---
title: First boot
lead: The image does not set locale, keymap, time zone, root password or a user. The first boot asks.
weight: 20
untested: true
---

On the first boot `systemd-firstboot` asks on the console for whatever
is still open:

- locale
- keymap
- time zone
- root password

Then `systemd-homed-firstboot` asks for a first user, whose home is
encrypted, see [Security](../security/#home-directories).

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
