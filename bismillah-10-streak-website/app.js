const GOAL = 10;
const STORAGE_KEY = "bismillah10.v1";
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const dateOffset = (offset) => {
  const d = new Date();
  d.setHours(12,0,0,0);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_) {}
  return { counts: {}, lastCount: 0 };
}
let data = load();
const $ = (id) => document.getElementById(id);
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function countToday() { return Number(data.counts[todayKey()] || 0); }
function completedDays() { return Object.values(data.counts).filter(n => Number(n) >= GOAL).length; }
function currentStreak() {
  let streak = 0;
  // A streak remains active today if today's goal is complete, or yesterday if today is not yet complete.
  let offset = countToday() >= GOAL ? 0 : -1;
  while (data.counts[dateOffset(offset)] >= GOAL) {
    streak++;
    offset--;
  }
  return streak;
}
function renderWeek() {
  const labels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  $("week").innerHTML = "";
  for (let offset = -6; offset <= 0; offset++) {
    const key = dateOffset(offset);
    const date = new Date(`${key}T12:00:00`);
    const done = Number(data.counts[key] || 0) >= GOAL;
    const day = document.createElement("div");
    day.className = "day";
    const dot = document.createElement("div");
    dot.className = `day-dot${done ? " done" : ""}${offset === 0 ? " today" : ""}`;
    dot.textContent = done ? "✓" : String(date.getDate());
    const label = document.createElement("span");
    label.textContent = labels[date.getDay()];
    day.append(dot, label);
    $("week").append(day);
  }
}
function render() {
  const count = countToday();
  $("count").textContent = count;
  $("progress-fill").style.width = `${Math.min(count / GOAL, 1) * 100}%`;
  $("progress").setAttribute("aria-valuenow", Math.min(count, GOAL));
  $("streak").textContent = currentStreak();
  $("days-completed").textContent = completedDays();
  $("undo-button").disabled = count <= 0;
  $("count-button").disabled = count >= GOAL;
  $("count-button").style.opacity = count >= GOAL ? ".65" : "1";
  $("status").textContent = count >= GOAL
    ? "Alhamdulillah! Today's 10-count goal is complete."
    : count === 0 ? "Begin with Bismillah." : `${GOAL - count} more to complete today's goal.`;
  renderWeek();
}
$("count-button").addEventListener("click", () => {
  const key = todayKey();
  const current = Number(data.counts[key] || 0);
  if (current >= GOAL) return;
  data.counts[key] = current + 1;
  save(); render();
});
$("undo-button").addEventListener("click", () => {
  const key = todayKey();
  data.counts[key] = Math.max(0, countToday() - 1);
  save(); render();
});
$("reset-button").addEventListener("click", () => {
  if (!confirm("Reset today's Bismillah count?")) return;
  data.counts[todayKey()] = 0;
  save(); render();
});
render();
