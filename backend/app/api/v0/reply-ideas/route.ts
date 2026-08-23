import { NextRequest, NextResponse } from "next/server";
import { generateReplyIdeas } from "@/lib/ai";

// Public (auth-less): POST /api/v0/reply-ideas
// Body: { tweetText, creatorUsername, userFollowerCount? }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    tweetText,
    creatorUsername,
    userFollowerCount = 0,
  } = body as {
    tweetText: string;
    creatorUsername: string;
    userFollowerCount?: number;
  };

  if (!tweetText || !creatorUsername) {
    return NextResponse.json(
      { error: "tweetText and creatorUsername are required" },
      { status: 400 }
    );
  }

  try {
    const ideas = await generateReplyIdeas(
      tweetText,
      creatorUsername.replace("@", ""),
      Number(userFollowerCount) || 0
    );
    return NextResponse.json({ ideas });
  } catch (err) {
    console.error("v0 reply-ideas error:", err);
    return NextResponse.json(
      { error: "Failed to generate reply ideas" },
      { status: 500 }
    );
  }
}
