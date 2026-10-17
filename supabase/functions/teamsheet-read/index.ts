// Reads a photo or screenshot of a GAA team sheet and returns the players on it.
// Called from the line-up editor. The image is sent to Claude and never stored.
// Needs the ANTHROPIC_API_KEY secret (Supabase > Edge Functions > Secrets).
import Anthropic from "npm:@anthropic-ai/sdk";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Base64 of a phone photo the app has already shrunk to 1600px is well under this.
const MAX_IMAGE_CHARS = 7_000_000;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["readable", "problem", "title", "players"],
  properties: {
    readable: { type: "boolean" },
    problem: { type: "string" },
    title: { type: "string" },
    players: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["number", "name", "role", "position", "unclear"],
        properties: {
          number: { type: "integer" },
          name: { type: "string" },
          role: { type: "string", enum: ["starter", "sub"] },
          position: { type: "integer" },
          unclear: { type: "boolean" },
        },
      },
    },
  },
};

const PROMPT = `This image is a team sheet for a Gaelic games match (football, hurling, camogie or ladies football). Read every player on it.

For each player:
- number: the jersey number shown next to the name, or 0 if there is none.
- name: exactly as written. Do not correct spellings, add apostrophes or expand names.
- role: "starter" for the starting team, "sub" for substitutes (often a list headed Subs, Panel or Substitutes). If nothing marks the subs, the first 15 listed are starters.
- position: for starters, the position from 1 to 15 as laid out on the sheet: goalkeeper 1, full-back line 2-4, half-back line 5-7, midfield 8-9, half-forward line 10-12, full-forward line 13-15, each line read left to right as drawn. If the starters are a plain list, number them in the order listed. Use 0 for subs.
- unclear: true when you could not read the number or the name with confidence.

Leave out numbered lines with no name. Ignore logos, sponsors, venue and throw-in times.
title: the heading of the sheet if it has one (for example "St Judes v Ballyboden"), otherwise "".
readable: false if the image is not a team sheet, or is too blurred, dark or cut off to read. Then say why in a few words in problem; otherwise problem is "".`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

// The gateway has already verified the token; this only reads its claims.
function claims(req: Request): Record<string, unknown> | null {
  const auth = req.headers.get("Authorization") || "";
  const part = auth.replace(/^Bearer\s+/i, "").split(".")[1];
  if (!part) return null;
  try {
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  // Signed-in club members only: the demo account and the public anon key are refused.
  const c = claims(req);
  if (!c || c.role !== "authenticated" || c.is_anonymous === true) return json({ error: "sign_in" }, 401);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "not_configured" }, 503);

  let body: { image?: string; media_type?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const image = body.image || "";
  const mediaType = body.media_type === "image/png" ? "image/png" : "image/jpeg";
  if (!image || image.length > MAX_IMAGE_CHARS) return json({ error: "bad_image" }, 400);

  const client = new Anthropic({ apiKey: key });
  try {
    const msg = await client.beta.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
          { type: "text", text: PROMPT },
        ],
      }],
    });
    if (msg.stop_reason === "refusal") return json({ error: "refused" }, 422);
    if (msg.stop_reason === "max_tokens") return json({ error: "too_long" }, 422);
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return json({ error: "no_result" }, 502);
    return json(JSON.parse(text.text));
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "busy" }, 429);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: "bad_key" }, 503);
    if (e instanceof Anthropic.APIError) return json({ error: "api", status: e.status }, 502);
    return json({ error: "failed" }, 500);
  }
});
