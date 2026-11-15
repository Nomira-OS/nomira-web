---
title: AppArmor
lead: AppArmor is active in the base image and enforces the profiles it finds.
weight: 30
---

## How it is switched on

- The kernel arguments in `/usr/lib/bootc/kargs.d/10-apparmor.toml` add
  AppArmor to the `lsm=` list.
- `apparmor.service` loads the profiles from `/etc/apparmor.d` at boot.

Profiles are enforced unless a profile says otherwise. `aa-status` shows
the state.

## Your own profiles

Put them into `/etc/apparmor.d` in your recipe:

```yaml
phases:
  - name: configuration
    groups:
      apparmor:
        - copy files/apparmor.d/ /etc/apparmor.d/
```

Because the image uses the usual paths of Arch Linux, profiles written
for those paths apply unchanged.

## Why not SELinux

Arch Linux does not ship the library SELinux needs, and bootc is built
without it here. Unlike SELinux, AppArmor works with paths instead of
labels on the files, so bootc needs no support of its own for it.
