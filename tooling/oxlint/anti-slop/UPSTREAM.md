# Vendored anti-slop

Source: https://github.com/dmmulroy/anti-slop
Revision: `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`

This directory contains the upstream `src/` tree and root MIT license, copied
with the local customization listed below. The bundled ESLint Stylistic
implementation retains its own license and provenance under `vendor/eslint-stylistic/`.

Repository policy lives in the root `oxlint.config.ts`; it is intentionally a
subset of upstream's opinionated rules. Keep `oxlint` and `@oxlint/plugins` at
the same exact version. When updating, compare against this upstream revision,
preserve local policy, and rerun lint, typecheck, tests, and build. Run
`pnpm test:oxlint` when changing or updating the vendored rules. It runs all
vendored rule suites through Vitest, including the local customization,
separately from the application suite. The scaffold also runs this command in
CI alongside the application suite.

## Local customization

`rules/no-conditional-empty-object-spread.ts` recognizes parenthesized empty
branches and preserves the absence of an autofix: arbitrary omission conditions
need manual review. Its reference-project diagnostic was adapted to recommend
explicit construction or an omission helper without naming an absent helper.
The inherited fixtures continue to exercise the reference helper call syntax.

`rules/require-readable-spacing-cli.test.ts` wraps the upstream CLI checks in a
Vitest test. The shared setup outside this directory connects RuleTester to
Vitest so each rule example is collected as a test.

## Scaffold provenance

Copied from https://github.com/jackbisceglia/dotheyplaytoday at
`a9301b6c4c944dc070fccf012b9c2a6f5edbbd4d`, including its existing local
customizations, tests, and license notices. The generic plugin policy is reused
for core, API, and web. The scaffold allows schema interfaces extending one
inferred type and leaves object type alias versus interface selection to the
relevant API constraints. No application-level suppression is added.
The one diagnostic adaptation above removes reference-project naming without
changing the rule's detection or fixture coverage. Its existing diagnostic
assertion now checks the adapted omission-helper advice.
