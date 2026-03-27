import * as XLSX from "xlsx";
import type { Post, ContentPillar } from "./types";
import { generateId } from "./utils";
import { PILLARS } from "./types";

interface RawRow {
  [key: string]: string | number | undefined;
}

// Flexible column name matching — handles variations in LinkedIn export headers
const COLUMN_MAP: Record<string, string[]> = {
  date: ["date", "published date", "data", "data de publicação", "post date", "created date"],
  url: ["post link", "post url", "url", "link", "permalink"],
  title: ["title", "título", "tema", "post title", "content", "post"],
  impressions: ["impressions", "impressões", "views"],
  reactions: ["reactions", "reações", "likes", "curtidas"],
  comments: ["comments", "comentários"],
  reposts: ["reposts", "shares", "compartilhamentos", "repostagens"],
  saves: ["saves", "salvamentos", "bookmarks"],
  sends: ["sends", "envios", "direct sends"],
  followers_gained: ["followers gained", "followers", "new followers", "seguidores ganhos", "seguidores"],
  members_reached: ["members reached", "reach", "alcance", "unique views", "unique impressions"],
  profile_viewers: ["profile viewers", "profile views", "visualizações do perfil"],
  engagement_rate: ["engagement rate", "taxa de engajamento", "engajamento"],
  clicks: ["clicks", "cliques"],
};

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[_\-]/g, " ");
}

function findColumn(headers: string[], targetAliases: string[]): string | null {
  for (const header of headers) {
    const normalized = normalizeHeader(header);
    for (const alias of targetAliases) {
      if (normalized === alias || normalized.includes(alias)) {
        return header;
      }
    }
  }
  return null;
}

function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return Math.round(value);
  // Remove commas, dots used as thousands separators, percentage signs
  const cleaned = String(value).replace(/[%,]/g, "").replace(/\./g, "").trim();
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

