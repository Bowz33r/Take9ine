# The Ninth Gift

A turn-based adventure and fighting game of owing, belonging and the rite that asks for one body. Up to 4 players, each a hero: Ilse, Kesh, Teodra, Anwe.

- **Fights:** Duel (strike, guard, skill), Debate (Gift beats Freedom, Freedom beats Face, Face beats Gift) and Barter (spend knots to break the ring's resolve).
- **Economy:** knots are earned in fights and spent at shops; you can borrow knots at 40 percent interest and repay them. Unpaid debt changes the ending.
- **Voices:** each character and the narrator get a distinct pitch, rate and system voice via the browser's speech synthesis.

## Play
**Solo / hot-seat (no install):** open `public/index.html`, or deploy to GitHub Pages (below).

**WLAN, phones and TV:**
```
npm install
npm start
```
1. The host runs the server on a laptop and allows it through the firewall (port 3000).
2. Everyone on the same Wi-Fi opens `http://<host-laptop-ip>:3000` (the lobby shows detected addresses).
3. Laptops and phones: pick a hero, leave the room blank to host or enter the 4-letter code to join.
4. TV or monitor: open the same address in its browser and choose "Be the shared TV screen"; enter the room code. Phones then act as controllers.

## Publish on GitHub
```
git init && git add . && git commit -m "The Ninth Gift"
git branch -M main && git remote add origin https://github.com/<you>/the-ninth-gift.git && git push -u origin main
```
In Settings > Pages set Source to GitHub Actions. The workflow in `.github/workflows` publishes `public/` (solo and hot-seat only; GitHub Pages cannot run the server).

## Before release
Fill in the [BRACKETED] fields in `public/legal.html` and `LICENSE`, and have a lawyer review the terms for your jurisdiction.

## World mode: The Seven Cities
Open `world.html` (link in the lobby). Seven cities, villager NPCs (talk, trade, inns), trolls in every city (duel, debate or barter fights), 15 individual storylines of 3 steps each, and up to 68 players per room with gifting, sparring and city chat. Offline play works on GitHub Pages; online rooms need `npm start`. Each storyline has its own voice profile.

## Vehicles, proximity chat, ownership lock
Finish a story step to claim a city vehicle; pay 20 knots to secure it (unsecured vehicles are lost on defeat or when you lose a spar). Chat only carries 30 map units. See OWNERSHIP.md to seal the game.
