// TCV Talks AI proxy: giữ Gemini API key ở phía Cloudflare, web chỉ gọi qua đây.
// Biến môi trường: GEMINI_KEY (secret, bắt buộc), MODEL (tuỳ chọn), ALLOW (tuỳ chọn, danh sách origin cách nhau dấu phẩy)
const DEF_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"];
const MAX_BODY = 4 * 1024 * 1024;

function allowed(origin, env) {
  if (!origin) return false;
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

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const ok = allowed(origin, env);
    const h = ok ? cors(origin) : {};
    if (req.method === "OPTIONS") return new Response(null, { status: ok ? 204 : 403, headers: h });
    if (req.method === "GET") return out({ ok: true, key: !!env.GEMINI_KEY }, 200, h);
    if (req.method !== "POST") return out({ error: "method" }, 405, h);
    if (!ok) return out({ error: "origin" }, 403, h);
    if (!env.GEMINI_KEY) return out({ error: "no_key" }, 500, h);
    if (+(req.headers.get("Content-Length") || 0) > MAX_BODY) return out({ error: "too_big" }, 413, h);

    let b;
    try { b = await req.json() } catch (e) { return out({ error: "bad_json" }, 400, h) }
    const prompt = String(b.prompt || "").slice(0, 20000);
    if (!prompt) return out({ error: "no_prompt" }, 400, h);

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
    for (const m of models) {
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
      if (![404, 429, 500, 503].includes(r.status)) break; // lỗi khác thì không thử model dự phòng
    }
    const code = last && last.status === 429 ? "rate_limited" : "upstream";
    return out({ error: code, detail: last }, last && last.status === 429 ? 429 : 502, h);
  }
};
