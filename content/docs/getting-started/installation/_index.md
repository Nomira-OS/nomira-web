---
title: Installation
lead: How nomira gets onto a machine. Please try it in a VM first.
weight: 40
untested: true
---

> Installation on real hardware has not been tried yet. Do not run it on
> a machine whose data you need. The commands on these pages follow the
> bootc documentation and the upstream project our base image derives
> from; nobody has run them with the nomira image so far.

## How it works

nomira has no installer of its own. A bootc image installs itself: you
run the image as a container on any Linux, and the `bootc` inside it
writes the system to a disk. The machine you install from only needs
Podman and root.

## The steps

1. **[Prepare the image](image/).** The bare base image has no
   network management, no firmware and no SSH. A machine installed from
   it boots, but cannot go online. Build a small recipe on top first.
2. **Install**, in one of two ways:
   - **[Onto a whole disk](whole-disk/)**: the disk is wiped and nomira
     becomes the only system on it.
   - **[Over an existing Linux](alongside/)**: the existing root
     filesystem is reused. The old system no longer boots, but its files
     stay on the disk.
3. **[First boot and what comes next](first-boot/).**

## Which way

| Question | Whole disk | Over an existing Linux |
|---|---|---|
| Start from | A live system, such as the Arch ISO | The installed Linux itself |
| Partitioning | Done by bootc | Kept as it is |
| Existing data | Lost | Kept on the disk, reachable below `/sysroot` |
| Other systems on the disk | Lost | Their boot entries are lost, see the page |
| bootc command | `bootc install to-disk` | `bootc install to-existing-root` |

Neither way sets up dual boot. To keep another operating system
bootable, use a separate disk.

## Open points

- **Boot loader.** The base image does not ship a boot loader package of
  its own. The commands here select systemd-boot, which needs a machine
  that boots with UEFI. Whether this works with the nomira image is the
  main thing still to be tried.
- **Storage backend.** The commands pass `--composefs-backend`, as the
  upstream Arch image does. Whether `nomira switch` works on a system
  installed this way has not been tried either.
- **Secure Boot** is not set up.
