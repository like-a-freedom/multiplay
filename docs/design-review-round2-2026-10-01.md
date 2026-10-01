# Orbit Club — second design review, 2026-10-01

Method: dual-agent (A: /root/round2_design_assessment · B: /root/round2_evidence_assessment). Fresh independent assessment A completed before detector output entered synthesis. User screenshots and comments outrank the previous delivery verdict. Impeccable critique and polish applied within the user’s request to fix all findings.

## Review and changes

The visual identity is coherent: original satin ceramic Orbi, ship, ringed planet and star sprites with local Nunito. The main defects were in status semantics, relative scale and information hierarchy, rather than the identity itself. A scored 26/40 before the changes; this is a diagnostic assessment, not a measured improvement claim.

| Finding | Implemented correction |
| --- | --- |
| Ship dominates XP route | 60 × 60 stage-unit sprite, down from 90 × 90; same curve and center anchor, complete contours. Planet stays 128 × 128. |
| Future stars merge into lavender clouds | Generated ice-white ceramic with mint/cyan shading, native alpha and geometry; navy galaxy veil .62. Applies to home, atlas, legend, archive and finish. Gold remains earned. |
| Home footnote adds noise | Removed. Meaningful local-data/no-backup note remains in adult report. |
| Review count buried in prose | Large amber count grouped with explicit review heading and Orbi’s supporting sentence. Review remains the primary action. |
| Archive status loose and flat | One equation heading with a dark star backplate, then separate future/earned and due-review badges. Rule text has breathing room before the rows. |
| Adult report roles compete | Consistent label/value/note rhythm, heavy labels, aligned tabular numbers, secondary denominator, level badge and modest empty retention state. Narrow screen becomes one column. |
| Reset looks routine | Separate red danger region and native modal dialog; cancel gets initial focus, Tab is contained, Escape/backdrop cancel and focus returns to the trigger. Explicit final deletion. |
| All completed cards falsely green | Correct = mint/check, wrong = amber/retry, unknown = blue/bulb; each has an accessible outcome label. Introductory check stays neutral. Finish reports all three counts. |
| Reload resets card numbering | Frozen full queue and earlier outcomes remain visible; resume opens the first unanswered card at its original position. |
| All-hint mission gets XP | User chose at least one entered answer; wrong qualifies. Hints-only completion earns zero XP, no streak/bonus and no daily reward slot. Historical XP is retained. |
| Ambiguous XP route footer | Current XP and actual remaining XP to the next level are separate lines. |
| 200% text fragments counts/navigation | Summary becomes three label/value rows; Dock wraps complete labels; titles permit Russian hyphenation and reset warning uses shorter language. |

The finish explicitly separates effort XP from knowledge stars. Wrong answers incur no penalty. Learning schedules, independent mastery confirmation and permanent earned stars retain their rules.

## Detector synthesis

One B detector invocation returned 19 findings: 18 advisories and one warning. Twelve type and five radius advisories exposed compact role values that were partly already intentional. Reusable compact roles now have shared tokens. The purported side-tab warning is the launch button’s bottom tactile inset, not a one-sided card accent. The 2px radius finding is a subtraction operand in its radius calculation, not an actual control shape. A small gold-shadow alpha difference remains an intentional launch material detail documented with the system. No second detector was run.

CUA’s page evaluation is read-only, so detector injection and a human-visible overlay were unavailable. A and B independently inspected the live app through CUA; no overlay is claimed.

## Graphic asset

The future star was revised by editing the existing idle ceramic sprite, with the earned star and Orbi as style references, preserving the shared family and native transparency. The exact prompt, source, generation and conversion-only provenance are in `public/art/orbit-star-contrast.prompt.md`. No code recoloring or replacement vector silhouette is used. Galaxy and planet artwork remain generated originals. All six shipping rasters have exact generation prompts in adjacent `.webp.json` metadata sidecars; the metadata tool left decoded pixels and raster bytes unchanged.

## Evidence and limits

Captured WebKit profiles are disposable test data, separate from the user’s browser progress. Required sizes: 428 × 926 phone, 1280 × 900 desktop, 723 × 780 user-comment viewport, and 320 × 740 with 200% text. The final capture manifest and independent finish review live in `.impeccable/review/round2/`. Root and `/multiplay/` deployment checks include manifests, fonts, all six art assets, service worker scope and actual offline reload; learning flows use WebKit and deployment flows use Chromium.

Real iPhone installation, VoiceOver and the child’s emotional response remain unverified. Automated text enlargement is not a claim of a real Safari system-text test.

Validation after the reviewer-directed fixes: 108 Vitest tests in 23 files; 38 Playwright tests at `/`; 38 Playwright tests at `/multiplay/`; build and typecheck passed for both hosting paths. The root production build was restored afterward. All 30 captures were refreshed at their original required sizes. Finite entrance animations finish before summary capture. The current-user profile remains at 30 XP, zero earned stars, one streak day and three due examples; only navigation and cancellation were used in that browser.

## Independent finish review

A fresh child reviewer applied the shipped degraded reviewer contract because the harness did not load the dedicated role. It used the user’s quoted comments, current captures and supplied quality-bar prose; the original chat attachments were not separate local files. This is a bounded visual and primary-source review, not an exhaustive code audit. No further detector was run.

Its first disposition was `fix`, with three material findings at 320px and 200% text. One reviewer-directed batch addressed them:

| Material finding | Correction and regression evidence |
| --- | --- |
| Reset opens below its full question | Cancel focus uses `preventScroll`, the dialog starts at scroll position zero, and shorter warning/action copy keeps the full question, warning and both actions visible. Geometry checks cover all four required sizes; cancellation, Escape, focus containment and focus return remain tested. |
| Fixed center gauge covers inner-ring stars | Gauge diameter now scales to 25.625% of chart width. All 66 marker frames remain outside the center disc at every required size. |
| Enlarged text breaks words arbitrarily | Home heading uses responsive sizing and normal wrapping; the narrow launch button prioritizes its whole text label; the map review heading allows the count to stack. DOM Range checks verify the complete target words on single lines, with no horizontal page overflow. |

The follow-up verdict is scoped to these three findings and their refreshed evidence.

## Scope answer

The user already requested all findings fixed and explicitly selected the entered-answer XP rule. Priority, tone and scope were therefore established by the human; no repeat approval question was needed.
