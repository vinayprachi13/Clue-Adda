# Clue Adda v02

Responsive layout update and selectable subcategories. This is a complete source ZIP based on Clue Adda v1.

## What's new
- Desktop/TV layout uses viewport-height fitting with no page scrolling at common screen sizes and normal browser zoom; category cards use four columns and Host/Join are side by side.
- Mobile setup uses two-column category cards and permits vertical scrolling.
- Host setup order: Category -> Subcategory (one of five, or Surprise Me) -> Difficulty -> Create Room.
- The host's post-round new-board selector also supports category, subcategory, and difficulty.
- Existing word pools, gameplay rules, score preservation, multiplayer and QR joining are retained.

## Local run
Install Node.js 20+, then run `npm install`, `npm test`, `npm start` and visit http://localhost:3000.

## GitHub changes from v1
Replace `public/index.html`, `public/style.css`, `public/app.js`, and `server.js` with the v02 versions. Optionally replace README.md. `game.js`, `package.json`, and `test.mjs` are unchanged.

## Render
With auto-deploy enabled, committing to the connected main branch starts a new deploy. Otherwise use Render -> Manual Deploy -> Deploy latest commit.

## Important
Deploying to Render restarts the Node process. In-memory rooms and active sessions will be lost during the deployment. Test with a new room after deployment. The desktop zero-scroll layout targets normal browser zoom and standard laptop/TV viewports; unusually short windows and open browser toolbars can require compact adjustments.
