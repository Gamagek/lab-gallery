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
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      display_name TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'approved',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_comments_slug
    ON comments(slug, created_at DESC)
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
      SELECT id, display_name, body, created_at
      FROM comments
      WHERE slug = ?
        AND status = 'approved'
      ORDER BY id DESC
      LIMIT 100
    `).bind(slug).all();

    return json({ comments: result.results || [] });
  } catch (error) {
    console.error("GET /api/comments failed", error);
    return json({ error: "Comments database request failed" }, 500);
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
    const displayName = cleanText(data.displayName, 40);
    const body = cleanText(data.body, 1000);

    if (!slug || !displayName || body.length < 2) {
      return json({ error: "Name and comment are required." }, 400);
    }

    await ensureSchema(db);

    const result = await db.prepare(`
      INSERT INTO comments (slug, display_name, body)
      VALUES (?, ?, ?)
    `).bind(slug, displayName, body).run();

    return json({
      ok: true,
      id: result.meta?.last_row_id || null,
      message: "Comment saved"
    }, 201);
  } catch (error) {
    console.error("POST /api/comments failed", error);
    return json({ error: "Comment could not be saved" }, 500);
  }
}
