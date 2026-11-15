---
title: nomira and NixOS
lead: nomira is not better than NixOS. It has different goals.
layout: compare
weight: 10
other: NixOS
axes:
  - title: How is the system described?
    left: Declaratively, in a language of its own
    right: As ordinary commands and files
    other: 8
    nomira: 84
    text: NixOS describes the system declaratively in its own language. nomira runs ordinary commands and copies files.
  - title: How exactly can a state be repeated?
    left: Every input pinned
    right: Package set pinned by a date
    other: 8
    nomira: 70
    text: NixOS pins every input. nomira pins the package set through a date.
  - title: How mature is the project?
    left: Proven over many years
    right: Early stage of development
    other: 6
    nomira: 92
    text: NixOS has been proven over many years. nomira is at an early stage of development.
---

## In short

**NixOS** describes a system in a language of its own. This gives
guarantees that nomira cannot offer: errors show up before the build, a
state can be repeated very exactly, and the project has been proven over
many years.

**nomira** does without that language. A recipe consists of ordinary
commands and files, and the packages come unchanged from Arch Linux.
That is less strict, but the system behaves the way the documentation of
each piece of software describes.

## In detail

| Topic | NixOS | nomira |
|---|---|---|
| Description of the system | Nix language with a module system | YAML recipe with shell commands and files |
| Declarative | Yes: you state the result, NixOS works out the steps | Only in part: you write the steps yourself. Every build starts over from the base image, so the system still does not drift |
| Checks before the build | Options and types are evaluated; many errors show up before the build | Only the structure of the recipe; errors in content show up during the build or the test boot |
| Independence of the parts | Follows from the language | Declared in the recipe, verified on every build |
| Repeatability | A lock file pins all inputs | The date in the Arch archive pins the package set; finished images by their digest |
| Rebuild after a change | Only the affected packages | The affected group and all following phases |
| Packages | nixpkgs: very large, packaged specially | Arch repositories and AUR, unchanged |
| Several versions side by side | Yes | No |
| Updates and way back | Atomic, any number of earlier states | Atomic with bootc, usually the previous state |
| AppArmor | A module exists. Profiles written for the usual paths do not fit the Nix store without work; this is being worked on | Active in the base image. Profiles for the usual paths apply unchanged |
| SSSD | A module exists | The Arch package, as on any Arch. Not tried by us yet |
| SELinux | Not supported | Not supported |
| Maturity | Since 2003, large community | Alpha, very small project |

The statements about NixOS reflect what we know and may be out of date.
The NixOS documentation is authoritative.

## When NixOS is the better choice

- You want errors to show up before the build wherever possible.
- You need the same state on many machines, over a long time.
- You want several versions of a piece of software side by side.
- You need a system you can rely on today.

## When nomira may fit

- You know Arch and want to keep using its packages and wiki.
- You want to set up software the way its own documentation describes,
  with the usual paths.
- You care about an immutable system with a way back, but not about a
  new language.
- You like trying something early and can live with breakage.

## Sources

- [AppArmor on NixOS Roadmap](https://discourse.nixos.org/t/apparmor-on-nixos-roadmap/57217)
- [NixOS Wiki: Active Directory Client](https://wiki.nixos.org/wiki/Active_Directory_Client) (SSSD)
