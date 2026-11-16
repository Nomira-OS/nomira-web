---
title: Wi-Fi on first boot
lead: Let a machine without a cable join a network the first time it starts.
weight: 10
untested: true
---

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
  - name: features
    groups:
      wifi:
        packages: [networkmanager]
        services: [NetworkManager.service]
        commands:
          - copy --chmod=0600 files/nm/ /etc/NetworkManager/system-connections/
```

This assumes the collectors `packages` and `services` from the
[quick start](../../../getting-started/quickstart/). If another group
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
