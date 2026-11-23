// Authoritative game server for WLAN play. Run: npm start
const express = require('express'), http = require('http'), os = require('os');
const { WebSocketServer } = require('ws');
const { Game } = require('./public/engine.js');
const { World } = require('./public/world.js');
const integrity = require('./tools/seal.js').verify();
console.log('Integrity:', integrity);
if ((integrity === 'modified' || integrity === 'bad-signature') && !process.env.ALLOW_MODIFIED) { console.error('Refusing to host: files differ from the owner\'s signed seal. Set ALLOW_MODIFIED=1 only for local development.'); process.exit(1); }
const app = express();
app.get('/integrity', (q, r) => r.json({ state: integrity })); app.use(express.static('public'));
app.get('/info', (q, r) => r.json(Object.values(os.networkInterfaces()).flat().filter(i => i.family === 'IPv4' && !i.internal).map(i => i.address)));
const srv = http.createServer(app), wss = new WebSocketServer({ server: srv }), rooms = {};
const push = (r, code) => r.c.forEach(c => c.readyState === 1 && c.send(JSON.stringify({ t: 'state', code, you: c.pid, s: r.w ? r.g.view(c.pid) : r.g.state })));
wss.on('connection', ws => {
  ws.on('message', m => {
    let d; try { d = JSON.parse(m); } catch { return; }
    if (d.t === 'join') {
      if (d.accepted !== 1) return ws.send(JSON.stringify({ t: 'err', m: 'You must accept the Terms and Disclaimers first.' }));
      const code = String(d.room || '').toUpperCase().slice(0, 4) || Math.random().toString(36).slice(2, 6).toUpperCase();
      const wm = d.mode === 'world';
      const r = rooms[code] || (rooms[code] = { g: wm ? new World() : new Game(), c: new Set(), w: wm });
      if (r.w !== wm) return ws.send(JSON.stringify({ t: 'err', m: 'That room code is in the other game mode.' }));
      if (!d.tv && (r.w ? Object.keys(r.g.P).length >= 68 : r.g.state.players.length >= 4)) return ws.send(JSON.stringify({ t: 'err', m: 'Room is full.' }));
      ws.room = r; ws.code = code; r.c.add(ws);
      if (!d.tv) ws.pid = r.g.addPlayer(String(d.name || '').slice(0, 16), d.hero, d.story);
      push(r, code);
    } else if (ws.room && ws.pid != null) { ws.room.g.act(ws.pid, d); push(ws.room, ws.code); }
  });
  ws.on('close', () => {
    const r = ws.room; if (!r) return;
    r.c.delete(ws); if (ws.pid != null) r.g.drop(ws.pid);
    if (!r.c.size) delete rooms[ws.code]; else push(r, ws.code);
  });
});
const P = process.env.PORT || 3000;
srv.listen(P, '0.0.0.0', () => console.log(`The Ninth Gift: http://localhost:${P}  (LAN: see /info)`));
