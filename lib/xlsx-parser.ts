import * as XLSX from "xlsx";
import type { Post, ContentPillar } from "./types";
import { generateId } from "./utils";
import { PILLARS } from "./types";

/**
 * LinkedIn single-post analytics export format (vertical key-value):
 *
 * Post URL          | https://www.linkedin.com/posts/...
 * Post Date         | 2/9/2026
 * Post Publish Time | 8:15 AM
 *
 * Post Performance  |
 * Impressions       | 78814
 * Members reached   | 50840
 *
 * Profile activity  |
 * Profile viewers from this post | 336
 * Followers gained from this post | 46
 *
 * Engagement        |
 * Social engagements | 578
 * Reactions         | 343
 * Comments          | 39
 * Reposts           | 1
 * Saves             | 142
 * Sends on LinkedIn | 53
 */

interface KeyValueRow {
  key: string;
  value: string | number;
}

function normalizeKey(key: string): string {
  return String(key).toLowerCase().trim();
}

function toNumber(val: string | number | undefined): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return Math.round(val);
  const cleaned = String(val).replace(/[,.\s]/g, "").trim();
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

function parseDate(val: string | number | undefined): string {
  if (!val) return new Date().toISOString().split("T")[0];

  // Handle Excel serial date numbers
  if (typeof val === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + val * 86400000);
    return date.toISOString().split("T")[0];
  }

  const str = String(val).trim();

  // M/D/YYYY format (US — LinkedIn default)
  const usMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (usMatch) {
    return `${usMatch[3]}-${usMatch[1].padStart(2, "0")}-${usMatch[2].padStart(2, "0")}`;
  }

  // YYYY-MM-DD (ISO)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }

  // DD/MM/YYYY (BR)
  const brMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2].padStart(2, "0")}-${brMatch[1].padStart(2, "0")}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return new Date().toISOString().split("T")[0];
}

function extractTitleFromUrl(url: string): string {
  // LinkedIn URL format: /posts/username_title-text-here-share-1234567890
  const match = url.match(/posts\/[^_]+_(.+?)(?:-share-|-activity-)/);
  if (match) {
    return decodeURIComponent(match[1])
      .replace(/%[0-9A-Fa-f]{2}/g, "")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 80);
  }
  return "Post importado do LinkedIn";
}

function guessPillar(title: string): ContentPillar {
  const lower = title.toLowerCase();

  const keywords: Record<ContentPillar, string[]> = {
    "Produto & Execução": ["produto", "product", "decisão", "roadmap", "feature", "sprint", "backlog", "métrica", "okr", "kpi", "tech", "dados", "bug"],
    "Operador & Bastidores": ["operação", "operador", "bastidor", "processo", "escala", "growth", "startup", "receita", "meta"],
    "Bastidores de Empresa": ["cultura", "culture", "hiring", "contratação", "gestão", "empresa", "equipe", "onboard", "demissão", "remote"],
    "Pai & Família": ["pai", "filho", "filha", "família", "criança", "paternidade", "casa", "escola", "mãe"],
    "Líder & Liderança": ["líder", "liderança", "feedback", "1:1", "gestão de pessoas", "mentor", "carreira", "performance", "avaliação"],
  };

  for (const [pillar, words] of Object.entries(keywords)) {
    if (words.some((w) => lower.includes(w))) {
      return pillar as ContentPillar;
    }
  }

  return PILLARS[0];
}

/**
 * Parse a LinkedIn single-post analytics XLSX export.
 * Format: vertical key-value pairs in columns A and B.
 */
