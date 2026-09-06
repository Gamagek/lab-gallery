function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export async function onRequestGet(context) {
  try {
    const db = context.env?.DB;

    if (!db) {
      return json({
        ok: false,
        db: "missing",
        message: "D1 binding DB is missing. Bind your D1 database with variable name DB in Cloudflare Pages settings."
      }, 500);
    }

    const result = await db.prepare("SELECT 1 AS connected").first();

    return json({
      ok: result?.connected === 1,
      db: "connected",
      service: "lab-gallery community API"
    });
  } catch (error) {
    console.error("GET /api/health failed", error);
    return json({
      ok: false,
      db: "error",
      message: "D1 could not be queried"
    }, 500);
  }
}
