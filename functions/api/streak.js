export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return Response.json({ success: true, data: [] });
  try {
    const result = await env.DB.prepare(
      "SELECT * FROM streaks WHERE user_id = ?"
    ).bind(userId).all();
    return Response.json({ success: true, data: result.results });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const body = await request.json();
  if (!body.userId) {
    return Response.json({ success: false, error: "userId required" }, { status: 400 });
  }
  try {
    const existing = await env.DB.prepare(
      "SELECT * FROM streaks WHERE user_id = ?"
    ).bind(body.userId).first();

    if (existing && existing.last_checkin === new Date().toISOString().slice(0, 10)) {
      return Response.json({
        success: true,
        already_checked_in: true,
        current_streak: existing.current_streak,
        total_days: existing.total_days,
      });
    }

    const newStreak = (existing?.current_streak || 0) + 1;
    const total = (existing?.total_days || 0) + 1;
    const longest = Math.max(existing?.longest_streak || 0, newStreak);

    await env.DB.prepare(
      `INSERT INTO streaks (user_id, current_streak, longest_streak, total_days, last_checkin)
       VALUES (?, ?, ?, ?, date('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         current_streak = ?, longest_streak = ?, total_days = ?, last_checkin = date('now')`
    ).bind(body.userId, newStreak, longest, total, newStreak, longest, total).run();

    return Response.json({
      success: true,
      current_streak: newStreak,
      total_days: total,
      longest_streak: longest,
    });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}