# exec mascot: "the bellhop"

Working mascot for exec. The name isn't settled, so no asset has any lettering
and a rename costs nothing. Open `contact-sheet.html` in a browser to see every
variant on light and dark backgrounds, at real small sizes, with a live
pointer-tracking demo.

## Idea

exec is a durable personal agent. It has its own workspace and runs errands for
you. The character is a small service worker built from three parts:

- **A soft block body.** A rounded box: its own little machine.
- **Googly paper eyes with offset rust shadows.** These are taken straight from
  the dotheyplaytoday family, so the two projects read as siblings.
- **A tilted pillbox bellhop cap.** This is its job. The paper band on the cap
  echoes DTPT's sweatband stripe.

There are no mouths, as in the DTPT mark. The eyes carry the emotion.

## Files

| File | Use |
| --- | --- |
| `svg/mascot.svg` | Main transparent character, 64-unit grid. Hero, docs, empty states. |
| `svg/mascot-hello.svg` | Waving, happy eyes. Landing hero, onboarding. |
| `svg/mascot-happy.svg` | Success, task done. |
| `svg/mascot-wink.svg` | "Got it", small delight. |
| `svg/mascot-focus.svg` | Working, running, loading. |
| `svg/mascot-sleepy.svg` | Idle, paused, offline, 404. |
| `svg/mascot-mono.svg` | One color via `currentColor`; eyes and cap band are knocked out. |
| `svg/icon.svg` | Ink tile with the bellhop peeking up, 32 grid. Header mark, app icon, favicon at 24px and up. |
| `svg/favicon-16.svg` | Pixel-tuned 16px tile: bigger eyes, no eye shadows. |
| `png/favicon.ico` | 16 (tuned) + 32 + 48. |
| `png/*.png` | Transparent mascot exports at 512 and 1024; `icon-32/48/192/512`, `apple-touch-icon-180`. |

Suggested `<head>`:

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
```

## Palette

| Token | Hex | Role |
| --- | --- | --- |
| tangerine | `#ff6b2c` | Body; brand accent. Fills DTPT's `--kelly` role. |
| rust | `#c2451a` | Cap, feet, eye shadow. Fills the `--kelly-deep` role. |
| blush | `#ff9a73` | Cheeks, happy faces only. |
| paper | `#f8f6f0` | Eyes, cap band. Same value as DTPT. |
| ink | `#131711` | Pupils, icon tile. Same value as DTPT. |

Tangerine was picked as a warm counterpart to DTPT's kelly green. It also nods
to the Cloudflare deployment without copying Cloudflare's orange (`#f38020`).
Executor's own brand is monochrome, so there was no accent color to clash with.

## Usage notes

- **Light backgrounds.** Use the transparent body as is.
- **Dark backgrounds.** The transparent body also works as is: the rust cap and
  feet hold up against ink. Don't put `icon.svg` on a pure-ink background,
  because the tile disappears into it (same as DTPT). Use the transparent body
  there instead.
- **Small sizes.** Below 24px, use `favicon-16.svg` or the `.ico` rather than a
  scaled-down `icon.svg`.
- **Pointer tracking.** Pupils carry `class="mascot-pupil"`, so the pointer
  logic in DTPT's `BrandMark.tsx` ports directly. Look radius is about 1.3 units
  on the 32-unit icon and about 1.8 on the 64-unit body. Turn it off under
  `prefers-reduced-motion`.
- **Inlining.** Inline at most one sleepy or mono SVG per page, or give their
  `exec-lid-*` / `exec-mono-eyes` ids a per-instance suffix (`BrandMark.tsx`
  uses `createUniqueId()` for this).
- **Don't** add text to the character, outline it, or recolor the body away
  from tangerine. The silhouette and the cap are the brand.

## Reference and attribution

Studied directly, with nothing inferred from description:

- dotheyplaytoday:
  - Repo: `packages/web/public/favicon.svg`, `src/lib/ui/BrandMark.tsx`,
    `scripts/brand.ts`, `src/styles/global.css`, `public/og.png`
    (github.com/jackbisceglia/dotheyplaytoday).
  - Live site: the dotheyplay.today HTML ships the same mark.
- executor.sh: OG image and favicon links. The brand is a monochrome E-mark on
  grid paper.

**Borrowed principles:**

- Flat geometric SVG on a small grid
- One saturated accent plus a deep partner
- Offset paper eyes with ink pupils
- A character cropped by the tile
- Cursor-tracking pupils

**Not borrowed:** DTPT's silhouette, its green, and the stripe used as a
sweatband.

All artwork is original, hand-written vector. No raster image generation and
no third-party art were used.
