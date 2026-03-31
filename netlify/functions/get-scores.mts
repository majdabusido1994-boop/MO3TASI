import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

interface ScoreRecord {
  name: string;
  score: number;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export default async function handler(req: Request, _context: Context) {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: CORS_HEADERS });
  }

  try {
    const store = getStore("leaderboard");

    let scores: ScoreRecord[] = [];
    try {
      const existing = await store.get("scores", { type: "json" });
      if (existing && Array.isArray(existing)) {
        scores = existing;
      }
    } catch {
      // No scores yet
    }

    // Return top 10 (public data only)
    const leaderboard = scores.slice(0, 10).map((s: ScoreRecord, i: number) => ({
      name: s.name,
      score: s.score,
      rank: i + 1,
      discount: i < 3 ? [20, 10, 5][i] : undefined,
    }));

    return new Response(
      JSON.stringify({ leaderboard, totalPlayers: scores.length }),
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30",
        },
      }
    );
  } catch {
    return new Response(JSON.stringify({ leaderboard: [], totalPlayers: 0 }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}
