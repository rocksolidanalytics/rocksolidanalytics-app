---
name: event-synonyms
description: Use when the user says two event or outcome names mean the same thing ("X is the same as Y", "group A with B", "treat Second yellow as red"), asks to add or change a synonym, or when building a view that groups tagged events. Covers event-synonyms.json, how the app reads it, and how to check a change against the real data.
---

# Event synonyms

Clubs tag the same thing under different names ("Bookings" or "Card", "Video Analysis" or
"Video analysis", "Turnover" with a won or lost outcome). `event-synonyms.json` in the repo
root groups them.

## Where it applies

- Only the Cards (Defence tab) and Other events (Other tab) views read it, through
  `synOf(e)` in `index.html`. Score Source tags are kept out of Other events; sources of
  scores are worked out by logic (`scoreSourceOf`), not from those tags.
- The main stats (`computeStats`, ratings, half-time card, vs Others) do NOT read it. The
  user decided this on 2026-10-22. Do not wire synonyms into the main stats unless the user
  asks again, and warn them that club numbers would change.
- Stored data is never rewritten. No backfills.

## File format

- `events`: group name to the list of event_type names in it.
- `byOutcome`: for one event_type whose meaning depends on the outcome, the outcomes that put
  it into a group. These win over `events`.
- `outcomes`: per group, outcome label to the list of outcome names in it. The `*` group
  applies to every event.
- Matching ignores case, spaces and punctuation (`nrmL`), so only list names that differ in
  more than that.
- Score source outcomes carry goal or point in their first word ("Goal Turnover"); keep
  that wording when adding sources.

## Adding a synonym

1. Check the real names first. With the Supabase tools, list distinct event_type and
   outcome values with counts for the clubs concerned, for example:
   `select e.event_type, e.outcome, e.team, count(*) from events e join matches m on
   m.id = e.match_id where m.club_id = '<club id>' group by 1,2,3 order by 4 desc;`
2. Edit `event-synonyms.json`. Keep it valid JSON (`node -e "JSON.parse(...)"`).
3. Run `bash tools/validate.sh` and the usual checks.
4. Commit with the usual message rules (Rollback line, attribution). The app reads the file
   on start and keeps a copy for offline use, so the change reaches users after deploy and
   their next load.
5. Tell the user what moved, with counts, for example "14 Bookings and 3 Card events now
   show together under Cards".

## Built-in events

Events the main stats already read (`CORE_EVENT_KEYS`) never show in Other events: Kickout,
Shot from play, Scoreable free, Possession lost, Turnover won, Tackle, Free won, Ruck, Free
conceded, Substitution. Cards and Score source have their own views. Everything else shows
in Other events, grouped by this file.
