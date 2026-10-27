# lantern-web

Frontend for Lantern, a neighbourhood events app. Plain HTML/JS, no build step.

## Run

1. Start the backend ([lantern-api](https://github.com/ce-net/lantern-api)): `node server.js` (default port 18080, or set `PORT`).
2. Open `index.html`. To use a backend on a different address, add `?api=`, e.g.
   `index.html?api=http://localhost:18081`.

## Features

- Lists events from the backend
- Add-event form (title, date/time, place, optional description)
- RSVP by name on each event, with a live "N going" count

## API contract (agreed with lantern-api)

JSON only, no auth, CORS `*`.

- `GET /health` -> `{ok:true}`
- `GET /events` -> `[{id, title, when, where, description, rsvpCount}]`
- `POST /events {title, when, where, description?}` -> 201 event (400 on bad input)
- `GET /events/:id` -> event | 404
- `POST /events/:id/rsvp {name}` -> 201 `{id, eventId, name}` | 404; increments `rsvpCount`
- Errors: `{error: "..."}`. `when` is an ISO 8601 string; ids are integers.
