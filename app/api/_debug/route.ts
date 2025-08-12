// app/api/_debug/route.ts
import { NextResponse } from "next/server";
import { debugFetchPosts } from "@/lib/data-fetching";

/**
 * GET /api/_debug
 * Returns a JSON object showing:
 * - which env vars are present,
 * - an attempted fetch to the WP posts endpoint (status, content-type, short body snippet).
 *
 * WARNING: This does NOT reveal secret values. It only returns masked/boolean info
 * and a small snippet of the origin response (useful to detect an HTML login page).
 *
 * Remove this route once debugging is complete.
 */
export async function GET() {
  const result = await debugFetchPosts();
  return NextResponse.json(result);
}
