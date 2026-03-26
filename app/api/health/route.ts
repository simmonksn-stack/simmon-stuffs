import { NextResponse } from "next/server";
import { isUsingMemoryStorage } from "@/lib/storage";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    storage: isUsingMemoryStorage() ? "memory" : "blob",
    has_anthropic_key: !!process.env.ANTHROPIC_API_KEY,
    follower_goal: process.env.NEXT_PUBLIC_FOLLOWER_GOAL || "20000",
  });
}
