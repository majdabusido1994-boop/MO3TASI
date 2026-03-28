import { NextResponse } from "next/server";

const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_API = "https://graph.instagram.com/me/media";

export async function GET() {
  if (!INSTAGRAM_TOKEN) {
    return NextResponse.json(
      { posts: [], message: "Instagram token not configured" },
      { status: 200 }
    );
  }

  try {
    const fields = "id,media_url,permalink,caption,media_type,thumbnail_url,timestamp";
    const res = await fetch(
      `${INSTAGRAM_API}?fields=${fields}&limit=6&access_token=${INSTAGRAM_TOKEN}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!res.ok) {
      throw new Error(`Instagram API error: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({ posts: data.data || [] });
  } catch (error) {
    console.error("Instagram fetch error:", error);
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
