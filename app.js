// Lantern frontend. Talks to lantern-api (see README for the API contract).
// Override the backend with ?api=http://host:port or localStorage "lantern.api".
const API = (new URLSearchParams(location.search).get("api") ||
  localStorage.getItem("lantern.api") || "http://localhost:18081").replace(/\/+$/, "");

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function api(path, body) {
  const res = await fetch(API + path, body === undefined ? {} : {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function showStatus(msg, isError) {
  const el = $("#status");
  el.textContent = msg || "";
  el.className = isError ? "error" : "";
}

function fmtWhen(when) {
  const d = new Date(when);
  return Number.isNaN(d.getTime()) ? when :
    d.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function renderEvent(e) {
  const going = e.attendees || [];
  return `<li data-id="${esc(e.id)}">
    <b>${esc(e.title)}</b><br>
    <small>${esc(fmtWhen(e.when))} · ${esc(e.where)}</small>
    ${e.description ? `<p>${esc(e.description)}</p>` : ""}
    <div class="going">${going.length ? `Going (${going.length}): ${going.map(esc).join(", ")}` : "No one yet"}</div>
    <form class="rsvp"><input name="name" placeholder="Your name" required maxlength="80">
    <button>RSVP</button></form>
  </li>`;
}

async function loadEvents() {
  try {
    const events = await api("/api/events");
    events.sort((a, b) => String(a.when).localeCompare(String(b.when)));
    $("#events").innerHTML = events.length ? events.map(renderEvent).join("") : "<li>No events yet.</li>";
    showStatus("");
  } catch (err) {
    showStatus(`Could not reach the Lantern API at ${API}: ${err.message}`, true);
  }
}

$("#new-event").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const form = ev.target;
  const f = Object.fromEntries(new FormData(form));
  try {
    await api("/api/events", { title: f.title, when: f.when, where: f.where, description: f.description });
    form.reset();
    await loadEvents();
  } catch (err) {
    showStatus(`Could not create event: ${err.message}`, true);
  }
});

$("#events").addEventListener("submit", async (ev) => {
  if (!ev.target.matches("form.rsvp")) return;
  ev.preventDefault();
  const id = ev.target.closest("li").dataset.id;
  const name = ev.target.elements.namedItem("name").value;
  try {
    await api(`/api/events/${encodeURIComponent(id)}/rsvp`, { name });
    localStorage.setItem("lantern.name", name);
    await loadEvents();
  } catch (err) {
    showStatus(`Could not RSVP: ${err.message}`, true);
  }
});

// Prefill RSVP name fields with the last name used.
new MutationObserver(() => {
  const name = localStorage.getItem("lantern.name");
  if (name) document.querySelectorAll("form.rsvp input[name=name]").forEach((i) => { if (!i.value) i.value = name; });
}).observe($("#events"), { childList: true });

loadEvents();
