# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). No
versioned releases yet — everything below is unreleased, testnet-only work.

## Unreleased

### Added
- `ajo-circle` Soroban contract: `create_circle`, `join_circle`,
  `contribute`, `disburse`, plus read-only `get_circle`, `has_contributed`,
  `missed_count`, and `total_circles`. 13 unit tests.
- Frontend: landing page (problem, how it works, why Stellar, FAQ), an
  `/about` page, and the app itself (`/circles`, `/circles/[id]`) — create,
  join, contribute, and trigger payout, all via a directly wallet-signed
  transaction with no backend in between.
- On-chain circle discovery via the contract's own event log — no indexer.
- Frontend test suite (vitest) for the pure formatting and class-merging
  utilities.
- Repo health: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`,
  issue/PR templates, CI (contract tests + frontend lint/typecheck/test/build).
- `docs/ARCHITECTURE.md` — the reasoning behind the no-backend design, join
  order as payout order, and the missed-deadline partial-payout behavior.

### Fixed
- CI referenced `npm run typecheck` in the frontend job, but the script
  didn't exist in `frontend/package.json` — the step was silently a no-op.
- The closing CTA section originally used a near-black inverted background,
  the same dark-section convention as other projects rather than Ajo's own
  identity; replaced with the terracotta accent used throughout the rest of
  the site.

### Deployed
- `ajo-circle` contract to Stellar testnet. Redeployed once, after adding
  `total_circles` — see `frontend/.env.example` for which env var to set.
