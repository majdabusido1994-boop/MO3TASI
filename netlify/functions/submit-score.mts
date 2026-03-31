import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

interface ScoreRecord {
  name: string;
  mobile: string;
  email: string;
  score: number;
  distance: number;
  timestamp: string;
  discountAwarded?: number;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default async function handler(req: Request, _context: Context) {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { name, mobile, email, score, distance } = body;

    // Validate
    if (!name || !mobile || !email || typeof score !== "number" || score < 0) {
      return new Response(JSON.stringify({ error: "Missing or invalid fields" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const store = getStore("leaderboard");

    // Read existing scores
    let scores: ScoreRecord[] = [];
    try {
      const existing = await store.get("scores", { type: "json" });
      if (existing && Array.isArray(existing)) {
        scores = existing;
      }
    } catch {
      // First time, empty array
    }

    // Duplicate check: same name+email within 60 seconds
    const now = Date.now();
    const isDuplicate = scores.some(
      (s) =>
        s.name === name &&
        s.email === email &&
        now - new Date(s.timestamp).getTime() < 60000
    );

    if (isDuplicate) {
      return new Response(JSON.stringify({ error: "Score already submitted. Wait a moment." }), {
        status: 429,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Add new record
    const record: ScoreRecord = {
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      score,
      distance: distance || 0,
      timestamp: new Date().toISOString(),
    };

    scores.push(record);

    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);

    // Find this player's rank (best score by this name+email)
    const playerRank = scores.findIndex(
      (s) => s.name === record.name && s.email === record.email && s.timestamp === record.timestamp
    ) + 1;

    // Award discount if top 3
    if (playerRank >= 1 && playerRank <= 3) {
      const discounts = [20, 10, 5];
      record.discountAwarded = discounts[playerRank - 1];
      // Update the record in the array
      scores[playerRank - 1] = record;
    }

    // Save all records
    await store.setJSON("scores", scores);

    // Build public leaderboard (top 10, no PII)
    const leaderboard = scores.slice(0, 10).map((s, i) => ({
      name: s.name,
      score: s.score,
      rank: i + 1,
      discount: i < 3 ? [20, 10, 5][i] : undefined,
    }));

    return new Response(
      JSON.stringify({
        leaderboard,
        playerRank,
        discount: playerRank <= 3 ? [20, 10, 5][playerRank - 1] : null,
        totalPlayers: scores.length,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}
