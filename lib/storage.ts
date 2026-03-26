import { put, list, del } from "@vercel/blob";
import type { Post, WeeklySnapshot } from "./types";

const POSTS_KEY = "linkedin-tracker/posts.json";
const WEEKLY_KEY = "linkedin-tracker/weekly.json";

let memoryPosts: Post[] | null = null;
let memoryWeekly: WeeklySnapshot[] | null = null;
let usingMemory = false;

function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function readBlob<T>(key: string): Promise<T | null> {
  if (!isBlobConfigured()) return null;
  try {
    const { blobs } = await list({ prefix: key });
    if (blobs.length === 0) return null;
    const response = await fetch(blobs[0].url);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function writeBlob<T>(key: string, data: T): Promise<void> {
  if (!isBlobConfigured()) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  // Delete existing blobs with this prefix first
  const { blobs } = await list({ prefix: key });
  for (const b of blobs) {
    await del(b.url);
  }
  await put(key, blob, { access: "public", addRandomSuffix: false });
}

export async function getPosts(): Promise<Post[]> {
  if (isBlobConfigured()) {
    const posts = await readBlob<Post[]>(POSTS_KEY);
    return posts ?? [];
  }
  usingMemory = true;
  return memoryPosts ?? [];
}

export async function savePosts(posts: Post[]): Promise<void> {
  if (isBlobConfigured()) {
    await writeBlob(POSTS_KEY, posts);
    return;
  }
  usingMemory = true;
  memoryPosts = posts;
}

export async function addPost(post: Post): Promise<Post[]> {
  const posts = await getPosts();
  posts.unshift(post);
  await savePosts(posts);
  return posts;
}

export async function deletePost(id: string): Promise<Post[]> {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  await savePosts(filtered);
  return filtered;
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post[]> {
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...updates };
  }
  await savePosts(posts);
  return posts;
}

export async function getWeeklySnapshots(): Promise<WeeklySnapshot[]> {
  if (isBlobConfigured()) {
    const weekly = await readBlob<WeeklySnapshot[]>(WEEKLY_KEY);
    return weekly ?? [];
  }
  usingMemory = true;
  return memoryWeekly ?? [];
}

export async function saveWeeklySnapshots(
  snapshots: WeeklySnapshot[]
): Promise<void> {
  if (isBlobConfigured()) {
    await writeBlob(WEEKLY_KEY, snapshots);
    return;
  }
  usingMemory = true;
  memoryWeekly = snapshots;
}

export async function addWeeklySnapshot(
  snapshot: WeeklySnapshot
): Promise<WeeklySnapshot[]> {
  const snapshots = await getWeeklySnapshots();
  snapshots.push(snapshot);
  snapshots.sort(
    (a, b) => new Date(a.week_start).getTime() - new Date(b.week_start).getTime()
  );
  await saveWeeklySnapshots(snapshots);
  return snapshots;
}

export function isUsingMemoryStorage(): boolean {
  return usingMemory || !isBlobConfigured();
}

export async function loadSeedData(
  seedPosts: Post[],
  seedWeekly: WeeklySnapshot[]
): Promise<void> {
  await savePosts(seedPosts);
  await saveWeeklySnapshots(seedWeekly);
}
