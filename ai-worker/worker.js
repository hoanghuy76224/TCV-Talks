// TCV Talks AI proxy: giữ Gemini API key ở phía Cloudflare, web chỉ gọi qua đây.
// Biến môi trường: GEMINI_KEY (secret, bắt buộc), MODEL (tuỳ chọn), ALLOW (tuỳ chọn, danh sách origin cách nhau dấu phẩy)
// Binding DB (D1) lưu hồ sơ học viên.
const DEF_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-3.1-flash-lite"];
const MAX_BODY = 4 * 1024 * 1024;
const GROQ_MODEL = "openai/gpt-oss-20b";

async function generateWithGroq(req, env, headers, prompt, json) {
  if (!env.GROQ_API_KEY || !env.GROQ_RATE_LIMIT) {
    return out({ error: "groq_unavailable" }, 503, headers);
  }

  try {
    const client = req.headers.get("CF-Connecting-IP") || "unknown";
    const { success } = await env.GROQ_RATE_LIMIT.limit({ key: client });
    if (!success) return out({ error: "rate_limited" }, 429, headers);

    const body = {
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: json ? 0.2 : 0.7,
      reasoning_effort: "low",
      max_completion_tokens: 1800
    };
    if (json) body.response_format = { type: "json_object" };
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.GROQ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    });
    if (response.status === 429) return out({ error: "rate_limited" }, 429, headers);
    if (!response.ok) return out({ error: "groq_upstream" }, 502, headers);
    const result = await response.json();
    const text = result.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) return out({ error: "empty_reply" }, 502, headers);
    return out({ text, model: GROQ_MODEL }, 200, headers);
  } catch (e) {
    return out({ error: "groq_upstream" }, 502, headers);
  }
}

