import { NextResponse } from "next/server";
import { getWeeklySnapshots, addWeeklySnapshot } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import type { WeeklySnapshot } from "@/lib/types";

export async function GET() {
  try {
    const snapshots = await getWeeklySnapshots();
    return NextResponse.json({ weekly: snapshots });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const snapshot: WeeklySnapshot = {
      id: generateId(),
      week_start: body.week_start,
      follower_count: Number(body.follower_count) || 0,
      profile_views: Number(body.profile_views) || 0,
      search_appearances: Number(body.search_appearances) || 0,
      created_at: new Date().toISOString(),
    };

    const snapshots = await addWeeklySnapshot(snapshot);
    return NextResponse.json({ snapshot, weekly: snapshots });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
