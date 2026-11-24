---
title: Security
lead: From the firmware to the home directory, each step checks the next. What nomira does today, and where the chain is still open.
weight: 35
untested: true
---

## The chain

| Step | What it checks | nomira today |
|---|---|---|
| [Secure Boot](https://wiki.archlinux.org/title/Unified_Extensible_Firmware_Interface/Secure_Boot) | The firmware starts only a signed boot loader and kernel. | **Not yet.** The boot loader and the boot entries are not signed. |
| Sealed [UKI](https://wiki.archlinux.org/title/Unified_kernel_image) | Kernel, initramfs and kernel command line are one signed file. The command line carries the digest of the system image. | **Half.** nomira builds a UKI with the digest, but does not sign it yet; without a signature the command line can still be replaced. |
| composefs with [fs-verity](https://docs.kernel.org/filesystems/fsverity.html) | The initramfs mounts the system only if its digest matches the command line. The kernel then checks every file of `/usr` when it is read. | **Active** on ext4 and btrfs. |
| [AppArmor](../apparmor/) | Confines programs while they run. | **Active.** |
| Disk encryption | Protects `/etc` and `/var`, which are writable and not checked. | **Optional** at installation, bound to a TPM. See below. |
| [systemd-homed](https://wiki.archlinux.org/title/Systemd-homed) | Encrypts each home directory, unlocked with the user's password. | **Active.** The first boot asks for the first user. |

## What holds and what does not

- **`/usr` cannot be changed unnoticed while the system runs.** It is
  read-only, and a file whose content does not match its fs-verity
  digest cannot be read.
- **Someone with access to the disk can still change the system.** As
  long as nothing signs the UKI, the expected digest can be replaced
  along with the image. Secure Boot with a signed UKI closes that gap;
  nomira does not sign yet.
- **`/etc` and `/var` are not checked.** Offline, they can only be
  protected by encrypting the disk:
  `bootc install to-disk --block-setup tpm2-luks` encrypts the root
  partition and binds the key to the TPM. The initramfs has what it needs
  to unlock it; we have not tried it on a machine yet.
- **Home directories are encrypted** by default, independently of the
  rest, and need no TPM.

## fs-verity

bootc enables fs-verity when it creates the filesystem: on ext4 with the
`verity` feature, btrfs has it anyway. On a filesystem without fs-verity,
XFS for one, bootc relaxes the check. The kernel command line shows
which applies:

```sh
grep -o 'composefs=[^ ]*' /proc/cmdline
```

`composefs=<digest>` enforces fs-verity, `composefs=?<digest>` does not.
When installing next to an existing system, the existing filesystem
decides; see [fs-verity on ext4](https://docs.kernel.org/filesystems/fsverity.html#ext4).

## Home directories

`homectl create` and the first-boot question create homes with LUKS2 by
default: one encrypted image per user, `/home/<user>.home`. Other
storage types, chosen with `homectl create --storage=`:

| Storage | Encrypted | Note |
|---|---|---|
| `luks` | yes | Default; works on any filesystem |
| `fscrypt` | file contents and names | ext4 only; metadata stays readable, the password cannot be changed later |
| `directory`, `subvolume` | no | |

A FIDO2 key or a recovery key can unlock a home as well, see
`homectl(1)`.

## Checking a machine

```sh
bootctl status | head -n 8   # Secure Boot and TPM2
grep -o 'composefs=[^ ]*' /proc/cmdline
homectl list
```
