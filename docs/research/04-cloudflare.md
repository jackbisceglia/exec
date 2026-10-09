# Cloudflare feasibility and execution boundaries

Verified 2026-10-08. Prefer Cloudflare where it meets the required semantics. The platform can host the personal-agent control plane and execution tools, but its services have different meanings of “durable.”

## What each primitive supplies

| Primitive                | Evidence                                                                                                                                    | Implication for exec                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Workers                  | Isolates, 128 MB memory; paid HTTP CPU defaults to 30 seconds, configurable to five minutes; six simultaneous outgoing connections/request  | Suitable for API/auth/routing; ordinary HTTP work is not an autonomous durable agent        |
| Durable Objects + SQLite | Stable object identity, persistent database, coordinated execution; paid per-object storage ceiling 10 GB; SQL row/string/blob ceiling 2 MB | Candidate owner for agent/task metadata; put large artifacts elsewhere                      |
| Agents `PiHarness`       | Pi storage and lifecycle wakeups, currently beta                                                                                            | Avoid implementing a new Pi scheduler before testing this adapter                           |
| Workflows                | Persisted steps, retries, sleeps, external-event waits                                                                                      | Candidate for bounded infrastructure/business jobs; not inherently the agent's memory store |
| Queues                   | At-least-once message delivery                                                                                                              | Events may arrive twice; keep deduplication keys                                            |
| Containers/Sandboxes     | Linux execution; new DO-controlled scheduling and disk snapshots are public beta                                                            | Shell/browser/package tools, with explicit workspace persistence                            |
| R2                       | Object storage with separate operations/storage pricing                                                                                     | Artifacts and long-term backup; not automatically a POSIX disk                              |

