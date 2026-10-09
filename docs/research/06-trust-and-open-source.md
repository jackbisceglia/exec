# Trust, security, open source, and self-hosting

Verified 2026-10-08. This is a technical boundary review and license inventory, not a full security assessment or a legal opinion about a future distribution.

## Distinguish the trusted components

**Proposed boundary:** user authentication and ownership checks → trusted application policy → durable task/approval state → Executor or execution sandbox → upstream service. Model output, tool output, third-party pages, app skills, dependencies, and generated code are inputs with different authority; none should be able to rewrite the trusted policy merely by saying so.

Cloudflare states that sandbox code can access what is placed inside the sandbox, and that using a different Linux user does not establish isolation in its deployed containers. Executor's v2 approval docs separately state that app initialization runs with credentials before operation approval. These observations make review of what enters each boundary decisive. [Cloudflare security](https://developers.cloudflare.com/sandbox/concepts/security/), [Executor approval source](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/apps/docs/content/concepts/tools-and-approvals.md).

## Threats and concrete controls to validate

The controls below are **proposals**, not features already present in exec.

| Failure or attack                                              | Proposed control                                                                                        | Evidence of success                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Retrieved document instructs the agent to upload private files | Treat retrieved instructions as untrusted; authorize outbound destinations and operations independently | Malicious fixture produces no unauthorized side effect               |
| Wrong work/personal account                                    | Stable tenant/account/profile binding, shown in action review                                           | Similar account names cannot change the selected principal           |
| An approval is reused for changed arguments                    | Approval binds principal, operation, normalized arguments, target, expiry, and policy version           | Modified recipient/body/amount invalidates approval                  |
| Crash after external write                                     | Stable operation key, durable receipt, explicit unknown outcome and reconciliation                      | Injected lost response causes no duplicate write                     |
| Agent loops on tool errors                                     | Hard token/time/tool-call ceilings; visible stop; one retry owner                                       | Run stops within a measured maximum overrun                          |
| Dependency reads secrets                                       | Keep provider/admin keys out of files, environment, argv and images; broker narrowly                    | Malicious dependency cannot read the key or use unauthorized targets |
| Generated preview attacks exec's browser session               | Separate preview origin, restrictive embedding, authenticated access                                    | Preview cannot read exec cookies or exercise its authority           |
| Old snapshot restores revoked credentials                      | Keep authority outside snapshots; rotate/recheck at use; remove saved sessions on revocation            | Restoring old files does not restore old grants                      |
| Deleted user data returns from backup                          | Defined backup expiry and restoration filtering                                                         | Export/delete/restore test respects the deletion contract            |
| A shared workspace leaks one person's data                     | Derive provider resource IDs from authenticated ownership, validate every access                        | Cross-tenant requests and guessed IDs fail                           |

## Permissions are not only approval dialogs

