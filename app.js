// Lantern frontend. Talks to lantern-api (see README for the contract).
// Override the backend with ?api=http://host:port
const API = new URLSearchParams(location.search).get("api") || "http://localhost:18080";

const list = document.getElementById("events");
const status = document.getElementById("status");
const form = document.getElementById("new-event");

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function api(path, body) {
  const res = await fetch(API + path, body === undefined ? {} : {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function show(msg, isError) {
  status.textContent = msg;
  status.className = isError ? "error" : "";
}

function render(events) {
  if (!events.length) { list.innerHTML = "<li class=empty>No events yet. Add the first one.</li>"; return; }
  list.innerHTML = events.map((e) => `
    <li data-id="${esc(e.id)}">
      <b>${esc(e.title)}</b><br>
      <small>${esc(new Date(e.when).toLocaleString())} · ${esc(e.where)}</small>
      ${e.description ? `<p>${esc(e.description)}</p>` : ""}
      <form class="rsvp">
        <input name="name" placeholder="Your name" required>
        <button>RSVP</button>
        <span class="count">${Number(e.rsvpCount) || 0} going</span>
      </form>
    </li>`).join("");
}

async function load() {
  try { render(await api("/events")); }
  catch (err) { show(`Could not reach the backend at ${API}: ${err.message}`, true); }
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const f = new FormData(form);
  const body = {
    title: f.get("title").trim(),
    when: new Date(f.get("when")).toISOString(),
    where: f.get("where").trim(),
  };
  const description = f.get("description").trim();
  if (description) body.description = description;
  try {
    const e = await api("/events", body);
    form.reset();
    show(`Added "${e.title}".`);
    load();
  } catch (err) { show(`Could not add the event: ${err.message}`, true); }
});

list.addEventListener("submit", async (ev) => {
  if (!ev.target.matches(".rsvp")) return;
  ev.preventDefault();
  const id = ev.target.closest("li").dataset.id;
  const name = new FormData(ev.target).get("name").trim();
  if (!name) return show("Please enter your name to RSVP.", true);
  try {
    await api(`/events/${encodeURIComponent(id)}/rsvp`, { name });
    show(`You're going, ${name}!`);
    load();
  } catch (err) { show(`Could not RSVP: ${err.message}`, true); }
});

load();