Sources: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/), [Pi](https://developers.cloudflare.com/agents/harnesses/pi/), [Workflow limits](https://developers.cloudflare.com/workflows/reference/limits/), [Queue delivery](https://developers.cloudflare.com/queues/reference/delivery-guarantees/), [Container policy](https://developers.cloudflare.com/containers/configuration/scheduling-policy/), [R2](https://developers.cloudflare.com/r2/pricing/).

**Inference:** a VM is not required for every agent identity. Agent memory and execution workspaces can have different lifetimes. Whether they should is a discussion decision, not settled here.

## Limits that affect the first implementation

- Workers HTTP wall time can continue while the client remains connected, but `waitUntil()` extends work only up to 30 seconds after response/disconnect. Do not use that as the background-work guarantee. CPU time excludes network waits. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).
- DO alarms have a 15-minute invocation wall limit; normal DO requests remain tied to live activity. Objects can restart, so in-memory timers and promises are not durable state. [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/).
- Paid Workflows document 10,000 steps by default, configurable to 25,000; ordinary step result size is 1 MiB, persisted instance state 1 GB, and completed-state retention 30 days. A workflow can span long periods, but a single instance is not an unlimited lifetime transcript. [Workflow limits](https://developers.cloudflare.com/workflows/reference/limits/).
- **Conflicting evidence:** the Workflows documentation source table inspected during research says 50,000 paid concurrent instances, while surrounding prose still says 10,000. Do not size to the larger figure without account confirmation. Sleeping/waiting instances are excluded. [Source file](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workflows/reference/limits.mdx).

Workflows explicitly advises idempotent calls because a step may repeat; side effects outside steps may also repeat. It cannot retroactively make an upstream API transactional. **Inference:** using Workflows plus Pi plus Executor workflows gives three recovery layers; select one owner for each retry and retain operation identity across boundaries. [Rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/).

## Current sandbox semantics: use the 1.0 generation

The new `durable_object` scheduling policy lets a DO choose image and instance size at startup. It differs from the `default` policy's application-wide rollouts. Cloudflare's older `Container` helper does not support this policy. Do not combine old `getSandbox`/sleep examples with new native snapshots without checking the migration guide. [Scheduling policy](https://developers.cloudflare.com/containers/configuration/scheduling-policy/), [Container class](https://developers.cloudflare.com/containers/api/container-class/), [1.0 migration](https://developers.cloudflare.com/sandbox/sdk/migrate/).

Published instance ceilings are four vCPUs, 12 GiB RAM, and 20 GB disk; predefined small instances exist below one vCPU. Current account limits list 1,500 concurrent vCPUs, 6 TiB memory, and 30 TB disk, subject to available capacity and account arrangements. A local test on a larger developer machine does not verify fit inside the deployed shape. [Container limits](https://developers.cloudflare.com/containers/platform/limits/).

The key semantic distinctions are documented in [sandbox lifetime](https://developers.cloudflare.com/sandbox/concepts/lifetime/):

1. The name and DO persist; a Linux instance can stop.
2. Instance stop discards memory, processes, and unsaved local disk changes.
3. A native snapshot carries the writable root filesystem into a new instance, not mounted filesystems or memory. The application controls save and restore.
4. Snapshots expire after 30 days without creation/restore activity. Use an independent durable backup for longer retention.

**Inference:** this can satisfy “the same workspace tomorrow” if the persistence contract is explicit. It cannot, by itself, promise “the same browser process resumes next month” or “every completed filesystem write survives arbitrary failure.” Define a recovery point objective for files separately from committed conversation state.

The inspected lifetime source says guest work alone does not keep the container active; background jobs need lifecycle activity such as alarms. Inactivity timeout can be up to six hours and needs to be re-established after DO restart. **Validation:** run a long, quiet command through the intended production adapter and verify it survives without a browser client keeping it alive. [Lifetime source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/sandbox/concepts/lifetime.mdx).

Bucket mounts have object-storage limitations for renames, locks, and permissions. Snapshot plus R2 backup is different from a persistent block volume. An R2-mounted SQLite database should not be assumed sound without explicit filesystem support and testing. [Files and persistence](https://developers.cloudflare.com/sandbox/files/).

## Browser and network

Cloudflare **Browser Run** (the browser-rendering URL redirects there) is another option for browser tools. Paid defaults currently list 200 concurrent browsers and three new instances/second. Inactivity is 60 seconds, extendable to ten minutes; active sessions have no fixed maximum, but platform rollouts can close them. This is not a permanent personal browser. [Browser Run limits](https://developers.cloudflare.com/browser-run/limits/).

**Options to test:** external browser sessions through Browser Run; or Chromium inside a Linux sandbox with an explicitly saved profile. Both need authentication handoff, stale-login recovery, and validation on the actual websites. A Linux runtime does not prove CAPTCHA, passkey, DRM, or account-login compatibility.

Cloudflare's sandbox security documentation says the sandbox is the smallest trust unit; Linux users inside it are not an adequate isolation boundary. Keep secrets outside, authenticate before deriving a sandbox name, and serve generated previews on a separate hostname. Internet is off by default in the described native Container API; outbound handlers can broker authenticated HTTPS. Turning unrestricted internet on can bypass handlers on other ports. [Sandbox security](https://developers.cloudflare.com/sandbox/concepts/security/).

## Placement and deployment implications

Container placement constraints include regional groups and `eu`, `us`, and `fedramp` jurisdictions. Some low-capacity groups cannot be selected alone. DO jurisdictions are separately configured; the DO location does not establish where its container, model calls, logs, or artifacts live. [Container placement](https://developers.cloudflare.com/containers/concepts/placement/), [DO data location](https://developers.cloudflare.com/durable-objects/reference/data-location/).

**Inference:** “all deployment on Cloudflare” is attainable as an exec application-hosting preference, while Executor Cloud and model APIs remain external dependencies. A stricter demand that self-host Executor also live there requires a separate feasibility test: the documented Docker/PGlite server expects durable local storage. Native sandbox snapshots are not automatically an appropriate database persistence strategy.

The pinned Executor v2 source does include a separate Cloudflare-hosted product using Alchemy and a shared Effect API. That is stronger evidence than Docker compatibility, but this research did not establish a supported user-operated Cloudflare deployment recipe, its complete dependencies, or its license coverage. Do not confuse upstream's cloud deployment with the documented Docker self-host distribution. [Executor v2 orientation](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/README.md).

Alchemy can remain the infrastructure tool chosen by the parallel scaffold task. This research did not validate that its current resources expose the new sandbox scheduling policy, snapshots, or Pi-specific bindings. Do not infer support from generic Workers deployment support.

## Feasibility verdict

**Promising, conditional:** Cloudflare agent state + Pi lifecycle + optional Cloudflare workspace is the first combination worth testing. An external VM becomes justified by a measured requirement: stronger automatic disk persistence, memory resume, capacity beyond current instance limits, browser behavior, or operational simplicity. Preserve Cloudflare for the application even if the workspace sits elsewhere.
