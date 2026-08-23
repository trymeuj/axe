import { NextRequest, NextResponse } from "next/server";
import { fetchUserByUsername } from "@/lib/xapi";
import { fetchCreatorInsights } from "@/lib/creator";

// GET /api/v0/creator/insights?username=xxx&profileOnly=true
// profileOnly=true: returns { creator, insight: null } immediately
// Otherwise: fetch tweets + LLM insights, return (no DB — extension stores in localStorage)
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.replace("@", "");
  const profileOnly = req.nextUrl.searchParams.get("profileOnly") === "true";

  if (!username) {
    return NextResponse.json(
      { error: "username query param required" },
      { status: 400 }
    );
  }

  try {
    const xUser = await fetchUserByUsername(username);
    if (!xUser) {
      return NextResponse.json({ error: "Creator not found on X" }, { status: 404 });
    }

    const creator = {
      creatorXId: xUser.id,
      creatorUsername: xUser.userName,
      creatorDisplayName: xUser.name,
      creatorProfileImage: xUser.profilePicture ?? null,
      creatorFollowersCount: xUser.followers ?? 0,
    };

    if (profileOnly) {
      return NextResponse.json({ creator, insight: null });
    }

    const result = await fetchCreatorInsights(username);
    if (!result) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    return NextResponse.json({
      creator: {
        creatorXId: result.user.id,
        creatorUsername: result.user.userName,
        creatorDisplayName: result.user.name,
        creatorProfileImage: result.user.profilePicture ?? null,
        creatorFollowersCount: result.user.followers ?? 0,
      },
      insight: result.insight,
    });
  } catch (err) {
    console.error("v0 creator insights error:", err);
    return NextResponse.json(
      { error: "Failed to fetch creator insights" },
      { status: 500 }
    );
  }
}
