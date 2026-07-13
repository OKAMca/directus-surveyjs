# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.1.0

### Added

- **List Box question types.** Two new question types are registered in the
  creator toolbox — an always-visible, scrollable selectable list (no popover):
  - `listbox` — single select (inherits from `radiogroup`)
  - `multilistbox` — multiple select (inherits from `checkbox`)

  Because they inherit from the built-in choice questions, they expose the same
  options (choices, choices by URL, choices from question, validators,
  visibility rules, …) and are localized (en / fr) through the existing Directus
  language setup. In the designer they use the native choice editor; at
  preview / runtime they render an accessible list following the WAI-ARIA
  `listbox` pattern (arrow / Home / End / Enter / Space navigation).

### Changed — Migrate SurveyJS from 1.11.11 to 2.5.29

Upgraded the SurveyJS dependencies (`survey-core`, `survey-creator-core`,
`survey-creator-vue`, `survey-vue3-ui`) to `2.5.29`. SurveyJS v2 introduced
breaking changes to the package `exports` maps, CSS theming and public API,
which required the following source updates:

- **CSS theme import** ([src/creator/components/Creator.vue](src/creator/components/Creator.vue)):
  `survey-core/defaultV2.css` was removed in v2. The "Default V2" theme is now
  the single built-in theme and ships as `survey-core/survey-core.css`. Updated
  the import accordingly.

- **Localization (i18n) imports** ([src/creator/components/Creator.vue](src/creator/components/Creator.vue)):
  v2 reworked the `exports` map so the localization bundles are no longer
  exposed with a `.js` extension. Updated:
  - `survey-core/survey.i18n.js` → `survey-core/survey.i18n`
  - `survey-creator-core/survey-creator-core.i18n.js` → `survey-creator-core/survey-creator-core.i18n`

  Without this change the bundler could not resolve the modules and treated them
  as external, which silently disabled survey / creator localization at runtime.

- **Type shim** ([src/creator/shims.d.ts](src/creator/shims.d.ts)): updated the
  `survey-creator-core/survey-creator-core.i18n` module declaration to the new
  extensionless path.

- **List Box theme CSS map** ([src/creator/lib/questions/models.ts](src/creator/lib/questions/models.ts)):
  the theme's per-type CSS class map export was renamed `defaultV2Css` →
  `defaultCss`. Updated the List Box types' CSS registration to use `defaultCss`.

- **README** ([README.md](README.md)): updated the React submission example to
  import `survey-core/survey-core.min.css` instead of the removed
  `survey-core/defaultV2.min.css`.

### Security

- Resolved both **critical** `npm audit` advisories:
  - Bumped `vitest` `^1.6.0` → `^3.2.4` (RCE / arbitrary file read via the
    Vitest API/UI server).
  - Added an `overrides` entry forcing `form-data` `^4.0.4` (unsafe random
    boundary / CRLF injection), pulled transitively through the dev toolchain.

  `npm audit` no longer reports any critical issues.

- Run `npm audit fix`

- Updating minimal host (directus) 10.10.0 minimum version to 11.8.0

- Updating @directus/extension-sdk 10.3.4 to 13.1.1 (directus 11.8.0)

## 1.0.3

- Previous releases. See the Git history.
