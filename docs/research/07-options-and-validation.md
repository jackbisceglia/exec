# Options, open questions, and MVP slices

Research date: 2026-10-08. These are discussion inputs. No option is an approved architecture, and none of the experiments below was run.

## Plausible combinations

| Option                                                       | What it tests                                         | Tradeoff                                                            | When to prefer it                                          |
| ------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| A. Pi on Cloudflare + Executor; no Linux workspace initially | Persistent assistant with connected tools and reviews | Does not demonstrate the full computer promise                      | First job is briefing, triage, or drafted follow-up        |
| B. A + Cloudflare sandbox snapshots/R2                       | Cloudflare-centered workspace                         | Explicit checkpoint/recovery policy; no memory resume; beta surface | Files must return, processes may restart                   |
| C. Cloudflare state/UI + Sprites execution                   | Automatically persistent personal computer            | External service and unverified regional guarantees                 | POSIX workspace continuity is central                      |
| D. Cloudflare state/UI + E2B execution                       | Memory pause/resume and isolated task environments    | Plan floor/runtime constraints; pause failure paths                 | Process state matters or open runtime escape path matters  |
| E. Cloudflare state/UI + Daytona VM                          | Hosted desktop/VM pause APIs                          | Current private core; class-specific semantics                      | Computer-use tooling outweighs independent self-host needs |

The facts behind these choices are in [Pi](03-pi-durable.md), [Cloudflare](04-cloudflare.md), and [VM comparison](05-vms-and-costs.md). The preference for Cloudflare is preserved in every option. Adding an external execution service need not move the application away from Cloudflare.

## Decisions to make before high-level design

1. **Workspace ownership:** one per user, named agent, project, or task? Shared workspaces improve continuity but share filesystem/browser authority. Isolated tasks reduce cross-task contamination but need deliberate artifact transfer.
2. **Persistence promise:** what must survive an ordinary idle stop, application deploy, host crash, and 90 days of inactivity? State a recovery point and recovery time for each data class.
3. **Integration generation:** target Executor v2 beta, v1, or a pinned compatibility subset? The pack recommends testing v2's documented boundary, not assuming a v1 SDK works.
4. **Known continuation gap:** is “some interrupted external programs need reconciliation” acceptable initially? If not, Executor changes or a narrower durable operation boundary are prerequisites.
5. **Autonomy:** does the first slice act only on requested goals, or also research proactively? Which exact write can run without another approval?
6. **Self-host contract:** user-owned Cloudflare deployment or fully independent hosting? Resolve the Executor v2 license boundary before distributing its server.
7. **Browser requirement:** what exact authenticated website cannot be served by Executor APIs? Test that website before making the browser a platform requirement.
8. **Budget:** what total monthly cost per active user is acceptable, including model calls and idle workspace time? How much overshoot is allowed on a stop?

## Small validation slices

### Slice 0: contracts and versions

Pin Pi Durable, Pi AI, Chord, Agents SDK, and the intended Executor release. Confirm published exports, compatible peer ranges, and bundled Workers imports. Identify the missing Executor v2 server license coverage and hosted embedding terms. Record exact versions/digests in a spike report. **Pass:** another developer can reproduce the dependency set and knows which code can be redistributed. No user data or paid runtime is needed for this review.

### Slice 1: a durable read-only brief

One person, one assistant, two real account profiles, one read-only job. The job gathers evidence, produces an artifact with source links, and remembers the last successful checkpoint. Support reconnect and a new instruction while busy. Keep shell/browser out of the dependency chain for this slice.

**Pass:** duplicate input IDs cause one logical job; closing the page does not lose it; forced host eviction resumes it; results come from the correct accounts; a repeated check does not repeat old alerts; the user can stop future work. Report model/tool calls and measured cost.

### Slice 2: one reviewed write with ambiguous-outcome handling

Use a controlled upstream test service that can accept a write, deduplicate by key, and deliberately lose its response. Add an approval for a concrete payload. Exercise both a normal approval and Executor server-restart loss.

**Pass:** changed arguments invalidate consent; denial is respected; duplicate submissions and resume attempts do not duplicate a write; a lost Executor session is visible; the system reconciles an accepted write without rerunning the whole program. If the test cannot pass against Executor's present contract, record that boundary and stop claiming transparent end-to-end durability.

### Slice 3: one continuing workspace

Test Cloudflare first. Install a dependency, create files, start a process, snapshot, stop, restore, and verify bytes and restart behavior. Separately terminate without the last snapshot. Test an expired/invalid snapshot and recovery from independent R2 backup. Record restore latency, bytes transferred, and charges.

**Pass:** the product can explain exactly which changes survived; a changed sandbox ID cannot cross tenants; quiet background work stays alive only as intended; credentials are not baked into the saved disk; compute shuts down within the configured idle budget. If the loss window is unacceptable, repeat the same workload on Sprites or E2B.

### Slice 4: a bounded recurring responsibility

One periodic brief or watch rule, not unbounded ambient autonomy. Persist the schedule and deduplication key; test redeployment, duplicate delivery, delayed execution, and revocation while asleep.

**Pass:** no duplicate outcome for the same schedule window; no work after revocation; no lost schedule after deploy; late/skipped runs are visible; maximum spend and run count are enforced independently of prompts. Compare the value of each update with the interruption burden.

### Slice 5: browser work only if the job requires it

Select one website and one operation; provide a human login handoff. Save only the required browser profile state and define its deletion policy. Exercise expired cookies, MFA, browser process loss, and an interrupted final submit.

**Pass:** no user password enters the model context; wrong-account use is detectable; failure never becomes an automatic duplicate final submit; user can view/stop the task; browser and network costs are measured. Treat unsupported authentication as a product limit, not a reason to broaden permissions silently.

## Suggested order of discussion

Start with the actual job and workspace owner, then agree on what “survives a restart” means. Review the Executor continuation and licensing gaps next. Only then choose the first runtime combination. A failed assumption should change a narrow slice, not force a large architecture rewrite.

## Do not infer from the parallel scaffold

The Effect HTTP API, Solid + solid-yield frontend, Alchemy, and `packages/core/web/api` organization are implementation context supplied by the user. A working scaffold proves neither Pi host compatibility nor the Executor permission model nor sandbox persistence. The mascot work is separate. This research makes no edits or design demands on those owners.
