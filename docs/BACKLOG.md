# Backlog

Agreed ideas waiting to be built, newest first.

## Team kits and crests

Agreed 2026-10-21.

**Step 1, done 2026-10-21:**
- Jersey designer (KitPicker): plain, hoops, stripes, halves, sash, band; main, second and
  number colour. Club kit on the home banner sheet (Crest / Kit tabs), stored as
  `tag_settings.ourKit`; saving also sets `colour_primary` / `colour_secondary`.
- Opposition kits on each team page, stored as `tag_settings.oppKit` by team key, shown in
  the Opposition list; merges carry the kit across.
- Add a team: set up an opponent before any match (`tag_settings.oppTeams`), with kit and
  notes; delete it while it has no matches.
- Crest upload on the home banner, stored small on `clubs.crest`.

**Step 2, next:**
- **Team colours are the default** on the tagging buttons, scores and pitch dots, using
  each kit main colour. Fall back to green (us) and blue (them) when the two kits are too
  similar or a colour reads badly on the dark background.
- Show kits next to team names in both taggers' scoreboards (parity), the line-up screen,
  match lists and Fan Zone; crests in the taggers, Fan Zone and opposition pages.
- Per-match away kit override from the line-up screen.

## Payments (Stripe)

Discussed 2026-10-21. Waiting on a price decision.

- Start manual: a Stripe Payment Link for a one-time club licence, reply with a club code.
- Pricing section on the club page, terms of sale and privacy pages.
- Later: Stripe webhook to a Supabase function that issues the club code and emails it.

## Other open items

- Opposition starting order in the taggers' opposition grid (still 1 to 15 plus subs).
- Help assistant: the `support-agent` function is not deployed, so Help always falls back.
- Team sheet reader: optionally capture marks such as asterisks; optional stronger model for
  messy handwritten sheets.
