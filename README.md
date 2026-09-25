# Golf Event Scoring Template

A reusable template for live golf event scoring — a static web app on GitHub Pages, backed
by a Firebase Realtime Database. Fork this repo for each new event, point it at a fresh
Firebase project, and set the event up from the commissioner console; no other code changes
needed.

- Players: https://phodgman22.github.io/golf-event-template/
- Commissioner console: https://phodgman22.github.io/golf-event-template/admin.html

**Full technical reference:** [HANDOFF.md](HANDOFF.md) — architecture, data model, every
format and setting, and the bugs already found and fixed (don't reintroduce them).

To start a new event from this template:
1. Create a new Firebase Realtime Database project and paste its config into
   `firebase-config.js`; deploy `database.rules.json` to it.
2. Set a real `ADMIN_PIN` in `admin-pins.js`.
3. Set up the event from the commissioner console — event name, courses, roster, rounds.

Run locally with `node serve.js`, then open http://localhost:8765. Scoring tests:
`node tests/run.mjs`.
