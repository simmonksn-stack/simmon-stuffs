import type { Post, BoardSettings, LineupItem } from "./types";

const KEYS = {
  posts: "lsb:posts",
  settings: "lsb:settings",
  lineup: "lsb:lineup",
} as const;

const DEFAULT_SETTINGS: BoardSettings = {
  current_followers: 9475,
  target_followers: 20000,
  target_date: "2026-10-31",
};

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getItem<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, data: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

// Posts
export function getPosts(): Post[] {
  return getItem<Post[]>(KEYS.posts, []);
}

export function savePosts(posts: Post[]): void {
  setItem(KEYS.posts, posts);
}

export function addPost(post: Post): Post[] {
  const posts = getPosts();
  posts.unshift(post);
  savePosts(posts);
  return posts;
}

export function deletePost(id: string): Post[] {
  const posts = getPosts().filter((p) => p.id !== id);
  savePosts(posts);
  return posts;
}

export function updatePost(id: string, updates: Partial<Post>): Post[] {
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    posts[idx] = { ...posts[idx], ...updates };
  }
  savePosts(posts);
  return posts;
}

// Settings
export function getSettings(): BoardSettings {
  return getItem<BoardSettings>(KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: BoardSettings): void {
  setItem(KEYS.settings, settings);
}

// Lineup
export function getLineup(): LineupItem[] {
  return getItem<LineupItem[]>(KEYS.lineup, []);
}

export function saveLineup(lineup: LineupItem[]): void {
  setItem(KEYS.lineup, lineup);
}

// Export / Import
export function exportAllData(): string {
  return JSON.stringify(
    {
      posts: getPosts(),
      settings: getSettings(),
      lineup: getLineup(),
      exported_at: new Date().toISOString(),
    },
    null,
    2
  );
}

export function importAllData(json: string): void {
  const data = JSON.parse(json);
  if (data.posts) savePosts(data.posts);
  if (data.settings) saveSettings(data.settings);
  if (data.lineup) saveLineup(data.lineup);
}
