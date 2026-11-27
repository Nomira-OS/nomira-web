---
title: Wi-Fi on first boot
lead: Let a machine without a cable join a network the first time it starts. The example uses NetworkManager.
weight: 10
untested: true
---

This example uses NetworkManager, as the quick start does. Other
network managers keep their connections elsewhere, see
[Network configuration](https://wiki.archlinux.org/title/Network_configuration) in the Arch Wiki. What matters for a
recipe is that the file lives below `/etc` or `/usr`: files below `/var`
are not part of the image.

NetworkManager reads connections from files in
`/etc/NetworkManager/system-connections/`. A recipe can put one there.

## The connection file

`files/nm/home.nmconnection`:

```ini
[connection]
id=home
type=wifi

[wifi]
ssid=YOUR-NETWORK

[wifi-security]
key-mgmt=wpa-psk
psk=YOUR-PASSWORD

[ipv4]
method=auto

[ipv6]
method=auto
```

## The group

```yaml
# features/wifi.yml, imported by the recipe (imports: [features/wifi.yml])
build:
  features:
    wifi:
      packages: [networkmanager]
      services: [NetworkManager.service]
      commands:
        - copy --chmod=0600 files/nm/ /etc/NetworkManager/system-connections/
```

This assumes the collectors `packages` and `services`, which the
[example recipes](https://github.com/Nomira-OS/arch-base/tree/main/examples)
import from the base image's
[recipe parts](https://github.com/Nomira-OS/arch-base/tree/main/recipes). If another group
already asks for NetworkManager, naming it again does no harm.

NetworkManager ignores connection files that others can read, hence
`--chmod=0600`.

## Mind the password

The password is part of the image. Do not push such an image to a public
registry, and keep `files/nm/` out of a public git repository.

Without this example, connect by hand after the first boot:

```sh
nmtui
```
