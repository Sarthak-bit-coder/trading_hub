# Design v2: revised screens

Static mock-ups of every app screen, redesigned from the Google Stitch export to remove AI-generated patterns: invented jargon, vanity metrics, a badge on every card, features the app lacks, and contradictory numbers. These are designs only; the app does not use them yet.

- `RULES.md`: the design rules each screen follows.
- `base.css`: shared styles (Inter, JetBrains Mono for numbers, card boxes, teal accent, gentle motion that is off under reduced motion).
- `src/*.html`: one page per screen. `sidebar.html` is inlined at build time.
- `png/*.png`: rendered screens, 1280px wide. `sheets/*.png`: overview of all screens by section.
- `landing.html`: marketing landing page with scroll animations; it shows `png/home.png`, `png/paper.png` and `png/backtest.png`.

Re-render after editing (needs Microsoft Edge):

```bash
node docs/design/build.cjs            # all screens, or pass names: home paper
node docs/design/sheets.cjs           # overview sheets
```

Not designed, because the app has no such feature: learner profile and credentials, live synthetic price engine controls, a separate syllabus page (covered by the course map).
