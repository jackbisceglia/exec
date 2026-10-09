# Landscape and actual user jobs

Verified 2026-10-08. Product descriptions below are evidence of positioning and documented behavior, not independent proof of reliability.

## Resolve the user's cues

| Cue               | Primary-source resolution                                                                                                                                                                                                                                                                        | Useful lesson for exec                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| “OpenAI dots”     | Confirmed. Dots maintain ongoing work, context, and preferences, use a cloud computer/browser, and can continue while the user's machine is off. [Meet dots](https://learn.chatgpt.com/docs/dots).                                                                                               | Continuity, reachability, and steering matter more than a chat transcript.         |
| “SpaceX Grok bot” | Confirmed as **Grok Bot** on the official x.ai site, branded SpaceXAI. The product describes parallel bots, routines, and a persistent computer shared by a user's bots. [Grok Bot](https://x.ai/bot).                                                                                           | Separate named roles can share a workspace; one role need not equal one machine.   |
| “Meta muse”       | Confirmed as **Muse**, a personal agent, distinct from Muse Image. Meta describes app/WhatsApp access, long-term goals, a dedicated Secure VM, and a separate Sentinel controlling outbound actions. [Muse introduction](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/). | Trust and permission boundaries are part of the product, not only hosting details. |

Do not substitute New Computer's older Dot product, generic Grok chat, or image-generation models for these references. The supplied names were uncertain cues initially; current primary sources resolve them. No claim is made that exec can reproduce proprietary safety systems, model quality, or distribution.

Dots documents separate app access from messaging access and local-computer access. Its control guidance distinguishes preparing a reply from permission to send it, and limits unsolicited research to tools that cannot mutate connected apps. These are concrete interaction patterns to evaluate, not an instruction to copy every feature. [Getting started](https://learn.chatgpt.com/docs/dots/getting-started), [controls](https://learn.chatgpt.com/docs/dots/controls).

## Proposed audience and jobs

**Hypothesis:** begin with technically comfortable individuals who already have several work accounts and want a persistent assistant they can inspect, modify, and host. No user interviews or demand validation were performed.

| User job                                       | Concrete outcome                                                                   | Why continuity matters                                                    | Earliest useful boundary                            |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------- |
| “Tell me what changed and what needs me.”      | A concise brief with links and a small decision queue                              | Remembers the last successful check; avoids repeated alerts               | Read-only Executor tools; no VM required            |
| “Prepare the follow-up and let me approve it.” | A draft tied to the correct thread/account and a reviewable send action            | Waits for the user without losing inputs or sending twice                 | One external write behind durable approval          |
| “Own this small ongoing project.”              | Maintains a checklist, artifacts, next step, and blocker status                    | Work continues across browser disconnects and changed priorities          | One bounded goal; explicit stop and spending limits |
| “Work on these files and return a result.”     | Edited document, chart, script, or tested patch                                    | Files and installed tools must return tomorrow                            | One persistent workspace; shell if needed           |
| “Use this website that has no adequate API.”   | Completes a particular workflow with a human handoff for login or sensitive action | Browser identity and interrupted transactions become first-class concerns | Later browser slice with its own acceptance tests   |

These are **candidate jobs**, not proven priorities. Measure success as time saved to a correct outcome, not tokens generated, integrations listed, or apparent busyness.

## What the personal layer could add to Executor

Executor already connects accounts to reusable app tools and supplies a dashboard/MCP interface. [Executor overview](https://executor.sh/docs). A plausible exec contribution is the ongoing relationship: goals, preference memory, proactive but bounded work, a place to steer it, and a clear record of what happened.

**Inference:** a durable assistant needs several kinds of memory: explicit user preferences, ongoing task state, source-backed observations, and working files. A transcript is useful evidence but should not automatically become a permission policy or a permanent factual belief. Store provenance and allow correction/deletion; define this before promising that the assistant “knows you.”

## Questions worth asking actual users

1. What did you repeat to your assistant this week, and what should it have remembered?
2. What task would you safely leave running overnight today? What outcome would make you stop using it?
3. Which two accounts must work first, and which precise operations do you need from them?
4. Do your named agents need to share browser logins and files, or must they be isolated?
5. Is hosting in your own cloud account enough, or must it run on a local server without vendor services?
6. How often should it interrupt you, and where should completed work appear?

## Evaluate the product promise

For a first trial, define a fixed task set and record: successful completion, wrong-account actions, duplicate actions, time awaiting permission, recoverability after interruption, notification burden, and total cost. Include failure cases and intentional pauses. A pleasant mascot can help make the assistant recognizable, but should not imply that a task completed or that the system is watching something when no durable job exists.
