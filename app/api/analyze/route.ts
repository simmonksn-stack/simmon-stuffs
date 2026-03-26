import { NextResponse } from "next/server";
import { analyzePost } from "@/lib/analyze";
import type { ContentPillar } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { post_text, pillar } = body;

    if (!post_text || !pillar) {
      return NextResponse.json(
        { error: "post_text e pillar são obrigatórios" },
        { status: 400 }
      );
    }

    const analysis = await analyzePost(post_text, pillar as ContentPillar);
    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
