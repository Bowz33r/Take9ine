// Game engine: runs in the browser (solo) and in Node (WLAN). No personal data is stored.
(function (R) {
const H = {
  ilse: { n: 'Ilse', hp: 80, atk: 9, sk: 'Witness', say: 'Noted. And judged.' },
  kesh: { n: 'Kesh', hp: 70, atk: 11, sk: 'Mimic', say: 'Watch this!' },
  teodra: { n: 'Teodra', hp: 75, atk: 6, sk: 'Knot', say: 'A knot for all of you.' },
  anwe: { n: 'Anwe', hp: 65, atk: 8, sk: 'Haggle', say: 'Everything has a price.' } };
const BEATS = { gift: 'free', free: 'face', face: 'gift' }; // gift binds freedom, freedom resists the face, the face outweighs the ledger
const ITEMS = [['Millet bowl (+30 HP)', 15], ['Salt charm (+3 attack)', 30], ['Cord wrap (+10 max HP)', 30]];
const SC = [
 { t: 'Salt. The Ashari plain, white to every horizon. A stranger presses millet into your hands. Pay, and she flinches: here you do not pay, you owe.', c: [['Accept the gift and owe it (+10 knots, +10 debt)', { g: 10, d: 10 }], ['Insist on paying (-5 knots)', { g: -5 }]] },
 { shop: 1, t: 'The Mother of Cords weighs your cord. Knots are debts made visible. Trade, borrow, or move on.' },
 { k: 'debate', e: { n: 'The Auditor', hp: 70, r: 25, l: 'Every debt must be repaid, to the last knot!' }, t: 'An Auditor blocks the longhouse. He wants every knot cancelled and every bond closed. Win the argument: Gift beats Freedom, Freedom beats Face, Face beats Gift.' },
 { t: 'Above the beam hangs the Ninth cord, thick as an arm, its last length unknotted. Nothing gave the first gift. Who is owed?', c: [['Touch the cord', {}], ['Look away (+5 knots)', { g: 5 }]] },
 { k: 'duel', e: { n: 'Salt Wraith', hp: 100, r: 30, l: 'I am the one before. Pay me.' }, t: 'The salt rises into the shape of the one before, demanding to be repaid.' },
 { shop: 1, t: 'The night before the Choosing. Kesh says: everyone is kind to me in a way that has a shape.' },
 { k: 'barter', e: { n: 'The Ring', hp: 90, r: 40, l: 'Someone must carry the cord.' }, t: 'Nine villages stand in a ring, and the hands are withdrawing from Kesh. Offer knots until the ring’s resolve breaks.' },
 { k: 'duel', e: { n: 'The Rite', hp: 160, r: 0, l: 'It was always done this way.' }, t: 'On the white of the dead lake the old rite itself stands: tradition that wants a body.' },
 { end: 1 }];
const rnd = n => Math.floor(Math.random() * n), pick = a => a[rnd(a.length)];
class Game {
  constructor() { this.n = 0; this.li = 0; this.state = { sc: -1, players: [], turn: 0, enemy: null, log: [], k: 'ch', ch: [], items: ITEMS }; this.go(0); }
  L(w, m) { const l = this.state.log; l.push({ i: ++this.li, w, m }); if (l.length > 40) l.shift(); }
  addPlayer(name, hero) { hero = H[hero] ? hero : 'ilse'; const id = ++this.n;
    this.state.players.push({ id, n: name || H[hero].n, h: hero, hp: H[hero].hp, max: H[hero].hp, g: 20, d: 0, at: 0, mk: 0, cd: 0, gd: 0 }); return id; }
  drop(id) { const s = this.state; s.players = s.players.filter(p => p.id !== id); if (s.turn >= s.players.length) s.turn = 0; }
  go(n) { const s = this.state, c = SC[n]; s.sc = n; s.enemy = null; s.ch = [];
    if (c.end) { const D = s.players.reduce((a, p) => a + p.d, 0), G = s.players.reduce((a, p) => a + p.g, 0);
      s.k = 'end'; this.L('n', (D ? `Unpaid debts of ${D} knots follow you across the white.` : 'You leave owing only what you chose to owe: a road, not a debt.') + ` The party carries ${G} knots. The rite is broken, and whoever is nearest is no longer spared. The end.`); return; }
    s.k = c.shop ? 'shop' : c.k || 'ch'; if (c.c) s.ch = c.c.map(o => o[0]);
    if (c.k) s.enemy = { ...c.e, max: c.e.hp, k: c.k, st: pick(['gift', 'free', 'face']), last: 0 };
    this.L('n', c.t); if (c.k) this.L('e', c.e.l); }
  act(pid, a) { const s = this.state, p = s.players.find(x => x.id === pid); if (!p || !a) return;
    if (a.a === 'switch') { s.turn = (s.turn + 1) % s.players.length; return; }
    if (a.a === 'restart') { const ps = s.players; Object.assign(this, new Game()); this.state.players = ps.map(q => ({ ...q, hp: q.max, g: 20, d: 0, mk: 0, cd: 0, gd: 0 })); this.n = Math.max(0, ...ps.map(q => q.id)); return; }
    if (s.enemy) { if (s.players[s.turn] === p && p.hp > 0) this.fight(p, a); return; }
    const c = SC[s.sc];
    if (c.shop) {
      if (a.a === 'buy' && ITEMS[a.i] && p.g >= ITEMS[a.i][1]) { p.g -= ITEMS[a.i][1]; if (a.i === 0) p.hp = Math.min(p.max, p.hp + 30); if (a.i === 1) p.at += 3; if (a.i === 2) { p.max += 10; p.hp += 10; } }
      else if (a.a === 'borrow') { p.g += 30; p.d += 40; }
      else if (a.a === 'repay') { const n = Math.min(p.g, p.d); p.g -= n; p.d -= n; }
      else if (a.a === 'leave') this.go(s.sc + 1);
    } else if (c.c && a.a === 'ch' && c.c[a.i]) { const o = c.c[a.i][1]; p.g += o.g || 0; p.d += o.d || 0; this.go(s.sc + 1); }
  }
  fight(p, a) { const s = this.state, e = s.enemy, h = H[p.h]; let d = 0;
    if (e.k === 'duel') {
      if (a.a === 'atk') { d = h.atk + p.at + rnd(5); if (p.mk) { d *= 2; p.mk = 0; } this.L(p.h, `${p.n} strikes for ${d}.`); }
      else if (a.a === 'guard') { p.gd = 1; this.L(p.h, `${p.n} guards.`); }
      else if (a.a === 'sk' && p.cd === 0) { p.cd = 3; this.L(p.h, h.say);
        if (p.h === 'ilse') p.mk = 1; if (p.h === 'kesh') d = e.last || 12;
        if (p.h === 'teodra') s.players.forEach(q => { if (q.hp > 0) q.hp = Math.min(q.max, q.hp + 15); }); if (p.h === 'anwe') p.g += 20; }
      else return;
    } else if (e.k === 'debate' && a.a === 'arg') {
      if (BEATS[a.s] === e.st) { d = 25; this.L(p.h, `${p.n}’s ${a.s} argument lands.`); } else if (a.s === e.st) { d = 10; this.L(p.h, 'A stalemate.'); } else { p.hp = Math.max(0, p.hp - 8); this.L('e', 'Your argument is turned against you.'); }
    } else if (e.k === 'barter' && a.a === 'offer') { const n = Math.min(+a.n || 0, p.g); if (n <= 0) return; p.g -= n; d = n; this.L(p.h, `${p.n} offers ${n} knots.`); }
    else return;
    e.hp -= d; e.last = d || e.last;
    if (e.hp <= 0) { s.players.forEach(q => { q.g += e.r; q.hp = Math.min(q.max, Math.max(q.hp, 1) + 10); q.cd = 0; }); this.L('n', `${e.n} yields. Each of you gains ${e.r} knots.`); this.go(s.sc + 1); return; }
    const alive = s.players.filter(q => q.hp > 0), nx = s.players.findIndex((q, i) => i > s.turn && q.hp > 0);
    if (nx >= 0) { s.turn = nx; return; }
    const t = pick(alive); if (t) { let x = e.k === 'duel' ? 12 + rnd(8) : e.k === 'debate' ? 8 + rnd(5) : 6; if (t.gd) { x = Math.ceil(x / 2); } t.hp = Math.max(0, t.hp - x); this.L('e', `${e.n} hits ${t.n} for ${x}.`); }
    s.players.forEach(q => { q.gd = 0; if (q.cd) q.cd--; });
    e.st = pick(['gift', 'free', 'face']);
    if (!s.players.some(q => q.hp > 0)) { this.L('n', 'You fall, and are carried back by the ring. Half your knots are lost.'); s.players.forEach(q => { q.hp = Math.ceil(q.max / 2); q.g = Math.floor(q.g / 2); }); e.hp = e.max; }
    s.turn = Math.max(0, s.players.findIndex(q => q.hp > 0));
  }
}
const out = { Game, H }; if (typeof module !== 'undefined') module.exports = out; else R.NG = out;
})(typeof window !== 'undefined' ? window : {});