Executor scoped connections narrow tools/profiles when using their OAuth grants; PATs are not narrowed by the connection query string. Tool metadata and skill text are not authorization. A blanket “reads only” description in an account label does not enforce anything. [Pinned MCP contract](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/apps/docs/content/mcp.md), [account concepts](https://executor.sh/docs/concepts/providers-and-accounts).

**Inference:** separate four questions: may the agent discover this operation, may it execute it, does it need a human decision now, and is it safe to repeat? A user approving a send does not make retries idempotent. A sandbox stopping does not retract a send. A workflow completing does not prove the intended recipient received it.

Use explicit lifecycle states in the product: queued, running, waiting for a person, recovering, blocked, unknown external outcome, completed, and stop requested/stopped. These are proposed user-visible meanings; adapt them to the actual upstream contracts rather than promising more than they provide.

## Secrets and browser state

E2B documents injecting stored secrets into matching HTTPS requests outside the sandbox. Daytona documents placeholder substitution in HTTPS headers and response scrubbing, with explicit host allowlists. Sprites has brokered connectors and independent egress policy. These features reduce plaintext exposure but do not stop code from exercising whatever authority the allowed credential grants. [E2B secrets](https://docs.e2b.dev/secrets), [Daytona secrets](https://www.daytona.io/docs/en/secrets/), [Sprites networking](https://docs.fly.io/sprites/concepts/networking).

**Inference:** keep the Executor grant in the trusted runtime whenever possible. If a sandbox needs access, expose a narrow operation broker; do not place an organization-wide Executor PAT or VM-provider management key in its environment. Browser cookies and refresh tokens are credentials too. Encrypting a snapshot at rest does not make those values inaccessible to code after restore.

Audit records should capture who requested an action, the target account, the policy decision, external operation ID, outcome, and recovery history, while avoiding secret values and unnecessary message bodies. Explain what is sent to the model provider and what persists in backups. No claim of GDPR/HIPAA compliance follows merely from selecting a region or a vendor with an audit report.

## License and maintenance inventory

| Component                          | Inspected evidence                                                                        | Consequence for the open-source promise                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Pi Durable / Pi                    | MIT at inspected commit; package experimental                                             | Permissive foundation; retain notices and budget upgrade testing                                 |
| Cloudflare Agents SDK              | MIT                                                                                       | Open SDK does not make Cloudflare's managed DO/Containers service self-hostable as an equivalent |
| Executor v1 `main`                 | Root MIT                                                                                  | Does not establish licensing of the distinct v2 release tree                                     |
| Executor v2 beta.11                | CLI LICENSE/manifest MIT; no root LICENSE found; SDK manifest has no license field        | Resolve server/framework license scope before redistribution or embedding                        |
| E2B runtime                        | Apache-2.0; public backend source and embedding/self-host docs                            | Stronger evidence of a self-host path; operational parity still untested                         |
| Daytona current core               | Primary repository says development moved private in June 2026                            | Hosted feature set cannot be assumed reproducible from current public source                     |
| Daytona old core / current clients | v0.190.0 core AGPL-3.0; current clients: CLI AGPL-3.0, other content generally Apache-2.0 | Name exact component/version; do not call all Daytona code uniformly Apache or MIT               |
| Sprites hosted backend             | No complete supported self-host backend established by this research                      | Treat as an external managed service; do not infer openness from client SDKs                     |

Sources: [Pi license](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/LICENSE), [Agents license](https://github.com/cloudflare/agents/blob/b65956e8a40501fc241c223aba0d6177077268d1/LICENSE), [Executor v1 license](https://github.com/UsefulSoftwareCo/executor/blob/9ef04e93e7280f389d048c13301dfb241cfde201/LICENSE), [v2 CLI license](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/apps/cli/LICENSE), [v2 tree](https://github.com/UsefulSoftwareCo/executor/tree/2b589d319681665724f82959b046b1556119cfda), [E2B runtime](https://github.com/e2b-dev/infra), [E2B license](https://github.com/e2b-dev/infra/blob/main/LICENSE), [Daytona notice](https://github.com/daytonaio/daytona), [legacy license](https://github.com/daytonaio/daytona/blob/v0.190.0/LICENSE), [clients license](https://github.com/daytona/clients/blob/main/LICENSE).

This inventory does not inspect every transitive dependency, container package, font, model, or generated asset. Perform that narrower distribution review once the chosen dependency set exists.

## Self-hosting has several meanings

| Promise                       | What must be possible                                                                  | Research status                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Open exec source              | Inspect/modify/build the application                                                   | A licensing/product commitment still to choose                                   |
| Bring your Cloudflare account | Deploy exec under the user's account and keys                                          | Plausible; deployment spike required                                             |
| Bring your Executor           | Point to local/self-host MCP                                                           | Documented upstream endpoint model; network/OAuth/recovery must be tested        |
| Bring your execution provider | Replace Cloudflare workspace with another provider                                     | Requires a capability-aware execution adapter, not a pretend identical interface |
| Fully independent self-host   | Run state, integrations, compute, secrets, and backups without managed vendor backends | Not established by selecting Cloudflare plus open SDKs                           |
| Offline operation             | No external model/API dependencies                                                     | Not part of the currently verified proposal                                      |

E2B explicitly distinguishes BYOC, which it manages in your cloud, from operating the open runtime yourself. This distinction also helps describe exec accurately. [E2B BYOC](https://docs.e2b.dev/byoc).

**Proposal:** publish a dependency map and a tested deployment matrix instead of one ambiguous “self-hostable” badge. Start with a truthful, narrow promise, including what data can be exported and what credentials must be reconnected on migration.
