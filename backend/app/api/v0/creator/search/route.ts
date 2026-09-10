import { NextRequest, NextResponse } from "next/server";
import { searchUsers } from "@/lib/xapi";
import { requirePaidExtension } from "@/lib/extension-auth";

// GET /api/v0/creator/search?q=level
export async function GET(req: NextRequest) {
  const access = await requirePaidExtension(req);
  if (!access.ok) return access.response;

  const query = req.nextUrl.searchParams.get("q")?.replace("@", "").trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  try {
    const users = await searchUsers(query);
    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        username: user.userName,
        displayName: user.name,
        profileImage: user.profilePicture,
        followersCount: user.followers,
        verified: Boolean(user.isBlueVerified || user.verifiedType),
      })),
    });
  } catch (error) {
    console.error("v0 creator search error:", error);
    return NextResponse.json({ error: "Failed to search creators" }, { status: 500 });
  }
}
