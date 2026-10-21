# Backlog

Agreed ideas waiting to be built, newest first.

## Team kits and crests

Agreed 2026-10-21. Not started.

- **Jersey designer** for your own club: pattern (plain, hoops, stripes, halves, sash,
  shoulder band), primary and secondary colour, number colour. Prefilled from
  `clubs.colour_primary` / `colour_secondary`. Store in `clubs.tag_settings` (no schema change).
- **Opposition kits**, remembered per opponent using the Opposition database grouping
  (`odKey` plus aliases), set from the opposition team page or the line-up screen, with a
  per-match override for an away kit.
- **Where kits show**: next to team names in both taggers' scoreboards (parity), line-up
  screen, opposition list and team page, match list, Fan Zone, match reports.
- **Colours on tagging buttons**: keep green (us) and blue (them) as the default. An optional
  "use team colours" setting falls back to green/blue when the kits clash or a colour has
  poor contrast.
- ~~**Crest upload**~~: done 2026-10-21. Tap the crest on the home banner (analysts only) to
  upload or remove one; stored small on `clubs.crest`. Still to do with kits: show crests
  in the taggers, Fan Zone and opposition pages.

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
