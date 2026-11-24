const BENEFITS = [
  "Every deed that begins with the Basmala becomes blessed. — Starting with Allah's name invites divine blessing into the action.",
  "The Basmala is the key to the door of mercy and peace. — It opens the heart to ar-Rahman and ar-Rahim.",
  "By mentioning Allah's name, one attains Divine care and protection. — A shield for the day ahead.",
  "The believer finds peace in the remembrance of Allah. — Anxiety is calmed through His name.",
  "Every word that begins with the Basmala becomes auspicious. — Speech and action are elevated.",
  "Bismillah connects the servant to the Sustainer. — No action is too small when it starts with His name.",
  "It is a declaration of dependence on Allah alone. — True strength begins with humility.",
  "The name of Allah placed before an act purifies intention. — The heart is reminded of its purpose.",
  "Bismillah brings barakah into time itself. — Moments become meaningful when dedicated to Him.",
  "It is the sunnah of the Prophets. — To begin every affair with the name of Allah is a timeless practice."
];

const TOTAL_DAYS = 10;

function getUserId() {
  let id = localStorage.getItem("bismillah_user_id");
  if (!id) {
    id = "u_" + crypto.randomUUID();
    localStorage.setItem("bismillah_user_id", id);
  }
  return id;
}

function renderDots(streak) {
  const dots = document.getElementById("dots");
  dots.innerHTML = "";
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = document.createElement("div");
    d.className = "dot" + (i < streak ? " filled" : "");
    dots.appendChild(d);
  }
  document.getElementById("current").textContent = streak;
}

async function loadStreak() {
  try {
    const res = await fetch(`/api/streak?userId=${encodeURIComponent(getUserId())}`);
    const data = await res.json();
    const streak = data.success && data.data[0] ? data.data[0].current_streak : 0;
    renderDots(streak % TOTAL_DAYS);
    if (data.success && data.data[0]?.last_checkin === todayStr()) {
      document.getElementById("checkinBtn").disabled = true;
      document.getElementById("checkinBtn").textContent = "✓ Already checked in today";
    }
  } catch {
    renderDots(0);
  }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

async function checkIn() {
  const btn = document.getElementById("checkinBtn");
  btn.disabled = true;
  try {
    const res = await fetch("/api/streak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: getUserId() }),
    });
    const data = await res.json();
    if (data.success) {
      renderDots(data.current_streak % TOTAL_DAYS);
      document.getElementById("benefitText").textContent =
        BENEFITS[data.total_days % BENEFITS.length];
      btn.textContent = "✓ Checked in — come back tomorrow";
    }
  } catch {
    btn.disabled = false;
  }
}

document.getElementById("checkinBtn").addEventListener("click", checkIn);
loadStreak();