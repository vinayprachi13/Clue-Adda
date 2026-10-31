# Clue Adda v1 — Test Build

Desi roots. Global celebrations. One epic game night.

## What is included
- Seven searchable categories, with Bollywood and 90s Nostalgia first.
- Five randomly selected named subcategories per category, with descriptions.
- Easy / Medium / Hard word pools (editorial first-pass; refine after playtesting).
- Server-side randomized 25-word boards, starting team and secret colors.
- Host, Red/Blue Spymasters and players with synchronized Socket.IO state.
- Host-only theme/difficulty changes after a game, or before starting; same room and cumulative scores.
- Play Again generates a new board from the same subcategory and difficulty while preserving scores.
- Per-device sound toggle and volume; host defaults on, other roles muted.
- Reduced/off motion setting, themed popup copy, and simple synthesized audio cues.

## Run locally
Install Node.js 20+ and run from the folder containing `package.json`:

```bash
npm install
npm test
npm start
```

Open http://localhost:3000 on your computer. To test with multiple browser windows on the same computer, use separate private/incognito profiles or separate browsers so each gets its own session. For phones, deploy to Render or access your computer's LAN IP on the same Wi-Fi, ensuring port 3000 is accessible.

## Deploy safely to Render
Keep the original Bhoot & Clues service as a backup. Create a **new** Web Service connected to a repository containing this folder's files at its root. Runtime: Node; Build Command: `npm install`; Start Command: `npm start`. Set Node version 20 or later. Render assigns the public URL if the name is available. Do not assume changing the old service's name changes its URL.

## Playtest checklist
1. Host creates room, selects Bollywood/Medium; confirm random subcategory and six-digit code.
2. Join on two phones as Red and Blue Spymasters, plus two as players. Verify both spymasters see the same secret colors and players do not.
3. Start, send clue, guess and pass. Check turn and card synchronization.
4. Guess Assassin; verify winner and score. Use Play Again; verify score stays and board changes.
5. Change category and difficulty; confirm room code, teams and score stay.
6. Test QR join, reconnect, mute, and a small phone screen.

## Known limitations / first-pass scope
- The game has **no persistence across server restarts**: Render restarts clear active rooms and scores.
- Difficulty is an editorial approximation, not calibrated by player testing. Some general words are reused between subcategories; new boards may overlap.
- The 20 new seasonal subcategory lists are first-pass content and should be reviewed through playtesting.
- Sounds are lightweight synthesized cues, not festival-specific audio recordings. Popup styling and motion are lightweight rather than fully illustrated fireworks/snow animations.
- No external image assets are used.
- This is based on the locally available Bhoot & Clues V9 archive, not a live fetch of the current GitHub repository.
