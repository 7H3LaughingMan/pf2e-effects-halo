# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [7.3.0] - 2026-02-08

### Changed

- Renamed "Effect Scale" to "Halo Radius" to clear up some confusion
- Non-dynamic tokens will only have their scale used as part of calculating the token's radius when it is linked to the
  actor size
- Math

## [7.2.3] - 2026-02-05

### Added

- Localization Support

## [7.2.2] - 2026-02-05

### Added

- Support for flipped tokens
  - Effects will no longer disappear if you use another module to flip a token
  - Note, this module does not handle the flipping itself and you would need another module to handle it

## [7.2.1] - 2026-02-04

### Fixed

- Dynamic Overscaled Tokens

## [7.2.0] - 2026-02-03

### Added

- Support for Dynamic Tokens
  - PF2e Effects Halo will now "calculate" the size of the token and determine how many effect icons it can display
    around the token. This applies to every "row" of effects around the token meaning that more effects can be displayed
    on the 2nd "row" and even more on the 3rd "row".
- PF2e/SF2e Effect Colors
  - By default the background/border of the effects will depend on which system you are using; however, this is
    configurable per user in the settings if you want to change the colors.
- Option to increase the spacing of effects on the same row
- Option to increase the spacing between rows
- Option to increase the "scale of the halo
  - What this setting does is increase the calculated radius of the tokens, so if you are using funky tokens that need
    more or less space between the token and the first row of effects you can use this setting.
  - There is a "global" setting in the settings along with a setting stored on each actor, the actor settings can be
    accessed by opening the actor sheet you want to modify and clicking on the "magic sparkles" icon in the title bar.
    Please note that actor settings are stored on the actor itself, so if you modify a non-linked actor the settings are
    stored on the token itself and won't apply to other tokens of the same actor. You would need to modify the parent
    actor first and make tokens with it to apply the settings to multiple non-linked tokens.

## [7.1.0] - 2026-02-01

### Added

- Support for the Starfinder 2e System!

## [7.0.0] - 2025-06-08

Foundry VTT Version 13 Support

## [6.1.0] - 2024-08-30

### Changed

- Updated underlying code to match PF2e Dorako UX 1.5.0

## [6.0.0] - 2024-08-28

### Added

- Copied the
  [Radial Condition HUD](https://github.com/Dorako/pf2e-dorako-ux/blob/main/esmodules/dorako-ux/radial-condition-hud.js)
  from PF2e Dorako UX

### Changed

- Removed PF2e Dorako UX, this module is always on when enabled
- Removed PF2e Dorako UI theme check, this module uses the default

[Unreleased]: https://github.com/7H3LaughingMan/pf2e-effects-halo/compare/v7.3.0...HEAD
[7.3.0]: https://github.com/7H3LaughingMan/pf2e-effects-halo/compare/v7.2.3...v7.3.0
[7.2.3]: https://github.com/7H3LaughingMan/pf2e-effects-halo/compare/v7.2.2...v7.2.3
[7.2.2]: https://github.com/7H3LaughingMan/pf2e-effects-halo/compare/v7.2.1...v7.2.2
[7.2.1]: https://github.com/7H3LaughingMan/pf2e-effects-halo/compare/v7.2.0...v7.2.1
[7.2.0]: https://github.com/7H3LaughingMan/pf2e-effects-halo/compare/v7.1.0...v7.2.0
[7.1.0]: https://github.com/7H3LaughingMan/pf2e-effects-halo/compare/v7.0.0...v7.1.0
[7.0.0]: https://github.com/7H3LaughingMan/pf2e-effects-halo/compare/v6.1.0...v7.0.0
[6.1.0]: https://github.com/7H3LaughingMan/pf2e-effects-halo/compare/v6.0.0...v6.1.0
[6.0.0]: https://github.com/7H3LaughingMan/pf2e-effects-halo/releases/tag/v6.0.0
