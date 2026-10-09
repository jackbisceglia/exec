# Exec

Exec is an open-source personal AI assistant: the personal agent layer on top of
[Executor](https://executor.sh/). This repository currently contains a minimal
pnpm scaffold with a Solid frontend, an Effect HTTP API, and Alchemy v2
infrastructure definitions for Cloudflare.

A possible pi-based runtime with durability and a per-agent VM solution are
research candidates, not implemented features or settled architecture. The
scaffold contains only a neutral frontend and health API. Agent execution,
persistence, authentication, and product-specific contracts await the research
discussion. `exec` is the working name; no custom domain is configured.

## Research and design

Start with the [research pack](docs/research/README.md) for the product landscape,
Executor integration, Pi Durable, Cloudflare hosting, VM persistence and costs,
and open architecture decisions. The notes separate inspected evidence from
proposed validation work; no runtime architecture has been selected.

The [mascot assets and usage guide](design/mascot/README.md) include SVG and PNG
variants, icons, and a [visual contact sheet](design/mascot/contact-sheet.png).
Open `design/mascot/contact-sheet.html` locally for the interactive presentation.

## Setup and local development

Use Node 24.18.0 or later and pnpm 10.33.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Install builds the pinned, vendored Solid Yield runtime and its declarations.
The frontend runs at <http://127.0.0.1:3000>. The API runs at
<http://127.0.0.1:3001/api/health> and returns `{"status":"ok"}`. Its local server
uses Effect's `NodeHttpServer` and scoped `NodeRuntime` shutdown, providing the
normal HTTP transport and request-body support without a custom bridge.

`pnpm dev` builds core, then starts both packages. Core changes require a rebuild;
API source changes restart its Node watcher, and frontend changes use Vite HMR.
Use `pnpm dev:api` or `pnpm dev:web` to run a surface independently after core has
been built. Local development does not require Cloudflare credentials.

## Package and infrastructure boundaries

- `packages/core/src/index.ts` exports shared API contracts. The health response
  uses an Effect Schema, and `contracts/api.ts` declares the HTTP endpoint. Core
  imports no Alchemy or Cloudflare code.
- `packages/api/src/index.ts` exports `HttpApiLayer` and `createHandler`, a
  portable Web Request adapter with an explicit `dispose` lifecycle. That
  JSON-only adapter uses Effect's Web platform services and no filesystem.
  HTTP handlers implement the shared contract without deployment configuration.
- `infra/api.ts` defines the named Alchemy Worker and its deployment props.
  `packages/api/src/worker.ts` is the thin implementation: it supplies Alchemy's
  Cloudflare HTTP platform and turns the API layer into a fetch effect. The
  same layer runs under the Effect Node server during local development.
- `packages/web/src/index.ts` exports the portable Solid Yield `App`.
  `main.tsx` owns browser mounting. `infra/web.ts` defines an Alchemy `StaticSite`
  that builds Vite assets and points to `packages/web/src/worker.ts`. That thin
  Cloudflare wrapper forwards requests to its typed `ASSETS` binding. No SSR
  runtime is introduced.
- `alchemy.run.ts` assembles the API implementation and web resource, uses
  Cloudflare providers and remote state, and exposes their URLs. Infrastructure
  depends on contracts and implementations; contracts do not depend on
  infrastructure.

Alchemy's `Website.Vite` normally owns the server entry and can emit an
assets-only Worker for an SPA. `StaticSite` supports an explicit `main` beside a
build command, so it is used here to honor the web `index.ts` / `worker.ts`
boundary. `runWorkerFirst` makes asset forwarding pass through that wrapper.
Root infrastructure owns this deployment choice; the portable frontend needs
only Vite and the Solid plugins.

Core and API build JavaScript and declarations with the native TypeScript
compiler (`tsgo`). Their package exports use source types and compiled runtime
entries. Web exports its source component for bundler consumers and builds
browser assets with Vite. Root infrastructure and all package sources are
checked with `tsgo`, including both Cloudflare wrappers. The web Worker uses a
separate compiler configuration with Cloudflare ambient types, while the portable
frontend uses browser types. Its lint command checks both configurations.

## Checks

```sh
pnpm build
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:oxlint
```

`pnpm check` runs the first five commands. Build, typecheck, lint, and format
commands delegate to the three application packages; root checks also cover
infrastructure and configuration. Build rebuilds Solid Yield first.
`pnpm format` writes formatting and excludes generated output and third-party
source. The application tests exercise real Web Requests against the health
contract and unknown-path 404, and mount the actual generator frontend through
its Solid Yield and Solid Vite plugins in a DOM environment.

`test:oxlint` runs 422 inherited plugin cases. GitHub Actions installs the frozen
lockfile and runs both `check` and the plugin suite, without deploying. The
workflow uses release-pinned checkout, pnpm setup, and Node setup actions.

Oxlint's explicit strict rules and actual vendored antislop tooling are adapted
from [dotheyplaytoday](https://github.com/jackbisceglia/dotheyplaytoday/tree/a9301b6c4c944dc070fccf012b9c2a6f5edbbd4d).
Vendored rules, fixtures, and third-party licenses remain under
`tooling/oxlint/anti-slop`; that directory's `UPSTREAM.md` describes provenance
and local adaptations. Source declarations allow both interfaces and object
type aliases as required by Schema and Alchemy's API constraints. No application
lint suppressions or unchecked type assertions are used.

## Versions and Solid Yield

The lockfile pins Alchemy 2.0.0-beta.81, Effect and its Node platform 4.0.2,
Solid and its web/h packages 2.0.0-rc.14, the Solid Vite plugin 3.0.0-next.48,
Vite 8.3.4, native TypeScript preview 7.0.0-dev.20260707.2, Oxlint and its plugin
adapter 1.87.0, oxlint-tsgolint 7.0.2003, Prettier 3.9.9, and Vitest 5.0.3.
Alchemy and Solid remain prereleases; dependency versions and vendored source
are pinned for reproducible evaluation.

[solid-yield](https://github.com/devagrawal09/solid-yield/tree/9fdcf82bff01385372612c60a0d29c25b8ac9ff3)
is unpublished on npm and requires Solid 2 RC peers. Its actual runtime and Vite
plugin are therefore vendored at that revision as private workspace packages
under `tooling/solid-yield`, with their MIT licenses and NOTICE files. The
runtime's original JavaScript build script and plugin source are unchanged;
`tsgo` emits declarations. Root postinstall builds these artifacts from source.
See `tooling/solid-yield/UPSTREAM.md` for the exact manifest/configuration changes.

The Vite pipeline runs `solidYield()` before Solid's JSX compiler.
`packages/web/src/app.tsx` contains a real generator component, a `$signal`, and
`yield*` inside JSX. The rendering smoke test verifies that this source compiles
and mounts; no substitute generator runtime is used.

## Cloudflare deployment

The stack is defined and typechecked. No cloud resources have been created.
Worker compatibility is pinned to 2026-09-18, matching the installed local
workerd release. Alchemy's cloud development command can provision resources
and is separate from the normal local workflow:

```sh
pnpm dev:cloudflare
```

When deployment is approved, configure an Alchemy credential profile using
`pnpm exec alchemy profile edit`, then run `pnpm deploy`. Alchemy manages the
Cloudflare state store, bundles the API wrapper, builds Vite assets through the
web resource, and bundles its asset wrapper. `pnpm deploy` first builds and
typechecks the application packages. No custom domain is configured;
the stack exposes its generated Worker URLs. The current frontend makes no
cross-origin API requests, so no speculative CORS policy is configured.

The implementation follows the official [Worker](https://alchemy.run/cloudflare/compute/workers/)
[Vite](https://alchemy.run/cloudflare/frontend/vite/), and
[StaticSite](https://alchemy.run/cloudflare/frontend/static-site/) documentation
and verifies APIs against installed Alchemy source. Repository
initialization and publication are coordinated separately from this scaffold.
