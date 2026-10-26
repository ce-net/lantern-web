# lantern-web

Frontend for Lantern, a neighbourhood events app. Backend: [ce-net/lantern-api](https://github.com/ce-net/lantern-api).

## Run

1. Start the backend, e.g. `PORT=18081 npm start` in lantern-api.
2. Serve this folder (e.g. `python3 -m http.server 8000`) and open it. The API base is set in `config.js` (default `http://localhost:18081`).

Features: list events, create an event, RSVP by name.

## API contract (agreed with the backend)

- `GET /api/events` -> `[Event]`
- `POST /api/events {title, when, where, description?}` -> `201 Event`
- `GET /api/events/:id` -> `Event | 404`
- `POST /api/events/:id/rsvp {name}` -> `{eventId, attendees}` (idempotent per name)
- `GET /health` -> `{ok:true}`
- Event: `{id, title, when (ISO), where, description, attendees: [names], createdAt}`; errors: `{error}`
