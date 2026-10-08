// Seeded synthetic matches shared by cs_snapshot.js and the screen harnesses.
// gen(seed) returns a generator; mkMatch(id, opponent, sport, nEvents) -> { m, evs, apps }.
const TYPES = { kickout: 'Kickout', shot: 'Shot from play', free: 'Scoreable free', poss: 'Possession lost', tackle: 'Tackle', card: 'Bookings', freewon: 'Free won', towon: 'Turnover won', ruck: 'Ruck' };
const OUT = { kickout: ['Won clean', 'Break won', 'Break lost', 'Lost clean', 'Straight Over Sideline'], shot: ['Point', '2 Pointer', 'Goal', 'Wide', 'Blocked', 'Dropped Short', 'Saved', 'Woodwork'],
  free: ['Point', '2 Pointer', 'Goal', 'Wide', 'Dropped Short', 'Saved', 'Woodwork'], poss: ['In Contact', 'Kick Pass', 'Hand Pass', 'Handling', 'Intercepted', 'Foul', 'Shot Dropped Short', '3-Man Breach'],
  towon: ['Tackle', 'Interception', 'Loose Ball', 'Forced Error'], tackle: ['Contact Made', 'Block', 'Foul'], freewon: ['In Tackle', 'Off The Ball', 'Overcarry', 'Frontal Contact', 'Other'], card: ['Yellow', 'Black', 'Red'], ruck: ['Ruck Won', 'Ruck Lost'] };
const SC = { Point: 1, '2 Pointer': 2, Goal: 3 };
const PLAYERS = ['Sean Murphy', 'Ciaran Byrne', 'Darragh Kelly', 'Eoin Walsh', 'Padraig Doyle', 'Tomas Nolan', 'Cian Kavanagh', 'Niall Ryan', 'Oisin Brennan', 'Fionn Doran', 'Ruairi Kehoe', 'Conor Quinn', 'Aidan Farrell', 'Shane Lynch', 'Ronan Healy'];
function gen(seed) {
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pick = a => a[Math.floor(rnd() * a.length)];
  function mkMatch(id, opponent, sport, nEv, clubId) {
    const keys = Object.keys(TYPES).filter(k => sport === 'hurling' || k !== 'ruck');
    const evs = []; let us = 0, op = 0;
    for (let i = 0; i < nEv; i++) {
      const k = pick(keys), oc = pick(OUT[k]), team = rnd() < 0.55 ? 'us' : 'opp';
      const score = (k === 'shot' || k === 'free') ? (SC[oc] || 0) : 0;
      if (team === 'us') us += score; else op += score;
      const placed = rnd() < 0.85;
      evs.push({ id: id + '-' + i, match_id: id, seq: i + 1, team, event_type: TYPES[k], outcome: oc, score, period: i < nEv / 2 ? 1 : 2,
        player: team === 'us' ? (rnd() < 0.9 ? pick(PLAYERS) : '') : null, x: placed ? +rnd().toFixed(4) : null, y: placed ? +rnd().toFixed(4) : null,
        time_text: String(Math.floor(i * 70 / nEv)).padStart(2, '0') + ':' + String(Math.floor(rnd() * 60)).padStart(2, '0'), club_id: clubId });
    }
    const apps = PLAYERS.map((p, j) => ({ match_id: id, player_name: p, jersey: j + 1, position_slot: j < 15 ? j + 1 : null, club_id: clubId }));
    return { m: { id, opponent, our_total: us, opp_total: op, date: '2026-0' + (id.length % 9 + 1) + '-1' + id.length % 9, venue: pick(['Home', 'Away', 'Neutral']), weather: pick(['Dry', 'Light Rain', 'Heavy Rain']), competition: 'League', sport, club_id: clubId, scouting: false, status: 'final' }, evs, apps };
  }
  return { rnd, pick, mkMatch };
}
module.exports = { gen, PLAYERS };
