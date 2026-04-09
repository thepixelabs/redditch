<div align="center">
  <img src="public/logo-readme.svg" width="120" alt="Redditch" />

  # Redditch

  A garage notebook for your Royal Enfield, shared with the community.<br />
  No account. No ads. No data collection. Works offline.

  [![CI](https://github.com/thepixelabs/redditch/actions/workflows/ci.yml/badge.svg)](https://github.com/thepixelabs/redditch/actions/workflows/ci.yml)
  [![License: MIT](https://img.shields.io/badge/License-MIT-C8962C.svg)](LICENSE)
  [![PWA](https://img.shields.io/badge/PWA-offline--capable-B5121B.svg)](https://redditch.pixelabs.net)
</div>

---

Redditch is a service companion for Royal Enfield riders. Select your bike, see the full service schedule with torque specs and part numbers, and track what you have done and when — all without creating an account or sending your data anywhere.

Service data lives in plain YAML files in this repository. Every torque figure and interval comes from Royal Enfield owner's manuals and official service documentation. If something is wrong, a pull request here fixes it for every rider using the app.

**Live app:** [redditch.pixelabs.net](https://redditch.pixelabs.net)

## Screenshots

<!-- TODO: add screenshots to .github/screenshots/ -->

## Features

- Service schedules for all current Royal Enfield models (350, 411, 450, 650 platforms)
- Torque specs, oil grades, spark plug part numbers, tyre pressures — per model, not generic
- Break-in, minor, major, and extended service intervals clearly separated
- Offline-capable PWA — works in a garage with no signal
- No account, no login, no data collection
- Installable on Android and iOS home screens
- Bike data in human-readable YAML — no database, no backend

## Tech stack

- [Next.js 14](https://nextjs.org) — static export, no server required
- TypeScript + [Zod](https://zod.dev) — schema-validated bike data at build time
- [TailwindCSS](https://tailwindcss.com) — utility-first styling
- [Serwist](https://serwist.pages.dev) — service worker and PWA manifest
- [Radix UI](https://www.radix-ui.com) — accessible headless components
- Hosted on GitHub Pages, deployed via GitHub Actions

## Getting started

You need Node.js 18 or later and npm.

```bash
git clone https://github.com/thepixelabs/redditch.git
cd redditch
npm install
npm run dev
```

The app runs at `http://localhost:3000`. The build validates all YAML bike data before starting Next.js, so a malformed data file will fail fast with a clear error.

To run the full CI suite locally:

```bash
npm run validate-yaml   # schema-check all data/bikes/*.yaml files
npm run type-check      # TypeScript — no emit
npm test                # Jest unit tests
npm run build           # static export to out/
```

## Adding bike data

This is the primary way to contribute. You do not need to know React or TypeScript.

Bike data lives in `data/bikes/`. Each file is a YAML document that follows the same schema — engine specs, service schedule, torque specs, and a `meta` block that records when the data was last verified and its source.

Copy an existing file and edit it:

```bash
cp data/bikes/classic-350.yaml data/bikes/your-model.yaml
```

The schema is validated at build time. Run `npm run validate-yaml` after editing to catch errors before opening a pull request.

A few things that matter most in bike data:

- Torque values and service intervals must come from an official source (owner's manual, Royal Enfield service documentation). State the source in `meta.source`.
- Wrong torque specs or incorrect service intervals are worse than missing data. If you are unsure, leave the field out and note it in the PR.
- Set `meta.last_verified` to today's date in `YYYY-MM-DD` format.

Currently supported models: Bullet 350, Classic 350, Hunter 350, Meteor 350, Himalayan 411, Scram 411, Himalayan 450, Interceptor 650, Continental GT 650, Super Meteor 650.

## Contributing

Redditch is a spare-time project. Success means one more rider catches a missed service interval. That is it. Every contribution is genuinely appreciated.

**Bug reports** — use the `bug_report` issue template. Include your bike model and browser/OS if relevant.

**Bike data corrections or additions** — use the `bike_data` issue template, or open a pull request directly against `data/bikes/`. Corrections to torque specs or service intervals are treated as high priority.

**Ideas and suggestions** — open a blank issue titled `[idea] your idea here`. No template needed.

**Code contributions** — the stack is Next.js 14, TypeScript, and TailwindCSS. Open an issue before starting significant work so we can discuss direction. CI must pass (type check, YAML validation, tests, build) before a pull request will be merged.

The CI workflow runs on every pull request and push to `main`. Deployment to GitHub Pages triggers automatically on merge to `main`.

## Disclaimer

Always cross-reference with your official Royal Enfield service manual. Contributors are riders, not Royal Enfield engineers. This project is not affiliated with Royal Enfield.

## License

MIT — see [LICENSE](LICENSE).

> Note: the `LICENSE` file has not been added to the repository yet. This needs to be created before public release.
