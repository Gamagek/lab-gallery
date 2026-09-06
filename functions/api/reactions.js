let schemaReady = false;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

async function ensureSchema(db) {
  if (schemaReady) return;

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      reaction TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(slug, visitor_id, reaction)
    )
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_reactions_slug
    ON reactions(slug)
  `).run();

  schemaReady = true;
}

export async function onRequestGet(context) {
  try {
    const db = context.env?.DB;

    if (!db) {
      return json({
        error: "D1 binding DB is missing. In Cloudflare Pages, bind your D1 database with variable name DB."
      }, 500);
    }

    await ensureSchema(db);

    const url = new URL(context.request.url);
    const slug = cleanText(url.searchParams.get("slug") || "", 150);

    if (!slug) {
      return json({ error: "Missing page slug" }, 400);
    }

    const result = await db.prepare(`
      SELECT reaction, COUNT(*) AS total
      FROM reactions
      WHERE slug = ?
      GROUP BY reaction
    `).bind(slug).all();

    const counts = {
      useful: 0,
      accurate: 0,
      helpful: 0,
      love: 0
    };

    for (const row of result.results || []) {
      if (Object.prototype.hasOwnProperty.call(counts, row.reaction)) {
        counts[row.reaction] = Number(row.total || 0);
      }
    }

    return json(counts);
  } catch (error) {
    console.error("GET /api/reactions failed", error);
    return json({ error: "Reactions database request failed" }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const db = context.env?.DB;

    if (!db) {
      return json({
        error: "D1 binding DB is missing. In Cloudflare Pages, bind your D1 database with variable name DB."
      }, 500);
    }

    let data;
    try {
      data = await context.request.json();
    } catch {
      return json({ error: "Invalid JSON request" }, 400);
    }

    const slug = cleanText(data.slug, 150);
    const visitorId = cleanText(data.visitorId, 100);
    const reaction = cleanText(data.reaction, 30);
    const allowed = ["useful", "accurate", "helpful", "love"];

    if (!slug || !visitorId || !allowed.includes(reaction)) {
      return json({ error: "Invalid reaction" }, 400);
    }

    await ensureSchema(db);

    const existing = await db.prepare(`
      SELECT id
      FROM reactions
      WHERE slug = ?
        AND visitor_id = ?
        AND reaction = ?
      LIMIT 1
    `).bind(slug, visitorId, reaction).first();

    if (existing) {
      await db.prepare(`
        DELETE FROM reactions
        WHERE slug = ?
          AND visitor_id = ?
          AND reaction = ?
      `).bind(slug, visitorId, reaction).run();

      return json({ ok: true, action: "removed" });
    }

    await db.prepare(`
      INSERT INTO reactions (slug, visitor_id, reaction)
      VALUES (?, ?, ?)
    `).bind(slug, visitorId, reaction).run();

    return json({ ok: true, action: "added" }, 201);
  } catch (error) {
    console.error("POST /api/reactions failed", error);
    return json({ error: "Reaction could not be saved" }, 500);
  }
}
