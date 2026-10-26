// Lantern frontend. Talks to lantern-api (see README for the contract).
const API = window.LANTERN_API;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

function status(msg, isError) {
  $("#status").textContent = msg || "";
  $("#status").className = isError ? "error" : "";
}

function render(events) {
  events.sort((a, b) => Date.parse(a.when) - Date.parse(b.when));
  $("#events").innerHTML = events.length ? events.map((e) => `
    <li data-id="${esc(e.id)}">
      <b>${esc(e.title)}</b><br>
      <small>${esc(new Date(e.when).toLocaleString())} · ${esc(e.where)}</small>
      ${e.description ? `<p>${esc(e.description)}</p>` : ""}
      <div class="rsvp">
        <button class="rsvp-btn">I'm going</button>
        <span class="attendees">${e.attendees?.length ? esc(e.attendees.join(", ")) : "No one yet"}</span>
      </div>
    </li>`).join("") : "<li>No events yet. Create the first one!</li>";
}

async function load() {
  try {
    render(await api("/api/events"));
    status("");
  } catch (err) {
    status(`Could not load events: ${err.message}`, true);
  }
}

$("#new-event").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const data = Object.fromEntries(new FormData(f));
  data.when = new Date(data.when).toISOString();
  if (!data.description) delete data.description;
  try {
    await api("/api/events", { method: "POST", body: JSON.stringify(data) });
    f.reset();
    await load();
    status("Event created.");
  } catch (err) {
    status(`Could not create event: ${err.message}`, true);
  }
});

$("#events").addEventListener("click", async (ev) => {
  if (!ev.target.matches(".rsvp-btn")) return;
  const li = ev.target.closest("li");
  const name = $("#name").value.trim();
  if (!name) { status("Enter your name first.", true); $("#name").focus(); return; }
  localStorage.setItem("lantern-name", name);
  try {
    const r = await api(`/api/events/${encodeURIComponent(li.dataset.id)}/rsvp`,
      { method: "POST", body: JSON.stringify({ name }) });
    li.querySelector(".attendees").textContent = r.attendees.join(", ");
    status(`RSVP saved for ${name}.`);
  } catch (err) {
    status(`Could not RSVP: ${err.message}`, true);
  }
});

$("#name").value = localStorage.getItem("lantern-name") || "";
load();