function allowed(origin, env) {
  if (!origin) return false;
  if (origin === "https://hoctienganh.khunglongcon.com") return true;
  const list = (env.ALLOW || "").split(",").map(s => s.trim()).filter(Boolean);
  if (list.includes(origin)) return true;
  return /^https:\/\/([a-z0-9-]+\.)?tcv-talks\.pages\.dev$/.test(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

const out = (obj, status, h) =>
  new Response(JSON.stringify(obj), { status, headers: { ...h, "Content-Type": "application/json; charset=utf-8" } });

const SPEAKERS = new Set(["luna","orion","thalia","apollo","pandora","draco","theia","hyperion"]);

async function synthesize(req, env, headers) {
  if (req.method !== "POST") return out({ error: "method" }, 405, headers);
  if (!env.AI) return out({ error: "voice_unavailable" }, 503, headers);
  if (+(req.headers.get("Content-Length") || 0) > 8192) {
    return out({ error: "too_big" }, 413, headers);
  }

  let input;
  try { input = await req.json() } catch (e) { return out({ error: "bad_json" }, 400, headers) }
  const text = typeof input?.text === "string" ? input.text.trim() : "";
  if (!text || text.length > 1000 || !SPEAKERS.has(input?.speaker)) {
    return out({ error: "invalid_voice_input" }, 400, headers);
  }

  try {
    const audio = await env.AI.run("@cf/deepgram/aura-2-en", {
      text, speaker: input.speaker, encoding: "mp3"
    });
    return new Response(audio, {
      headers: { ...headers, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" }
    });
  } catch (e) {
    return out({ error: "voice_unavailable" }, 503, headers);
  }
}

async function transcribe(req, env, headers) {
  if (req.method !== "POST") return out({ error: "method" }, 405, headers);
  if (!env.AI) return out({ error: "transcription_unavailable" }, 503, headers);
  const limit = 650000;
  if (!req.body || +(req.headers.get("Content-Length") || 0) > limit) {
    return out({ error: "invalid_audio_size" }, 400, headers);
  }

  const reader = req.body.getReader();
  const bytes = new Uint8Array(limit);
  let size = 0;
  let audio;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (size + value.length > limit) {
        await reader.cancel();
        return out({ error: "too_big" }, 413, headers);
      }
      bytes.set(value, size);
      size += value.length;
    }
    audio = JSON.parse(new TextDecoder().decode(bytes.subarray(0, size))).audio;
  } catch (e) {
    return out({ error: "bad_json" }, 400, headers);
  } finally {
    reader.releaseLock();
  }
  if (typeof audio !== "string" || !audio.startsWith("UklGR") || /[^A-Za-z0-9+/=]/.test(audio)) {
    return out({ error: "invalid_audio" }, 400, headers);
  }

  try {
    const result = await env.AI.run("@cf/openai/whisper-large-v3-turbo", {
      audio, language: "en", task: "transcribe", vad_filter: true
    });
    return out({ text: result.text?.trim() || "" }, 200, { ...headers, "Cache-Control": "no-store" });
  } catch (e) {
    return out({ error: "transcription_unavailable" }, 503, headers);
  }
}

/* ---------- hồ sơ học viên: tên + mã PIN 4 số, lưu trong D1 ---------- */
const MAX_PROFILE = 300000;
const PIN_TRIES = 5, LOCK_MS = 15 * 60 * 1000;
let tableReady = null;
const initTable = env => tableReady ||= env.DB.exec(
  "CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL, data TEXT NOT NULL, ver INTEGER NOT NULL DEFAULT 1, fails INTEGER NOT NULL DEFAULT 0, locked_until INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL, updated INTEGER NOT NULL)"
).catch(e => { tableReady = null; throw e; });

const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
async function pinHash(salt, id, pin) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ":" + id + ":" + pin)));
}
function sameText(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function profileApi(req, env, headers, path) {
  if (req.method !== "POST") return out({ error: "method" }, 405, headers);
  if (!env.DB) return out({ error: "profile_unavailable" }, 503, headers);
  if (+(req.headers.get("Content-Length") || 0) > MAX_PROFILE + 2000) return out({ error: "too_big" }, 413, headers);
  let b;
  try { b = await req.json() } catch (e) { return out({ error: "bad_json" }, 400, headers) }
  const id = typeof b?.id === "string" ? b.id.trim().toLowerCase() : "";
  const pin = typeof b?.pin === "string" ? b.pin : "";
  if (!/^[a-z0-9_]{3,30}$/.test(id)) return out({ error: "bad_name" }, 400, headers);
  if (!/^\d{4}$/.test(pin)) return out({ error: "bad_pin" }, 400, headers);
  const no = { ...headers, "Cache-Control": "no-store" };

  try {
    await initTable(env);
    const now = Date.now();

    await env.DB.exec("CREATE TABLE IF NOT EXISTS recovery_codes (id TEXT PRIMARY KEY, hash TEXT NOT NULL, FOREIGN KEY(id) REFERENCES profiles(id))");
    if (path === "/profile/reset") {
      const code = typeof b.code === "string" ? b.code.replace(/[-\\s]/g, "").toLowerCase() : "";
      if (!/^[a-f0-9]{32}$/.test(code)) return out({ error: "bad_recovery" }, 401, no);
      const digest = await pinHash("recovery", id, code);
      const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
      const hash = await pinHash(salt, id, pin);
      const result = await env.DB.prepare("UPDATE profiles SET salt = ?, hash = ?, ver = ver + 1, fails = 0, locked_until = 0, updated = ? WHERE id = ? AND EXISTS (SELECT 1 FROM recovery_codes WHERE id = ? AND hash = ?)")
        .bind(salt, hash, now, id, id, digest).run();
      if (!result.meta.changes) return out({ error: "bad_recovery" }, 401, no);
      await env.DB.prepare("DELETE FROM recovery_codes WHERE id = ? AND hash = ?").bind(id, digest).run();
      return out({ok:true},200,no);
    }
    if (path === "/profile/create") {
      const data = JSON.stringify(b.data ?? {});
      if (data.length > MAX_PROFILE) return out({ error: "too_big" }, 413, no);
      const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
      const r = await env.DB.prepare(
        "INSERT OR IGNORE INTO profiles (id, salt, hash, data, ver, created, updated) VALUES (?, ?, ?, ?, 1, ?, ?)"
      ).bind(id, salt, await pinHash(salt, id, pin), data, now, now).run();
      if (!r.meta.changes) return out({ error: "name_taken" }, 409, no);
      return out({ ok: true, ver: 1 }, 200, no);
    }

    const row = await env.DB.prepare("SELECT salt, hash, data, ver, fails, locked_until FROM profiles WHERE id = ?").bind(id).first();
    if (!row) return out({ error: "bad_credentials" }, 401, no);
    if (row.locked_until > now) {
      return out({ error: "locked", wait: Math.ceil((row.locked_until - now) / 1000) }, 429, no);
    }
    if (!sameText(row.hash, await pinHash(row.salt, id, pin))) {
      const fails = row.fails + 1;
      if (fails >= PIN_TRIES) {
        await env.DB.prepare("UPDATE profiles SET fails = 0, locked_until = ? WHERE id = ?").bind(now + LOCK_MS, id).run();
        return out({ error: "locked", wait: LOCK_MS / 1000 }, 429, no);
      }
      await env.DB.prepare("UPDATE profiles SET fails = ? WHERE id = ?").bind(fails, id).run();
      return out({ error: "bad_credentials", left: PIN_TRIES - fails }, 401, no);
    }
    if (row.fails) await env.DB.prepare("UPDATE profiles SET fails = 0 WHERE id = ?").bind(id).run();

    if (path === "/profile/recovery") {
      const code = hex(crypto.getRandomValues(new Uint8Array(16)));
      const hash = await pinHash("recovery", id, code);
      await env.DB.prepare("INSERT INTO recovery_codes (id, hash) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET hash = excluded.hash").bind(id, hash).run();
      return out({ok:true,code},200,no);
    }
    if (path === "/profile/open") {
      let data = {};
      try { data = JSON.parse(row.data) } catch (e) {}
      return out({ ok: true, data, ver: row.ver }, 200, no);
    }

    if (path === "/profile/save") {
      const data = JSON.stringify(b.data ?? {});
      if (data.length > MAX_PROFILE) return out({ error: "too_big" }, 413, no);
      const r = await env.DB.prepare("UPDATE profiles SET data = ?, ver = ver + 1, updated = ? WHERE id = ? AND ver = ?")
        .bind(data, now, id, +b.ver || 0).run();
      if (!r.meta.changes) return out({ error: "conflict" }, 409, no);
      return out({ ok: true, ver: (+b.ver || 0) + 1 }, 200, no);
    }
    return out({ error: "not_found" }, 404, no);
  } catch (e) {
    return out({ error: "profile_unavailable" }, 503, no);
  }
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const ok = allowed(origin, env);
    const h = ok ? cors(origin) : {};
    if (req.method === "OPTIONS") return new Response(null, { status: ok ? 204 : 403, headers: h });
    const path = new URL(req.url).pathname;
    if (path === "/transcribe") {
      return ok ? transcribe(req, env, h) : out({ error: "origin" }, 403, h);
    }
    if (path.startsWith("/profile/")) {
      return ok ? profileApi(req, env, h, path) : out({ error: "origin" }, 403, h);
    }
    if (path === "/tts") {
      return ok ? synthesize(req, env, h) : out({ error: "origin" }, 403, h);
    }
    if (req.method === "GET") return out({
      ok: true,
      key: !!env.GEMINI_KEY,
      providers: { gemini: !!env.GEMINI_KEY, groq: !!(env.GROQ_API_KEY && env.GROQ_RATE_LIMIT) },
      profiles: !!env.DB
    }, 200, { ...h, "Cache-Control": "no-store" });
    if (req.method !== "POST") return out({ error: "method" }, 405, h);
    if (!ok) return out({ error: "origin" }, 403, h);
    if (+(req.headers.get("Content-Length") || 0) > MAX_BODY) return out({ error: "too_big" }, 413, h);

    let b;
    try { b = await req.json() } catch (e) { return out({ error: "bad_json" }, 400, h) }
    const prompt = typeof b?.prompt === "string" ? b.prompt.trim().slice(0, 20000) : "";
    if (!prompt) return out({ error: "no_prompt" }, 400, h);
    if (b.provider && b.provider !== "gemini" && b.provider !== "groq") {
      return out({ error: "invalid_provider" }, 400, h);
    }
    if (b.provider === "groq") {
      if (b.audio) return out({ error: "unsupported_media" }, 400, h);
      return generateWithGroq(req, env, h, prompt, b.json);
    }
    if (!env.GEMINI_KEY) return out({ error: "no_key" }, 500, h);

    const parts = [];
    if (b.audio && b.audio.data) {
      const mime = String(b.audio.mime || "audio/webm").split(";")[0];
      if (!/^audio\//.test(mime)) return out({ error: "bad_audio" }, 400, h);
      parts.push({ inline_data: { mime_type: mime, data: String(b.audio.data) } });
    }
    parts.push({ text: prompt });
    const body = {
      contents: [{ role: "user", parts }],
      generationConfig: { temperature: b.json ? 0.2 : 0.7, maxOutputTokens: 2048 }
    };
    if (b.json) body.generationConfig.responseMimeType = "application/json";

    const models = env.MODEL ? [env.MODEL, ...DEF_MODELS.filter(m => m !== env.MODEL)] : DEF_MODELS;
    let last = null;
    for (const m of models) for (let tr = 0; tr < 2; tr++) {
      if (tr) await new Promise(r => setTimeout(r, 1200));
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_KEY },
        body: JSON.stringify(body)
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        const text = ((j.candidates || [])[0]?.content?.parts || []).map(p => p.text || "").join("");
        return out({ text, model: m }, 200, h);
      }
      last = { status: r.status, msg: j.error && j.error.message };
      if (r.status === 503 || r.status === 500) continue; // quá tải: thử lại model này một lần
      if (r.status === 404 || r.status === 429) break; // sang model dự phòng
      return out({ error: "upstream", detail: last }, 502, h); // lỗi khác thì dừng
    }
    const code = last && last.status === 429 ? "rate_limited" : "upstream";
    return out({ error: code, detail: last }, last && last.status === 429 ? 429 : 502, h);
  }
};
