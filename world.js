// World mode: 7 cities, villagers, trolls, 15 individual storylines, up to 68 players per room.
(function (R) {
const H = (typeof module !== 'undefined' ? require('./engine.js') : R.NG).H;
const C = [
 { n: 'Saltgate', l: 'Where the white road meets the market.', v: ['Marta the salt-weigher', 'Old Pim'] },
 { n: 'Cordhall', l: 'Four thousand knotted cords hang here.', v: ['Ledger-boy Tau', 'Sister Orla'] },
 { n: 'Millet Cross', l: 'Granaries, gossip and an honest inn.', v: ['Baker Neve', 'Drover Hask'] },
 { n: 'Greywater', l: 'A dead river town that still keeps its bridges.', v: ['Ferrywoman Isa', 'Mender Joss'] },
 { n: 'Ninth Ridge', l: 'Wind, stone and the oldest cairns.', v: ['Shepherd Bram', 'Cairn-keeper Lue'] },
 { n: 'Tallow Reach', l: 'Lamp-makers who owe each other everything.', v: ['Chandler Ode', 'Widow Sef'] },
 { n: 'Whitelake', l: 'The dead lake, ringed by villages.', v: ['Elder Wen', 'Child Aru'] }];
const RUM = ['Nothing here is paid for; everything is owed.', 'The Ninth cord has no last knot.', 'Whoever is nearest is who you answer to.', 'Trolls only guard what someone left unpaid.', 'A gift with no direction is the strongest kind.'];
const TR = [['Bridge Troll', 'duel'], ['Ledger Troll', 'debate'], ['Toll Troll', 'barter']];
const S = ['The Ninth Gift', 'The Kesh Road', 'The Keeper’s Ledger', 'The Broker’s Silence', 'The Auditor’s Reckoning', 'The Salt Wraith’s Claim', 'The Weaver of Knots', 'The Exile’s Return', 'The Mimic’s Mask', 'The Heir of Cords', 'The Ferryman of Whitelake', 'The Millet Widow', 'The Last Founder', 'The Troll Treaty', 'The Open Hand'];
const route = i => [i % 7, (i + 2) % 7, (i + 4) % 7];
const VH = ['Salt Skiff', 'Ox-Cart', 'Ridge Glider', 'Lake Raft', 'Lamp-Wagon', 'Dune Strider', 'Ninth Crawler'], RANGE = 30;
const BEATS = { gift: 'free', free: 'face', face: 'gift' }, rnd = n => Math.floor(Math.random() * n), pick = a => a[rnd(a.length)], ST = ['gift', 'free', 'face'];
class World {
  constructor() { this.n = 0; this.li = 0; this.P = {}; this.cl = C.map(() => []); }
  l(p, m, w) { p.l.push({ i: ++this.li, m, w: w || 'n' }); if (p.l.length > 12) p.l.shift(); }
  say(c, m, p) { this.cl[c].push({ m, x: p ? p.x : 50, y: p ? p.y : 50 }); if (this.cl[c].length > 30) this.cl[c].shift(); }
  addPlayer(name, hero, si) { hero = H[hero] ? hero : 'ilse'; si = Math.max(0, Math.min(14, +si || 0)); const id = ++this.n, h = H[hero];
    const p = this.P[id] = { id, n: String(name || h.n).slice(0, 16), h: hero, hp: h.hp, max: h.hp, g: 30, d: 0, at: 0, gd: 0, city: 0, x: 50, y: 50, v: [], si, q: 0, done: 0, w: 0, f: null, t: {}, l: [] };
    this.l(p, `Your storyline: ${S[si]}. First stop: ${C[route(si)[0]].n}.`); this.say(0, `${p.n} arrives.`); return id; }
  drop(id) { delete this.P[id]; }
  start(p, f) { p.f = { ...f, max: f.hp, st: pick(ST) }; this.l(p, `${f.n} (${f.k}) blocks your way.`, 'T:' + f.n); }
  act(id, a) { const p = this.P[id]; if (!p || !a) return;
    if (p.f) { if (a.a === 'flee') { p.g = Math.max(0, p.g - 5); p.f = null; this.l(p, 'You flee. -5 knots.'); } else this.fight(p, a); return; }
    const T = this.P[+a.to], here = T && T !== p && T.city === p.city && Math.hypot(T.x - p.x, T.y - p.y) <= RANGE, n = Math.max(0, Math.min(+a.n || 0, p.g));
    switch (a.a) {
      case 'go': { const c = +a.i, fee = p.v.length ? 2 : 5; if (c >= 0 && c < 7 && c !== p.city && p.g >= fee) { p.g -= fee; p.city = c; p.x = p.y = 50; this.say(c, `${p.n} arrives.`); this.l(p, `${C[c].n}. ${C[c].l}`); } break; }
      case 'talk': { const v = C[p.city].v[+a.i], k = p.city + ':' + a.i; if (!v) break; this.l(p, `${v}: “${RUM[(p.city + +a.i) % 5]}”`, 'V:' + p.city + a.i); if (!p.t[k]) { p.t[k] = 1; p.g += 3; this.l(p, 'They press 3 knots on you. You owe them a kindness.'); } break; }
      case 'buy': if (a.i === 0 && p.g >= 15) { p.g -= 15; p.hp = Math.min(p.max, p.hp + 30); } if (a.i === 1 && p.g >= 30) { p.g -= 30; p.at += 3; } if (a.i === 2 && p.g >= 10) { p.g -= 10; p.hp = p.max; } break;
      case 'borrow': p.g += 30; p.d += 40; break;
      case 'repay': { const m = Math.min(p.g, p.d); p.g -= m; p.d -= m; break; }
      case 'hunt': this.start(p, { n: `${C[p.city].n} ${TR[p.city % 3][0]}`, k: TR[p.city % 3][1], hp: 50 + 6 * p.city + 4 * Math.min(p.w, 10), r: 15 + 2 * p.city }); break;
      case 'quest': { if (p.done) { this.l(p, 'Your storyline is complete.'); break; } const rt = route(p.si);
        if (rt[p.q] !== p.city) this.l(p, `Your story calls you to ${C[rt[p.q]].n}.`);
        else this.start(p, { n: `Shade of ${S[p.si]}`, k: TR[(p.si + p.q) % 3][1], hp: 50 + 20 * p.q, r: 30 + 10 * p.q, q: 1 }); break; }
      case 'gift': if (here && n) { p.g -= n; T.g += n; this.l(p, `You gift ${n} knots to ${T.n}.`); this.l(T, `${p.n} gifts you ${n} knots.`); } break;
      case 'spar': { const w = Math.min(n, T ? T.g : 0); if (!here || !w) break; const x = H[p.h].atk + p.at + rnd(10), y = H[T.h].atk + T.at + rnd(10), W = x >= y ? [p, T] : [T, p];
        W[0].g += w; W[1].g -= w; const vi = W[1].v.findIndex(x => !x.sec); if (vi >= 0) W[0].v.push(...W[1].v.splice(vi, 1)); this.say(p.city, `${p.n} spars ${T.n} for ${w}: ${W[0].n} wins.`, p); break; }
      case 'move': { p.x = Math.max(0, Math.min(100, p.x + 10 * Math.sign(+a.dx || 0))); p.y = Math.max(0, Math.min(100, p.y + 10 * Math.sign(+a.dy || 0))); break; }
      case 'secure': { const v = p.v[+a.i]; if (v && !v.sec && p.g >= 20) { p.g -= 20; v.sec = 1; this.l(p, `The ${v.n} is secured in the garage.`); } break; }
      case 'say': this.say(p.city, `${p.n}: ${String(a.text || '').slice(0, 80)}`, p); break; } }
  fight(p, a) { const f = p.f, h = H[p.h]; let d = 0;
    if (f.k === 'duel') { if (a.a === 'atk') { d = h.atk + p.at + rnd(5); if (!rnd(3)) this.l(p, h.say, p.h); } else if (a.a === 'guard') p.gd = 1; else return; }
    else if (f.k === 'debate') { if (a.a !== 'arg') return; if (BEATS[a.s] === f.st) d = 22; else if (a.s === f.st) d = 9; else p.hp -= 8; }
    else { const n = Math.min(+a.n || 0, p.g); if (a.a !== 'offer' || n <= 0) return; p.g -= n; d = n; }
    f.hp -= d;
    if (f.hp <= 0) { p.f = null; p.g += f.r; p.w++; p.hp = Math.min(p.max, p.hp + 10); this.l(p, `${f.n} yields. +${f.r} knots.`);
      if (f.q) { const vn = VH[p.city]; if (!p.v.some(x => x.n === vn)) { p.v.push({ n: vn, sec: 0 }); this.l(p, `Mission complete. You claim the ${vn}. Secure it (20 knots) before it is lost.`); } p.q++; if (p.q >= 3) { p.done = 1; p.g += 100; this.l(p, `Storyline complete: ${S[p.si]}. +100 knots.`); this.say(p.city, `${p.n} completed ${S[p.si]}!`); } else this.l(p, `Next: ${C[route(p.si)[p.q]].n}.`); } return; }
    let x = f.k === 'duel' ? 10 + rnd(6) : f.k === 'debate' ? 6 : 5; if (p.gd) { x = Math.ceil(x / 2); p.gd = 0; } p.hp -= x; f.st = pick(ST);
    if (p.hp <= 0) { p.hp = Math.ceil(p.max / 2); p.g = Math.floor(p.g / 2); p.f = null; p.city = 0; p.x = p.y = 50; p.v = p.v.filter(x => x.sec); this.l(p, 'You fall and wake in Saltgate. Half your knots and your unsecured vehicles are gone.'); } }
  view(id) { const p = this.P[id], ps = Object.values(this.P);
    return { n: ps.length, top: ps.slice().sort((a, b) => b.g - a.g).slice(0, 5).map(x => [x.n, x.g]), cities: C.map((c, i) => ps.filter(x => x.city === i).length), me: p || null,
      here: p ? ps.filter(x => x.city === p.city && x !== p).map(x => ({ id: x.id, n: x.n, h: x.h, x: x.x, y: x.y, near: Math.hypot(x.x - p.x, x.y - p.y) <= RANGE })) : [],
      chat: p ? this.cl[p.city].filter(o => Math.hypot(o.x - p.x, o.y - p.y) <= RANGE).map(o => o.m) : [] }; } }
const out = { World, C, S, route, VH }; if (typeof module !== 'undefined') module.exports = out; else R.NW = out;
})(typeof window !== 'undefined' ? window : {});
