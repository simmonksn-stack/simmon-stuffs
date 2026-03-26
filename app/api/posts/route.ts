import { NextResponse } from "next/server";
import { getPosts, addPost, deletePost, updatePost, savePosts, loadSeedData } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import type { Post, ContentPillar } from "@/lib/types";

export async function GET() {
  try {
    const posts = await getPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle seed data loading
    if (body.action === "seed") {
      const seedData = body.data;
      await loadSeedData(seedData.posts, seedData.weekly);
      return NextResponse.json({ success: true });
    }

    // Handle analysis update
    if (body.action === "update_analysis") {
      const posts = await updatePost(body.id, { analysis: body.analysis });
      return NextResponse.json({ posts });
    }

    const post: Post = {
      id: generateId(),
      date: body.date,
      post_text: body.post_text,
      post_url: body.post_url || "",
      pillar: body.pillar as ContentPillar,
      likes: Number(body.likes) || 0,
      comments: Number(body.comments) || 0,
      reposts: Number(body.reposts) || 0,
      impressions: Number(body.impressions) || 0,
      image_attached: Boolean(body.image_attached),
      analysis: null,
      created_at: new Date().toISOString(),
    };

    const posts = await addPost(post);
    return NextResponse.json({ post, posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }
    const posts = await deletePost(id);
    return NextResponse.json({ posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
