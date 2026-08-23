import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateReplyIdeas } from "@/lib/ai";

// POST /api/reply-ideas
// Body: { tweetText: string, creatorUsername: string }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tweetText, creatorUsername } = body as {
    tweetText: string;
    creatorUsername: string;
  };

  if (!tweetText || !creatorUsername) {
    return NextResponse.json(
      { error: "tweetText and creatorUsername are required" },
      { status: 400 }
    );
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ideas = await generateReplyIdeas(
    tweetText,
    creatorUsername,
    user.followersCount ?? 0
  );

  return NextResponse.json({ ideas });
}
