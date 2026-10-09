# Evidence ledger and verification gaps

Research cutoff: **2026-10-08, America/New_York**. Sources were read live during the task; UTC repository timestamps can fall on October 9. Dynamic documentation may change after this pack. No vendor account was used to validate its claims.

## Identity and inspected revisions

| Item                     | Observation                                                                                                           | Primary evidence                                                                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Intended Pi              | User explicitly supplied Earendil's October 1 post                                                                    | [Announcement](https://earendil.com/posts/pi-durable/)                                                                                                                                                 |
| Pi source                | `6fb2e7815167e6b19006fc526d1a5d0f5f998787`, commit timestamp `2026-10-08T15:26:34Z`                                   | [Commit](https://github.com/earendil-works/pi/commit/6fb2e7815167e6b19006fc526d1a5d0f5f998787)                                                                                                         |
| Pi package               | npm latest 1.1.0; matching inspected package manifest                                                                 | [Manifest](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/package.json), [registry](https://registry.npmjs.org/@earendil-works/pi-durable/latest) |
| Cloudflare Agents source | `b65956e8a40501fc241c223aba0d6177077268d1`, timestamp `2026-10-09T01:52:56Z`                                          | [Commit](https://github.com/cloudflare/agents/commit/b65956e8a40501fc241c223aba0d6177077268d1)                                                                                                         |
| Agents published package | npm latest 0.27.0; Pi optional peers `^1.0.0`                                                                         | [Registry](https://registry.npmjs.org/agents/latest)                                                                                                                                                   |
| Executor older main      | `9ef04e93e7280f389d048c13301dfb241cfde201`, timestamp `2026-10-09T00:57:37Z`                                          | [Commit](https://github.com/UsefulSoftwareCo/executor/commit/9ef04e93e7280f389d048c13301dfb241cfde201)                                                                                                 |
| Executor v2 beta         | Tag `executor@2.0.0-beta.11` resolves to `2b589d319681665724f82959b046b1556119cfda`, timestamp `2026-10-08T23:31:31Z` | [Release tree](https://github.com/UsefulSoftwareCo/executor/tree/2b589d319681665724f82959b046b1556119cfda)                                                                                             |
| Daytona source status    | Current README says core private since June 2026; legacy license inspected at v0.190.0                                | [Notice](https://github.com/daytonaio/daytona), [old license](https://github.com/daytonaio/daytona/blob/v0.190.0/LICENSE)                                                                              |

The Agents source commit and published npm version were observed independently; no claim is made that the npm tarball is byte-for-byte that source commit. A real compatibility spike should inspect its installed code and pin the artifact.

## Decisive code inspections

- Pi `src/harness/tool.ts`: committed tool intent, unsafe default, saved/current replay safety check, interrupted partial outcome. [Source](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/src/harness/tool.ts).
- Pi recovery test names/cases: replay-policy combinations, deselection, pre-intent interruption, bash close/reopen. **Read only; not run.** [Tests](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/test/harness-tools-recovery.test.ts).
- Pi Cloudflare SQLite adapter: queueing and storage transaction delegation. [Source](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/src/storage/sqlite/cloudflare.ts).
- Agents Pi harness: lifecycle wake scheduling, heartbeat, alarm budget, and `pi.resume()`. [Source](https://github.com/cloudflare/agents/blob/b65956e8a40501fc241c223aba0d6177077268d1/packages/agents/src/harness/pi/harness.ts).
- Executor v2 MCP docs: grant-bound elicitation mode, PAT scope exception, and explicit lack of continuation after server restart. [Pinned contract](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/apps/docs/content/mcp.md).
- Executor v2 approval docs: app initialization precedes operation approval, cancellation does not undo prior calls. [Pinned contract](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/apps/docs/content/concepts/tools-and-approvals.md).
- Executor v2 tree/license inventory: no root LICENSE in inspected recursive tree; CLI MIT; SDK manifest does not name a license. This is a coverage question, not a conclusion that no permission can exist elsewhere. [Tree](https://github.com/UsefulSoftwareCo/executor/tree/2b589d319681665724f82959b046b1556119cfda).

## Changed or conflicting evidence

| Topic                      | Evidence conflict/change                                                                                           | Treatment                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Pi Cloudflare support      | Older commentary says Node-only adapters; current upstream exports a DO adapter and Cloudflare documents PiHarness | Use current pinned source; keep beta status explicit                                 |
| Executor generations       | Main/older docs versus distinct v2 tree; v2 self-host source warns `latest` image is v1 and v2 needs a new volume  | Pin v2 deliberately; do not present an in-place migration                            |
| Executor durability        | Persistent accounts/apps do not imply persistent MCP interpreter continuation                                      | Record server-restart continuation loss as known                                     |
| Cloudflare sandbox storage | 0.x directory backups coexist in search results with new native snapshots/1.0 docs                                 | Prefer 1.0 for new evaluation; do not combine APIs                                   |
| Workflows concurrency      | Source table says 50,000 paid; adjacent prose says 10,000                                                          | Flag, verify account quota before sizing                                             |
| DO free storage            | Rendered page describes 1 GB/object free; inspected source general table differs                                   | Report paid 10 GB for planning; confirm free plan separately                         |
| E2B default size           | Pricing page labels 2 CPU/4 GiB default; billing FAQ mentions 2 CPU/512 MiB                                        | Cost an explicit size, not the word “default”                                        |
| E2B memory persistence     | New pause-error and fallback behavior rolling out by region                                                        | Test selected region; do not promise unconditional memory retention                  |
| Daytona openness           | Legacy open-source descriptions remain in current README below private-core notice                                 | Give precedence to explicit notice and component licenses                            |
| Sprites filesystem         | Homepage describes a new backend as early access; lifecycle docs broadly describe ext4-backed persistence          | Persistent-files contract useful; exact backend/default migration needs confirmation |

Sources for non-pinned rows: [Cloudflare migration](https://developers.cloudflare.com/sandbox/sdk/migrate/), [Workflow source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workflows/reference/limits.mdx), [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/), [E2B pricing](https://e2b.dev/pricing), [billing](https://docs.e2b.dev/billing), [pause](https://docs.e2b.dev/sandbox/persistence), [Sprites product](https://fly.io/sprites/), [lifecycle](https://docs.fly.io/sprites/concepts/lifecycle).

## Remaining verification queue

| Priority | Gap                                                            | How to close it                                                                      |
| -------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| P0       | Executor v2 server/framework license coverage                  | Upstream clarification tied to a release; inspect package/image distribution notices |
| P0       | Required behavior after Executor loses a continuation          | Small fault-injection integration test; document manual/reconciliation boundary      |
| P0       | Pi/Agents published-version runtime compatibility              | Real Cloudflare deploy/eviction test with fake model and controlled tools            |
| P0       | Meaning of per-agent VM and self-host                          | Product decision using concrete persistence scenarios                                |
| P1       | Native snapshot billing, expiration/recovery, file loss window | Current provider confirmation plus measured workspace experiment                     |
| P1       | Scoped OAuth onboarding and refresh/revocation                 | Exercise selected MCP library and two account profiles                               |
| P1       | Cost model and region guarantees                               | Measured calls/awake time/storage plus target-account quota/rate check               |
| P1       | Sprites regions, browser behavior, cold-start persistence      | Provider documentation/confirmation and workload test                                |
| P1       | Daytona free-disk scope and chosen VM availability             | Confirm target account/class/region and inspect actual bill                          |
| P1       | Hosted Executor embedding/tenant/commercial terms              | Provider confirmation before public multi-user rollout                               |
| P2       | Alchemy exposure of latest Cloudflare primitives               | Read selected Alchemy version and run deployment spike                               |
| P2       | Full dependency license/SBOM and portability                   | Review after actual dependencies and distribution shape are chosen                   |

## What this research did and did not verify

Primary product/docs pages were opened, upstream source and license files fetched, npm metadata read, and quoted release identities resolved through GitHub's read-only API. No Git commands were used. Failed or blocked website fetches were retried via primary source repositories where useful. Third-party search summaries were discovery leads only.

No end-to-end execution, provider deployment, latency benchmark, security test, OAuth consent, upstream API write, billing measurement, interview, or export/restore test was performed. Numeric cost scenarios are arithmetic over stated rates and explicit assumptions. No full architecture, model selection, auth system, or billing system is settled by this pack.

Artifact checks: all local Markdown links resolve; scenario arithmetic was independently recalculated for 10, 60, and 720 awake hours and the Daytona fleet allowance range. These checks validate the documents, not vendor behavior.

Before implementation, refresh volatile sources, choose pinned versions, and save the outputs of the validation slices alongside these notes. A successful happy-path demo alone should not close a recovery or permission question.
