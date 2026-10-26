// Lantern frontend. Uses made-up data until there is a backend.
const MOCK = [
  { title: "Picnic in the park", date: "Saturday", place: "North park" },
  { title: "Bike repair cafe", date: "Sunday", place: "Old garage" },
];
document.getElementById("events").innerHTML = MOCK.map((e) =>
  `<li><b>${e.title}</b><br><small>${e.date} · ${e.place}</small></li>`).join("");
