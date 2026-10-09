# Vendored Solid Yield

Source: https://github.com/devagrawal09/solid-yield
Revision: `9fdcf82bff01385372612c60a0d29c25b8ac9ff3`

The actual `packages/yield` runtime source, JSX declarations, build scripts,
MIT license, and NOTICE, and `packages/vite-plugin-yield` source and license
are copied from that revision. The root MIT license and NOTICE are retained.
No substitute runtime or JSX transform is implemented here.

Local manifests make these unpublished packages private pnpm workspace
packages, pin the Solid peers and esbuild, and omit unrelated upstream test/dev
packages. The runtime keeps its original export-condition matrix. Its original
JavaScript build script runs unchanged; native TypeScript (`tsgo`) emits the
runtime declarations using a standalone configuration equivalent to the
upstream build configuration. Generated dist files are ignored and rebuilt at
root postinstall and before application builds. The checked-in upstream JSX
source declarations are retained. Runtime and plugin source is unmodified.

Solid and its web/h packages are pinned to 2.0.0-rc.14; the Solid Vite plugin is
pinned to 3.0.0-next.48. All transitive dependencies are pinned in the root lockfile.
The application Vite pipeline runs Solid Yield's real plugin before Solid's JSX
compiler. `packages/web/src/app.tsx` contains an actual generator component and
a reactive read inside JSX, exercising this transform in development and
production builds.

Third-party runtime/plugin source preserves upstream formatting and is excluded
from application antislop lint and Prettier. Updating it requires reviewing the
upstream diff, preserving notices, and verifying the build, native typecheck,
and browser rendering of the generator component.
