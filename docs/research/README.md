# exec research pack

Research date: **2026-10-08, America/New_York**. Some retrieved repository commits are dated October 9 UTC. This is feasibility research, not an agreed architecture or implementation plan.

Working premise: **the personal agent layer on top of Executor**. Preserve the preference for Cloudflare deployment; establish which promises need additional infrastructure before choosing it. The user explicitly confirmed [Earendil's Pi Durable announcement](https://earendil.com/posts/pi-durable/) as the intended runtime.

## Read in this order

1. [Landscape and user jobs](01-landscape-and-jobs.md): verifies dots, Grok Bot, and Muse; turns the inspiration into testable product jobs.
2. [Executor](02-executor.md): integration surface, account identity, approvals, deployment, license, and unanswered recovery questions.
3. [Pi Durable](03-pi-durable.md): exact package, code-backed recovery semantics, replay safety, and Cloudflare compatibility.
4. [Cloudflare feasibility](04-cloudflare.md): what runs where, persistence limits, lifecycle, browser, and orchestration boundaries.
5. [VMs and costs](05-vms-and-costs.md): Cloudflare, Sprites, E2B, and Daytona; persistence semantics and explicit workload arithmetic.
6. [Trust and open source](06-trust-and-open-source.md): security boundaries, credential handling, portability, and self-host promises.
7. [Discussion options and validation slices](07-options-and-validation.md): choices to make, small experiments, and acceptance criteria.
8. [Evidence ledger](08-evidence-ledger.md): source versions, contradictions, verification gaps, and refresh instructions.

## Executive findings

- **The named product references are real as of this research date.** Official sources confirm [OpenAI dots](https://learn.chatgpt.com/docs/dots), [Grok Bot](https://x.ai/bot), and [Meta Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/). Treat their capabilities as vendor descriptions, not benchmark results. Grok Bot explicitly shares one computer among a user's bots: “one VM per agent” is a product choice, not an inevitable category requirement.
- **Pi Durable is more than a durable chat log.** It persists task checkpoints and has explicit recovery behavior. Its tool implementation reruns a started tool only if both the saved and current declarations permit safe replay. This does **not** make external actions exactly-once. [Pinned tool implementation](https://github.com/earendil-works/pi/blob/6fb2e7815167e6b19006fc526d1a5d0f5f998787/packages/durable/src/harness/tool.ts).
- **Cloudflare is a credible first candidate for the agent runtime.** Its beta `PiHarness` supplies SQLite storage and lifecycle wakeups for Pi. No reason was found to require a VM merely to run conversations and integration tools. [Cloudflare Pi integration](https://developers.cloudflare.com/agents/harnesses/pi/).
- **Cloudflare can provide a returning workspace, but snapshot restore is not memory hibernation.** The application must save and restore disk state; snapshots expire 30 days after creation or last restore. A durable sandbox name is not a permanently surviving Linux instance. [Sandbox lifetime](https://developers.cloudflare.com/sandbox/concepts/lifetime/).
- **Executor is a substantial existing product boundary.** Its current docs describe reusable accounts, apps, profiles, and one MCP endpoint. Building another connector catalog or credential vault would duplicate it. The v2 beta and older `main` surface must not be mixed casually. [Current concepts](https://executor.sh/docs), [documented v2 self-host release](https://executor.sh/docs/run/self-host).
- **Executor has a confirmed continuation durability gap.** Its pinned v2 MCP docs say a program cannot resume after the server restarts and must not be automatically rerun. Pi's durability does not fix that downstream boundary. [Pinned MCP contract](https://github.com/UsefulSoftwareCo/executor/blob/2b589d319681665724f82959b046b1556119cfda/apps/docs/content/mcp.md#what-is-coming-later).
- **Open-source client libraries do not imply an open-source hosted backend.** Daytona's primary repository says core development moved private in June 2026. Its hosted VM features remain candidates, but not evidence for an equivalent current self-host distribution. [Repository notice](https://github.com/daytonaio/daytona).

## Decisive unknowns before design

1. Does “each agent has a VM” mean independent files, a stable computer identity, persistent browser login, or processes surviving sleep? These are different requirements.
2. How should exec expose and reconcile Executor's known lost-session state after server restart? What deduplicates a completed external write whose response was lost?
3. Which exact published Pi/Agents versions pass a real eviction-and-recovery test together? Version ranges and source tests are not deployment validation.
4. Is self-hosting “deploy exec to your Cloudflare account,” or “run the complete system without Cloudflare or Executor Cloud”? The latter needs separate adapters and operations work.
5. Which first user job warrants browser or shell access? An API-based brief and reviewed follow-up can test the core product before workspace persistence becomes a dependency.
6. What license covers the complete Executor v2 server? The inspected v1 root and v2 CLI are MIT, but a v2 root/server license was not established. See the [license inventory](06-trust-and-open-source.md).

## Evidence conventions and scope

**Evidence** means an inspected primary source or code path. **Inference** means our interpretation. **Proposal** means a discussion candidate. **Unknown** means unverified or conflicting evidence. Dollar estimates are USD planning scenarios, not quotes. Prices, quotas, beta APIs, and plan availability should be refreshed before purchase or implementation.

Only `docs/research/**` was authored for this task. No code, manifests, root README, Git operations, account changes, or deployments. Parent and repository `AGENTS.md` locations were checked; none applied at inspection time. No provider benchmark, OAuth flow, sandbox, paid resource, or live recovery experiment was run.
