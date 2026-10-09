# Executor: integration boundary and verification gaps

Verified 2026-10-08. Current website docs describe **v2 apps**; the documented self-host image is `2.0.0-beta.11`. The release tag resolves to `2b589d319681665724f82959b046b1556119cfda`. Older repository descriptions emphasize OpenAPI/MCP/GraphQL proxying. Treat the release as a deliberate compatibility choice. [Self-host documentation](https://executor.sh/docs/run/self-host), [release source](https://github.com/UsefulSoftwareCo/executor/tree/2b589d319681665724f82959b046b1556119cfda).

## What Executor owns

**Evidence:** a provider defines authentication; an account holds one saved credential; a profile selects accounts for an app's requirements. Multiple work/personal accounts are supported. Provider definitions are not access grants. Signing into Executor is separate from connecting an upstream service. Browser-session-backed providers are listed as future work. [Providers and accounts](https://executor.sh/docs/concepts/providers-and-accounts).

Apps publish queries/mutations, and imported MCP/OpenAPI routers use upstream metadata. Approval decisions belong to individual operations; an app can add policies to imported routers. Local transactional rollback does not undo external effects. [Tools and approvals](https://executor.sh/docs/concepts/tools-and-approvals).

**Inference:** let Executor remain the integration/account system. exec still needs authenticated users, a binding to the correct Executor principal/organization, durable task state, and a user-facing approval flow. “All integrations through Executor” should describe routing, not claim that every service operation already exists.

## MCP contract to prototype

**Evidence:** hosted MCP is `https://mcp.executor.sh/mcp`, using streamable HTTP. Its compact surface is `skills`, `execute`, and, outside native elicitation mode, `resume`. `execute` runs JavaScript over discoverable app tools; it is not a general shell. The interpreter has no imports, filesystem, `process`, or `fetch`. Documented ceilings: 65,536 source characters, 100 tool calls, five minutes, 65,536 output bytes. Limits are cooperative. Scoped connections select profiles and all/read-only/explicit tools; all/read-only sets include future additions. [MCP endpoint](https://executor.sh/docs/mcp).

**Proposed adapter behavior:** faithfully preserve discovery results, structured errors, pending-input responses, and continuation identifiers. Avoid treating every MCP result as final text. Keep a batch small enough to diagnose partial success. Pin explicit tool choices for a tightly bounded unattended job, rather than assuming an evolving “read-only” list has been manually reviewed.

**Confirmed limitation:** pinned v2 docs explicitly say program continuation after an Executor server restart is not implemented. A lost session cannot continue; automatic re-execution is unsafe because prior calls may have taken effect. Do not mark a generic Executor execute tool replay-safe in Pi. [Pinned MCP documentation](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/apps/docs/content/mcp.md#what-is-coming-later).

The three elicitation modes are model-mediated `resume`, native form elicitation holding `execute` open, and browser approval with an `approvalUrl` followed by `resume({ requestId })`. Mode belongs to the grant. **Critical:** scoped-connection URLs do not narrow PATs or local server keys; those retain full access. Use the scoped OAuth grant, not a PAT plus a query parameter. [Pinned MCP contract](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/apps/docs/content/mcp.md).

App setup already runs with credentials before tool approval; approval is not a sandbox around untrusted app initialization. Declining one call does not undo earlier calls. [Pinned approval contract](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/apps/docs/content/concepts/tools-and-approvals.md).

## Authentication and permissions

| Boundary              | Verified behavior                                                                                                             | Implication for exec                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Executor login        | Establishes the human's identity, not upstream account access                                                                 | Avoid confusing sign-in with consent to access email/files                              |
| MCP OAuth             | Browser consent selects an organization; the grant remains bound to it                                                        | Persist the grant's organization explicitly                                             |
| Personal access token | Acts as the user with current permissions; organization-limited or full-account; no per-tool restrictions on the token itself | Useful for a private prototype, insufficient by itself for least-privilege agent access |
| Scoped connection     | Narrows tools and profiles                                                                                                    | Carry its identity into run and approval records                                        |
| App approval          | Rules still apply to token-authenticated calls                                                                                | Do not create a bypass by switching transports                                          |

Sources: [API keys](https://executor.sh/docs/api-keys), [organizations and access](https://executor.sh/docs/concepts/organizations-and-access), [MCP](https://executor.sh/docs/mcp).

Membership is revalidated, and managing an app is distinct from being allowed to use it. Each caller uses their own profile. PAT revocation blocks new requests, but running requests may complete. **Inference:** cancellation and revocation are separate events; the UI must not report a remote write as cancelled merely because exec stopped waiting. [Organization rules](https://executor.sh/docs/concepts/organizations-and-access), [token lifecycle](https://executor.sh/docs/api-keys).

## Deployability, license, and price

The documented self-host release is one Docker container with embedded PGlite, authentication, dashboard, MCP, and app runtime. `/app/data` stores durable data and generated keys; use one replica per volume and back up data plus encryption keys. It requires persistent storage. This packaging is not evidence that the full self-host server can run as an ordinary Cloudflare Worker. [Self-host](https://executor.sh/docs/run/self-host).

**License scope matters:** v1/current `main` has a root MIT license. The inspected v2 release tree has no root LICENSE; its CLI has MIT, while `packages/sdk/package.json` has no license field. Do not extrapolate the v1 root license or CLI license to every v2 server component. Clarify v2 distribution/embedding rights before copying or shipping the server. Calling its service is a different integration decision. [v1 license](https://github.com/UsefulSoftwareCo/executor/blob/9ef04e93e7280f389d048c13301dfb241cfde201/LICENSE), [v2 CLI license](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/apps/cli/LICENSE), [v2 SDK manifest](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/packages/sdk/package.json).

Published Cloud pricing: free for up to three members, Team at $15/member/month, Enterprise by arrangement. The pricing page advertises unlimited integrations, not unlimited third-party API calls, hosted compute, or model spend. Embedded/resold service terms and fair-use capacity for exec were not verified. [Pricing](https://executor.sh/pricing).

## Boundary tests before adopting v2

These are **proposed experiments**, not completed tests:

1. Connect two accounts of the same provider; prove discovery and execution select the intended profile after reconnect.
2. Use a scoped connection and verify that a denied tool fails when called directly, not merely when discovered.
3. Suspend an operation for approval; disconnect all clients, restart exec, then resume from persisted state. Separately restart self-host Executor.
4. Drop the response after a test service accepts a write. Determine whether Executor exposes a durable execution/operation ID that can be queried without repeating the action.
5. Revoke the grant while an approval is pending; verify no stale permission is restored by reconnecting or refreshing tokens.
6. Upgrade a test app while a run is paused. Record whether its tool definition and approval semantics are bound to the old deployment or re-resolved.
7. Exercise upstream rate limits and token expiry. Ensure retry ownership is explicit across Executor, exec, and Pi.

## Blocking unknowns

Server-restart loss of MCP continuations is a **known gap**. Retention without restart, concurrent-resume behavior, chosen-client elicitation compatibility, programmatic scoped-connection management, complete v2 licensing, and hosted multi-tenant embedding terms remain unverified. The v2 README also says the remote `createRemoteExecutor` SDK facade is not implemented; prefer the documented MCP boundary over assuming a complete remote SDK. [Pinned release README](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/README.md). Do not build full auth or billing until the integration spike establishes the relevant contract.