function parseSinglePostExport(sheet: XLSX.WorkSheet): Post | null {
  // Read as array of arrays to handle the vertical key-value format
  const rows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });

  // Build a key-value map from all rows
  const kv: Record<string, string | number> = {};
  for (const row of rows) {
    if (!row || row.length < 2) continue;
    const key = normalizeKey(String(row[0] ?? ""));
    const val = row[1];
    if (key && val !== undefined && val !== "") {
      kv[key] = val;
    }
  }

  // Extract fields using the exact LinkedIn export labels
  const url = String(
    kv["post url"] ?? kv["url"] ?? kv["post link"] ?? ""
  ).trim();

  const dateRaw = kv["post date"] ?? kv["date"] ?? kv["data"] ?? "";
  const date = parseDate(dateRaw);

  const impressions = toNumber(kv["impressions"] ?? kv["impressões"]);
  const membersReached = toNumber(kv["members reached"] ?? kv["alcance"]);
  const profileViewers = toNumber(
    kv["profile viewers from this post"] ?? kv["profile viewers"] ?? kv["visualizações do perfil"]
  );
  const followersGained = toNumber(
    kv["followers gained from this post"] ?? kv["followers gained"] ?? kv["seguidores ganhos"]
  );
  const reactions = toNumber(kv["reactions"] ?? kv["reações"]);
  const comments = toNumber(kv["comments"] ?? kv["comentários"]);
  const reposts = toNumber(kv["reposts"] ?? kv["shares"]);
  const saves = toNumber(kv["saves"] ?? kv["salvamentos"]);
  const sends = toNumber(kv["sends on linkedin"] ?? kv["sends"] ?? kv["envios"]);

  // Must have at least impressions or a URL to be valid
  if (impressions === 0 && !url) return null;

  const title = url ? extractTitleFromUrl(url) : "Post importado";

  return {
    id: generateId(),
    title,
    url: url || "https://linkedin.com/posts/imported",
    date,
    pillar: guessPillar(title),
    impressions,
    members_reached: membersReached,
    followers_gained: followersGained,
    reactions,
    comments,
    reposts,
    saves,
    sends,
    profile_viewers: profileViewers || null,
    score: null,
    created_at: new Date().toISOString(),
  };
}

/**
 * Try to parse as a multi-post horizontal table (fallback).
 * Some exports might have rows as posts with columns as metrics.
 */
function parseMultiPostTable(sheet: XLSX.WorkSheet): Post[] {
  const rows: Record<string, string | number | undefined>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const hasImpressions = headers.some((h) => normalizeKey(h).includes("impression"));
  if (!hasImpressions) return [];

  return rows
    .map((row, i) => {
      const findVal = (aliases: string[]): string | number | undefined => {
        for (const h of headers) {
          const norm = normalizeKey(h);
          if (aliases.some((a) => norm.includes(a))) return row[h];
        }
        return undefined;
      };

      const url = String(findVal(["post url", "url", "post link", "link"]) ?? "").trim();
      const title = String(findVal(["title", "título", "tema"]) ?? "").trim() ||
        (url ? extractTitleFromUrl(url) : `Post #${i + 1}`);

      return {
        id: generateId() + `-${i}`,
        title,
        url: url || `https://linkedin.com/posts/imported-${i + 1}`,
        date: parseDate(findVal(["date", "post date", "data"])),
        pillar: guessPillar(title),
        impressions: toNumber(findVal(["impressions", "impressões"])),
        members_reached: toNumber(findVal(["members reached", "alcance"])),
        followers_gained: toNumber(findVal(["followers gained", "followers", "seguidores"])),
        reactions: toNumber(findVal(["reactions", "reações", "likes"])),
        comments: toNumber(findVal(["comments", "comentários"])),
        reposts: toNumber(findVal(["reposts", "shares"])),
        saves: toNumber(findVal(["saves", "salvamentos"])),
        sends: toNumber(findVal(["sends on linkedin", "sends", "envios"])),
        profile_viewers: toNumber(findVal(["profile viewers", "visualizações"])) || null,
        score: null,
        created_at: new Date().toISOString(),
      } as Post;
    })
    .filter((p) => p.impressions > 0);
}

export interface ImportResult {
  posts: Post[];
  warnings: string[];
}

export function parseLinkedInXlsx(buffer: ArrayBuffer): ImportResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const warnings: string[] = [];
  const allPosts: Post[] = [];

  // Process each sheet (user might import multiple single-post files or one with multiple sheets)
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    // First try: single-post vertical format (the LinkedIn default)
    const singlePost = parseSinglePostExport(sheet);
    if (singlePost && singlePost.impressions > 0) {
      allPosts.push(singlePost);
      continue;
    }

    // Fallback: multi-post horizontal table
    const tablePosts = parseMultiPostTable(sheet);
    if (tablePosts.length > 0) {
      allPosts.push(...tablePosts);
      continue;
    }
  }

  if (allPosts.length === 0) {
    warnings.push("Nenhum post encontrado. Verifique se o arquivo é um export de analytics do LinkedIn.");
  }

  return { posts: allPosts, warnings };
}
