const BENEFITS = [
  "Every deed that begins with the Basmala becomes blessed.",
  "The Basmala is the key to the door of mercy and peace.",
  "By mentioning Allah's name, one attains Divine care and protection.",
  "The believer finds peace in the remembrance of Allah.",
  "Every word that begins with the Basmala becomes auspicious.",
  "Bismillah connects the servant to the Sustainer.",
  "It is a declaration of dependence on Allah alone.",
  "The name of Allah placed before an act purifies intention.",
  "Bismillah brings barakah into time itself.",
  "It is the sunnah of the Prophets — begin every affair with His name.",
];

let state = {
  userId: null,
  currentStreak: 0,
  longestStreak: 0,
  totalDays: 0,
  todayCount: 0,
  lifetimeCount: 0,
};

function getUserId() {
  let id = localStorage.getItem("bismillah_user_id");
  if (!id) {
    id = "u_" + crypto.randomUUID();
    localStorage.setItem("bismillah_user_id", id);
  }
  return id;
}

function render() {
  document.getElementById("currentStreak").textContent = state.currentStreak;
  document.getElementById("todayCount").textContent = state.todayCount;
  document.getElementById("lifetimeCount").textContent =
    state.lifetimeCount > 999 ? (state.lifetimeCount / 1000).toFixed(1) + "k" : state.lifetimeCount;

  const visual = document.getElementById("todayVisual");
  visual.innerHTML = "";
  // Show up to 60 beads, then a "+N" chip
  const shown = Math.min(state.todayCount, 60);
  for (let i = 0; i < shown; i++) {
    const b = document.createElement("div");
    b.className = "bead";
    visual.appendChild(b);
  }
  if (state.todayCount > 60) {
    const chip = document.createElement("div");
    chip.className = "bead";
    chip.style.background = "var(--mid-green)";
    chip.style.color = "var(--gold-soft)";
    chip.style.display = "grid";
    chip.style.placeItems = "center";
    chip.style.fontSize = "9px";
    chip.style.fontWeight = "800";
    chip.textContent = "+" + (state.todayCount - 60);
    visual.appendChild(chip);
  }
}

function showBenefit() {
  const idx = state.totalDays % BENEFITS.length;
  document.getElementById("benefitText").textContent = BENEFITS[idx];
}

async function load() {
  try {
    const res = await fetch(`/api/streak?userId=${encodeURIComponent(state.userId)}`);
    const data = await res.json();
    if (data.success && data.data[0]) {
      const r = data.data[0];
      state.currentStreak = r.current_streak;
      state.longestStreak = r.longest_streak;
      state.totalDays = r.total_days;
      state.todayCount = r.today_count;
      state.lifetimeCount = r.lifetime_count;
      if (state.todayCount > 0) showBenefit();
    }
    render();
  } catch (e) {
    console.error("load failed", e);
    render();
  }
}

async function add(amount) {
  document.querySelectorAll(".quick").forEach((b) => (b.disabled = true));
  try {
    const res = await fetch("/api/streak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: state.userId, amount }),
    });
    const data = await res.json();
    if (data.success) {
      state.currentStreak = data.current_streak;
      state.longestStreak = data.longest_streak;
      state.totalDays = data.total_days;
      state.todayCount = data.today_count;
      state.lifetimeCount = data.lifetime_count;
      showBenefit();
      render();
    }
  } catch (e) {
    console.error("add failed", e);
  } finally {
    document.querySelectorAll(".quick").forEach((b) => (b.disabled = false));
  }
}

document.querySelectorAll(".quick").forEach((btn) => {
  btn.addEventListener("click", () => add(Number(btn.dataset.amount)));
});

state.userId = getUserId();
load();