# VM and sandbox comparison, with workload costs

Verified 2026-10-08. Small shortlist: Cloudflare first, then **Sprites**, **E2B**, and **Daytona** for distinct persistence requirements. No provider was provisioned or benchmarked.

## Define the promise before choosing the vendor

- **Agent identity:** durable application ID, ownership, permissions, memory, task state.
- **Computer identity:** a persistent provider resource that can be addressed again.
- **Filesystem persistence:** files survive idle, stop, and a defined class of failure.
- **Memory hibernation:** running process memory resumes, rather than a program restarting from disk.
- **Always-on process:** keeps executing while the user is absent; not the same as a sleeping resource that can wake.

No VM retains its physical host forever. For this discussion, “a true persistent per-agent VM” means a stable logical computer with automatic durable disk and specified restart semantics, not a guarantee of immortal hardware. Ephemeral instances reconstructed from snapshots can serve many of the same jobs but have different loss windows.

## Persistence and operations matrix

| Candidate                     | Identity/files                                                                                 | Sleep and processes                                                                                                      | Relevant boundary                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| **Cloudflare native sandbox** | Stable DO/name; local disk ephemeral; app-managed disk snapshots; R2 for independent retention | Restore starts a new instance/entrypoint; no saved memory                                                                | Snapshot max 20 GB, expires 30 days after create/restore; public beta                         |
| **Fly Sprites**               | Stable named computer; durable POSIX filesystem, 100 GB capacity, usage-based storage          | Warm pause freezes memory; cold transition discards it; cannot rely on warm-only behavior; services restart on cold boot | Automatic disk persistence is a closer fit for “my computer”; memory is not a durable promise |
| **E2B**                       | Stable sandbox ID across pause/resume; pause preserves filesystem and, by default, memory      | Paused retention documented as unlimited; configure timeout to pause because default is kill                             | Hobby one-hour continuous runtime; Pro 24 hours; pause/resume resets continuous runtime       |
| **Daytona**                   | Stable sandbox; persistent local workspace; distinct container and Linux VM classes            | Linux VM pause saves memory; stop preserves disk; container archive has different semantics                              | Must choose the class explicitly; do not generalize VM pause to containers                    |

