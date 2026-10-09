# Pi Durable: exact identity, recovery, and compatibility

Verified 2026-10-08. **Identity is resolved by the user:** [Earendil, “Pi Durable,” October 1, 2026](https://earendil.com/posts/pi-durable/). This document concerns that harness, not an extension with “durable” in its name and not the terminal coding agent's session log.

## Package and maturity

The intended package is `@earendil-works/pi-durable`, in `earendil-works/pi/packages/durable`, using Pi AI and Chord. The announcement distinguishes the new harness from the single-user terminal coding agent. It is experimental. [Announcement](https://earendil.com/posts/pi-durable/).

The inspected source is commit `6fb2e7815167e6b19006fc526d1a5d0f5f998787`; npm `latest` and the package manifest reported **1.1.0** during research. The Node engine declaration is `>=22.19.0`; dependencies include Pi AI and Chord `^1.1.0`. The license is MIT. These are observations, not an instruction to float dependency versions. [Pinned manifest](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/package.json), [license](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/LICENSE).

## Is it a workflow engine or a chat log?

**Evidence:** tasks have persistent checkpoints, phases, ownership, waiting/terminal states, and recovery. Generation and tool execution are built-in task types; applications can define tasks and typed documents. Conversations hold transcript entries and state, while child tasks and child conversations form owned work. This is durable execution machinery, beyond transcript persistence. It is not a claim that arbitrary JavaScript call stacks are checkpointed or that all remote effects are transactional. [Normative specification](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/docs/spec.md).

**Inference:** classify it as a durable agent harness with explicit state-machine tasks. Use its primitives for the agent loop; do not add a second workflow engine around every model/tool turn merely because “durable” appears in both products.

## Identity and state

| Identity/state             | Meaning                                                                                     | Not equivalent to                                           |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Storage/session            | Durable records owned by one active harness process                                         | A distributed scheduler with arbitrary simultaneous writers |
| Conversation ID            | Transcript, configuration, documents, and owned tasks                                       | A VM or human authentication identity                       |
| `pi.provider` session ID   | Persisted UUIDv7 for model-provider session/cache affinity; forks/children get fresh values | A permission grant or an upstream API idempotency key       |
| Submission `requestId`     | Finds the existing submission on resubmission                                               | Exactly-once execution of everything downstream             |
| Task ID/checkpoint         | The committed point from which work resumes                                                 | A saved process stack or open socket                        |
| Execution environment `id` | Identifies the same files/paths for tool coordination                                       | Proof of tenant ownership                                   |

Provider identity survives reopen, retry, reset, compaction, and model changes. `resume()` enables pending work; submit/wait also start scheduling. Registry definitions must be installed again after restart. [README](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/README.md).

## Recovery rules verified in source

The tool task saves the final validated/hook-adjusted arguments and replay policy **before** executing. Omitted replay policy is unsafe. Recovery reruns only when **both** the saved policy and the currently resolved tool say `safe`; it uses the stored arguments. Otherwise the model receives an interrupted result that acknowledges possible partial execution. A later code change cannot upgrade a previously unsafe call into replay-safe work. [Tool task, lines 46–110](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/src/harness/tool.ts#L46).

Source tests cover unsafe interruption with durable output, both-policy safe replay, tool deselection, environment resolution at rerun, interruption before intent, and a real bash command across close/reopen. **The tests were inspected, not executed in this task.** [Recovery tests](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/test/harness-tools-recovery.test.ts).

| Failure window                                | Supported conclusion                                          | exec responsibility                                                       |
| --------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Client retries an admitted submission         | Same request ID finds existing submission                     | Use stable request IDs and bind them to the authenticated owner           |
| Crash after tool intent, before result commit | Safe tool may run again; unsafe tool reports interruption     | Classify tools by actual effect semantics                                 |
| Upstream write succeeds, response disappears  | Harness cannot know whether the external write happened       | Query a receipt, reconcile state, or ask a human; do not blind-retry      |
| Process is interrupted during model streaming | Generation recovery is managed by harness tasks               | Budget repeated model attempts; do not promise identical regenerated text |
| Tool removed/changed on upgrade               | Recovery consults current definitions as well as saved policy | Test migrations and preserve required definitions                         |
| Child work is aborted                         | Ownership controls propagation                                | Distinguish stop-requested from remote-effect rollback                    |

**Inference:** `replay: "safe"` is a promise made by the tool author, not an idempotency service supplied by Pi. For a write, persist a stable operation key before execution and pass it to a provider that actually honors deduplication. If the provider lacks it, record an unknown outcome and reconcile. Even an unsafe tool can be selected again by the model as a _new_ call; policy must guard semantic duplicates, not only task replays.

A generic Executor `execute` is especially unsuitable for unconditional safe replay: one program can batch reads and writes. A safe read wrapper or a genuinely idempotent named operation is easier to reason about. This is an integration conclusion, not a Pi defect.

## Storage and host-failure distinctions

Memory storage is nonpersistent. Node SQLite uses WAL with `synchronous=NORMAL`; JSONL defaults to no fsync and offers `fsync:true`. These distinctions matter for host/power failure versus process termination. Storage has a single active owner and no cross-process locking. [Storage documentation](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/README.md#storage).

The inspected package also exports a Cloudflare SQLite adapter. It queues database operations and uses Durable Object storage transactions with a transaction-scoped handle. A claim that upstream only supports Node adapters is already stale at this commit. [Adapter](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/src/storage/sqlite/cloudflare.ts).

## Cloudflare, Effect, and Solid compatibility

Cloudflare documents beta `PiHarness` at `agents/harness/pi`: the adapter supplies storage and wakeups; Pi owns its run machinery. It does not supply exec's chat protocol or UI. Published `agents` 0.27.0 declares optional Pi peers `^1.0.0`, which admits Pi 1.1.0 semantically but is not proof of all-feature compatibility. [Integration guide](https://developers.cloudflare.com/agents/harnesses/pi/), [package metadata](https://registry.npmjs.org/agents/latest).

Code inspection found a lifecycle job per session, a 30-second heartbeat, and a 10-minute wait budget within the alarm's 15-minute wall-time limit. Long waits are handed back to alarms. This is the essential difference between durable storage and a host that can autonomously wake to finish work. [Pinned adapter implementation](https://github.com/cloudflare/agents/blob/b65956e8a40501fc241c223aba0d6177077268d1/packages/agents/src/harness/pi/harness.ts).

**Inference:** keep Effect at application/service boundaries initially. Pi exposes promises, contexts, and event streams; do not assume Effect fibers, scopes, or retries are persisted by Pi. Solid can consume a transport-neutral snapshot/event contract. React examples do not require choosing React for exec. No native Effect or solid-yield integration was verified, and none is needed to establish basic runtime feasibility.

**Validation gate:** pin versions; run a fake-provider task in a real SQLite-backed DO; evict during a read, unsafe write, safe idempotent write, approval wait, and child task. Reattach the UI from another client. Verify state and external receipts, not merely a successful HTTP response. See [validation slices](07-options-and-validation.md).