function parseDate(value: string | number | undefined): string {
  if (!value) return new Date().toISOString().split("T")[0];

  // Handle Excel serial date numbers
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    return date.toISOString().split("T")[0];
  }

  const str = String(value).trim();

  // Try ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }

  // Try DD/MM/YYYY (Brazilian format)
  const brMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2].padStart(2, "0")}-${brMatch[1].padStart(2, "0")}`;
  }

  // Try MM/DD/YYYY (US format)
  const usMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (usMatch) {
    return `${usMatch[3]}-${usMatch[1].padStart(2, "0")}-${usMatch[2].padStart(2, "0")}`;
  }

  // Try parsing with Date constructor as last resort
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return new Date().toISOString().split("T")[0];
}

function extractTitleFromUrl(url: string): string {
  // Try to extract a readable title from LinkedIn post URL
  const match = url.match(/posts\/([^/]+)_/);
  if (match) {
    return decodeURIComponent(match[1]).replace(/-/g, " ").substring(0, 60);
  }
  return "Post importado";
}

function guessPillar(title: string): ContentPillar {
  const lower = title.toLowerCase();

  const keywords: Record<ContentPillar, string[]> = {
    "Produto & Execução": ["produto", "product", "decisão", "roadmap", "feature", "sprint", "backlog", "métrica", "okr", "kpi"],
    "Operador & Bastidores": ["operação", "operador", "bastidor", "processo", "escala", "growth", "startup"],
    "Bastidores de Empresa": ["cultura", "culture", "hiring", "contratação", "gestão", "empresa", "time", "equipe", "onboard"],
    "Pai & Família": ["pai", "filho", "filha", "família", "criança", "paternidade", "casa", "escola"],
    "Líder & Liderança": ["líder", "liderança", "feedback", "1:1", "gestão de pessoas", "mentor", "carreira"],
  };

  for (const [pillar, words] of Object.entries(keywords)) {
    if (words.some((w) => lower.includes(w))) {
      return pillar as ContentPillar;
    }
  }

  return PILLARS[0]; // default
}

export interface ImportResult {
  posts: Post[];
  warnings: string[];
  columnsFound: string[];
  columnsMissing: string[];
}

export function parseLinkedInXlsx(buffer: ArrayBuffer): ImportResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: RawRow[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (rows.length === 0) {
    return { posts: [], warnings: ["Arquivo vazio ou formato não reconhecido."], columnsFound: [], columnsMissing: [] };
  }

  const headers = Object.keys(rows[0]);
  const warnings: string[] = [];
  const columnsFound: string[] = [];
  const columnsMissing: string[] = [];

  // Map columns
  const colDate = findColumn(headers, COLUMN_MAP.date);
  const colUrl = findColumn(headers, COLUMN_MAP.url);
  const colTitle = findColumn(headers, COLUMN_MAP.title);
  const colImpressions = findColumn(headers, COLUMN_MAP.impressions);
  const colReactions = findColumn(headers, COLUMN_MAP.reactions);
  const colComments = findColumn(headers, COLUMN_MAP.comments);
  const colReposts = findColumn(headers, COLUMN_MAP.reposts);
  const colSaves = findColumn(headers, COLUMN_MAP.saves);
  const colSends = findColumn(headers, COLUMN_MAP.sends);
  const colFollowers = findColumn(headers, COLUMN_MAP.followers_gained);
  const colReached = findColumn(headers, COLUMN_MAP.members_reached);
  const colProfileViewers = findColumn(headers, COLUMN_MAP.profile_viewers);

  // Track which columns were found
  const mapping = {
    "Data": colDate,
    "URL": colUrl,
    "Título": colTitle,
    "Impressions": colImpressions,
    "Reactions": colReactions,
    "Comments": colComments,
    "Reposts": colReposts,
    "Saves": colSaves,
    "Sends": colSends,
    "Followers gained": colFollowers,
    "Members reached": colReached,
    "Profile viewers": colProfileViewers,
  };

  for (const [label, col] of Object.entries(mapping)) {
    if (col) {
      columnsFound.push(label);
    } else {
      columnsMissing.push(label);
    }
  }

  if (!colImpressions) {
    warnings.push("Coluna 'Impressions' não encontrada. Os scores não poderão ser calculados corretamente.");
  }

  const posts: Post[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const impressions = colImpressions ? parseNumber(row[colImpressions]) : 0;

    // Skip rows with 0 impressions (likely empty/header rows)
    if (impressions === 0 && !colUrl) continue;

    const url = colUrl ? String(row[colUrl] || "").trim() : "";
    const rawTitle = colTitle ? String(row[colTitle] || "").trim() : "";
    const title = rawTitle || (url ? extractTitleFromUrl(url) : `Post #${i + 1}`);

    const post: Post = {
      id: generateId() + `-${i}`,
      title,
      url: url || `https://linkedin.com/posts/imported-${i + 1}`,
      date: parseDate(colDate ? row[colDate] : undefined),
      pillar: guessPillar(title),
      impressions,
      members_reached: colReached ? parseNumber(row[colReached]) : 0,
      followers_gained: colFollowers ? parseNumber(row[colFollowers]) : 0,
      reactions: colReactions ? parseNumber(row[colReactions]) : 0,
      comments: colComments ? parseNumber(row[colComments]) : 0,
      reposts: colReposts ? parseNumber(row[colReposts]) : 0,
      saves: colSaves ? parseNumber(row[colSaves]) : 0,
      sends: colSends ? parseNumber(row[colSends]) : 0,
      profile_viewers: colProfileViewers ? parseNumber(row[colProfileViewers]) : null,
      score: null,
      created_at: new Date().toISOString(),
    };

    posts.push(post);
  }

  if (posts.length === 0) {
    warnings.push("Nenhum post válido encontrado no arquivo.");
  }

  if (columnsMissing.length > 0) {
    warnings.push(
      `Colunas não encontradas: ${columnsMissing.join(", ")}. Esses campos ficarão zerados — edite manualmente se necessário.`
    );
  }

  return { posts, warnings, columnsFound, columnsMissing };
}