Sources: [Cloudflare lifetime](https://developers.cloudflare.com/sandbox/concepts/lifetime/), [snapshot/instance limits](https://developers.cloudflare.com/containers/platform/limits/), [Sprites lifecycle](https://docs.fly.io/sprites/concepts/lifecycle), [E2B persistence](https://docs.e2b.dev/sandbox/persistence), [E2B billing/limits](https://docs.e2b.dev/billing), [Daytona lifecycle](https://www.daytona.io/docs/en/sandboxes/).

**E2B nuance:** documentation describes a rolling change where a memory pause can return 503 while a prior snapshot finishes. Auto-pause can eventually fall back to filesystem-only state under that backlog. Memory resume still needs fault handling and is not equivalent to uninterrupted remote TCP sessions. [Pause behavior](https://docs.e2b.dev/sandbox/persistence).

**Sprites nuance:** checkpoints rewind disk; they do not restore processes. Warm wake and cold wake differ, so applications should tolerate cold starts. Do not interpret a low advertised wake time as an uptime or recovery guarantee. [Checkpoints](https://docs.fly.io/sprites/concepts/checkpoints).

## Browser, egress, secrets, and region constraints

| Candidate  | Browser path                                                                                | Network/secrets                                                                                            | Regions and unresolved limits                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare | Browser Run service, or browser installed in Linux image                                    | Native outbound interception; secrets can remain in Worker; keep internet disabled when enforcing a broker | Regional/jurisdiction constraints exist; separately constrain DO, container, R2 and logs                                  |
| Sprites    | Linux browser installation is plausible; no browser workflow was tested                     | Domain egress policy, private URL by default, brokered connectors; default egress unrestricted             | Exact available regions and binding residency guarantee not established in inspected sources; blocker for strict locality |
| E2B        | Linux sandbox; docs also show Kernel browser integration, which introduces another provider | Allow/deny network rules; secret injection outside sandbox; project-scoped management key                  | EU shared cluster requires Pro+ and support enablement; self-serve plan concurrency/runtime limits apply                  |
| Daytona    | Documented computer-use/desktop APIs                                                        | HTTPS-header secret substitution with host allowlist and response scrubbing; environment holds placeholder | Shared `us`/`eu`, dedicated/custom regions; account quotas and sandbox-class availability need confirmation               |

Sources: [Cloudflare security](https://developers.cloudflare.com/sandbox/concepts/security/), [placement](https://developers.cloudflare.com/containers/concepts/placement/), [Sprites networking](https://docs.fly.io/sprites/concepts/networking), [E2B network](https://docs.e2b.dev/network/internet-access), [E2B secrets](https://docs.e2b.dev/secrets), [EU access](https://docs.e2b.dev/faq/eu-region), [E2B browser](https://docs.e2b.dev/use-cases/remote-browser), [Daytona secrets](https://www.daytona.io/docs/en/secrets/), [computer use](https://www.daytona.io/docs/en/computer-use/), [regions](https://www.daytona.io/docs/regions/).

**Inference:** these secret brokers can complement Executor for necessary infrastructure access, but creating duplicate end-user integration systems would weaken the intended product boundary. A token-free sandbox can still abuse allowed APIs; credential concealment is not authorization.

Daytona volumes are S3-backed FUSE mounts, not block storage; docs explicitly exclude database tables and note slower operations. They are currently included without an additional fee, with an organization volume-count limit. This should not be confused with local sandbox disk persistence. [Volumes](https://www.daytona.io/docs/en/volumes/).

## Published rates

Rates observed at research time; credits, discounts, tax, and negotiated terms excluded.

| Provider   | Compute pricing                                                                  | Storage/idle pricing                                                                                                | Shared floor                                                         |
| ---------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Cloudflare | $0.072 per **used** vCPU-hour; $0.009 per **provisioned** GiB-hour while running | $0.000252 per provisioned disk GB-hour while running; separate R2/DO/egress                                         | Workers Paid $5/month with included Container allocations            |
| Sprites    | $0.0385 per used CPU-hour; $0.021875 per actual memory GB-hour                   | Hot $0.000683/GB-hour; cold $0.000027/GB-hour                                                                       | Metered usage; do not infer a per-Sprite monthly fee                 |
| E2B        | $0.0504 per allocated vCPU-hour; $0.0162 per allocated GiB-hour                  | Published plan disk 10 GiB Hobby / 20 GiB Pro included; billing docs say paused compute billing stops               | Hobby $0; Pro $150/month plus usage                                  |
| Daytona    | $0.0504 per reserved vCPU-hour; $0.0162 per reserved GiB-hour                    | $0.000108 per disk GiB-hour after first five free; stopped/paused retain disk billing; archived containers unbilled | PAYG figures used; account eligibility/commitments need confirmation |

Sources: [Cloudflare pricing](https://developers.cloudflare.com/containers/platform/pricing/), [Sprites pricing](https://fly.io/sprites/#pricing), [E2B pricing](https://e2b.dev/pricing), [E2B billing](https://docs.e2b.dev/billing), [Daytona rates](https://www.daytona.io/), [Daytona state billing](https://www.daytona.io/docs/billing).

Cloudflare includes 25 GiB-hours memory, 375 vCPU-minutes, and 200 GB-hours disk per month in the shared paid plan. Its CPU meter differs from E2B/Daytona reserved CPU, making headline CPU rates misleading. Cloudflare also bills Workers, controlling DOs, optional logs, and regional egress. Native snapshot-storage pricing was **not conclusively established**; do not budget it as permanently free. [Container pricing](https://developers.cloudflare.com/containers/platform/pricing/).

## Explicit planning scenarios

**Assumptions, not benchmarks:** 30-day/720-hour month; one continuing workspace; five GiB of retained user files. Activity scenarios: light assistant 10 awake hours/month, frequent work 60, and continuous 720. No GPU. A task may spend much of its time waiting on model/API calls.

Sizes differ because offerings differ:

- Cloudflare `standard-1`: 0.5 vCPU maximum, 4 GiB reserved RAM, 8 GB reserved disk; assume **0.1 average used vCPU** while awake.
- Sprites: assume **0.1 used CPU**, **2 GB actual memory**, five GB hot storage while awake and five GB cold storage for the month. Both storage meters are included as a conservative stated scenario; confirm actual tier accounting.
- E2B: explicitly budget **2 vCPU / 4 GiB**; do not rely on contradictory “default size” descriptions.
- Daytona: explicitly budget **1 vCPU / 4 GiB / 10 GiB disk**, with five GiB chargeable disk retained all month. The advertised free-disk allocation's scope must be confirmed before fleet budgeting.

| Scenario        | Cloudflare execution only | Sprites assumed usage | E2B execution only | Daytona compute + retained disk |
| --------------- | ------------------------: | --------------------: | -----------------: | ------------------------------: |
| 10 awake hours  |                     $0.45 |                 $0.61 |              $1.66 |                           $1.54 |
| 60 awake hours  |                     $2.71 |                 $3.16 |              $9.94 |                           $7.30 |
| 720 awake hours |                    $32.56 |                $36.83 |            $119.23 |                          $83.33 |

These are **not equal-throughput comparisons**. Cloudflare's chosen shape has less CPU capacity; actual browser memory may exceed assumptions. E2B's 720 hours would require repeated pause/resume or an enterprise runtime arrangement. Plans and extras below are not in the table.

Reproducible formulas, with `H` = awake hours:

- Cloudflare: `H × (0.1 × .072 + 4 × .009 + 8 × .000252)` = `H × .045216` before shared inclusions.
- Sprites: `H × (0.1 × .0385 + 2 × .021875 + 5 × .000683) + 720 × 5 × .000027`.
- E2B: `H × (2 × .0504 + 4 × .0162)` = `H × .1656`, plus the chosen account plan.
- Daytona: `H × (1 × .0504 + 4 × .0162) + 720 × 5 × .000108`.

For **100 light users**, multiply usage, not shared plan fees: Cloudflare about $45 execution before inclusions and other services; Sprites about $61 under the assumed meters; E2B about $166 execution + $150 Pro = $316 before extras. Daytona spans roughly $154–$193 if the first-five-GiB allowance is per sandbox versus effectively exhausted at account level. This range is preferable to assuming the allowance repeats for every user. Concurrent bursts, not registered users, determine capacity requirements.

## Costs outside the VM table

1. **Model usage:** `input_tokens/1e6 × input_rate + output_tokens/1e6 × output_rate`, plus cache/tool/model-specific fees. No model selected, so no fabricated token price. Measure failed/retried generations and compactions too.
2. **Durable control plane:** DO requests, active duration, SQLite operations/storage, and API requests. An idle loop or open connection can stop scale-to-zero savings. [DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/).
3. **Artifacts and backup:** R2 Standard lists $0.015/GB-month, plus operations and included allowances. Five GB of retained artifacts is $0.075/month before allowances, but full snapshot histories can be many times the live dataset. [R2 pricing](https://developers.cloudflare.com/r2/pricing/).
4. **Executor:** hosted member fees where applicable; upstream service subscriptions/rate limits; self-host compute and backup. [Executor pricing](https://executor.sh/pricing).
5. **Browser:** separate Browser Run or Kernel usage if selected; otherwise browser CPU/RAM inside the VM. Do not charge both by accident or omit the external browser.
6. Egress, images/builds, logs, previews, failure retries, minimum idle windows, support, and operational labor.

## Shortlist conclusion for discussion

**Cloudflare:** test first if restartable processes and explicit file checkpoints are acceptable. **Sprites:** strongest semantic match here for an automatically persistent personal filesystem; resolve region/security requirements. **E2B:** useful when explicit memory pause/resume and a mature sandbox API matter; account for Pro's shared floor and runtime limits. **Daytona:** useful hosted alternative with VM pause and desktop tools, but its current private core weakens the full open-source/self-host story. None is selected yet.
