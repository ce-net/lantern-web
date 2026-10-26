# lantern-web

Frontend for Lantern, a neighbourhood events app. Plain HTML/JS, no build step.

## Run

1. Start the backend ([ce-net/lantern-api](https://github.com/ce-net/lantern-api)): `PORT=18081 npm start`
2. Open `index.html` in a browser (or serve the folder with any static server).

The page talks to `http://localhost:18081` by default. Point it elsewhere with
`?api=http://host:port` in the URL, or `localStorage.setItem("lantern.api", "http://host:port")`.

## Features

- Lists events from the API, sorted by date
- Add an event (title, when, where, optional description)
- RSVP to an event by name; shows who is going

## API used

| Method | Path                   | Body                                 |
| ------ | ---------------------- | ------------------------------------ |
| GET    | `/api/events`          | —                                    |
| POST   | `/api/events`          | `{title, when, where, description?}` |
| POST   | `/api/events/:id/rsvp` | `{name}`                             |

Event: `{id, title, when (ISO date), where, description, attendees: [name], createdAt}`.
Errors: `{"error": "message"}`.
