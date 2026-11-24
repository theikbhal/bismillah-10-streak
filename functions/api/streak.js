function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function onRequestGet({ env, request }) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) return Response.json({ success: true, data: [] });
  try {
    const row = await env.DB.prepare(
      "SELECT * FROM streaks WHERE user_id = ?"
    ).bind(userId).first();
    if (!row) return Response.json({ success: true, data: [] });

    // Reset today_count if the stored date isn't today
    const today = todayStr();
    if (row.today_date !== today) {
      await env.DB.prepare(
        "UPDATE streaks SET today_count = 0, today_date = ? WHERE user_id = ?"
      ).bind(today, userId).run();
      row.today_count = 0;
      row.today_date = today;
    }
    return Response.json({ success: true, data: [row] });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function onRequestPost({ env, request }) {
  const { userId, amount = 1 } = await request.json();
  if (!userId) {
    return Response.json({ success: false, error: "userId required" }, { status: 400 });
  }
  const today = todayStr();
  const yesterday = yesterdayStr();

  try {
    const row = await env.DB.prepare(
      "SELECT * FROM streaks WHERE user_id = ?"
    ).bind(userId).first();

    if (!row) {
      // First ever check-in
      await env.DB.prepare(
        `INSERT INTO streaks
          (user_id, current_streak, longest_streak, last_checkin,
           total_days, today_count, today_date, lifetime_count)
         VALUES (?, 1, 1, ?, 1, ?, ?, ?)`
      ).bind(userId, today, amount, today, amount).run();
      return Response.json({
        success: true,
        current_streak: 1,
        longest_streak: 1,
        total_days: 1,
        today_count: amount,
        lifetime_count: amount,
        new_day: true,
      });
    }

    // If today hasn't been counted yet, advance the streak
    let currentStreak = row.current_streak;
    let totalDays = row.total_days;
    let newDay = false;

    if (row.last_checkin !== today) {
      newDay = true;
      totalDays += 1;
      currentStreak = row.last_checkin === yesterday ? row.current_streak + 1 : 1;
    }

    const todayCount =
      (row.today_date === today ? row.today_count : 0) + amount;
    const lifetime = row.lifetime_count + amount;
    const longest = Math.max(row.longest_streak, currentStreak);

    await env.DB.prepare(
      `UPDATE streaks SET
         current_streak = ?, longest_streak = ?, last_checkin = ?,
         total_days = ?, today_count = ?, today_date = ?, lifetime_count = ?
       WHERE user_id = ?`
    ).bind(
      currentStreak, longest, today, totalDays,
      todayCount, today, lifetime, userId
    ).run();

    return Response.json({
      success: true,
      current_streak: currentStreak,
      longest_streak: longest,
      total_days: totalDays,
      today_count: todayCount,
      lifetime_count: lifetime,
      new_day: newDay,
    });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}