import Anthropic from "@anthropic-ai/sdk";
import type { PostAnalysis, ContentPillar } from "./types";

const SYSTEM_PROMPT = `Você é um analista de conteúdo LinkedIn especializado em personal branding para líderes de produto e tecnologia.

Analise o post abaixo considerando:
1. GANCHO — a primeira linha captura atenção? Por quê?
2. ESTRUTURA — a progressão narrativa funciona? Tem conflito > insight > takeaway?
3. TOM — está direto, humano, autêntico? Ou soa genérico/corporativo?
4. ENGAJABILIDADE — tem elemento que convida comentário/discussão?
5. PILAR — está alinhado com o pilar declarado (Execução / Família / Climate-tech)?

Contexto do autor: CPO de startup climate-tech, estilo direto, sem bullshit, valoriza execução sobre teoria.

Responda EXCLUSIVAMENTE em JSON com esta estrutura:
{
  "hook_score": 1-10,
  "hook_analysis": "string curta",
  "structure_score": 1-10,
  "structure_analysis": "string curta",
  "tone_score": 1-10,
  "tone_analysis": "string curta",
  "engagement_score": 1-10,
  "engagement_analysis": "string curta",
  "pillar_alignment": 1-10,
  "overall_score": 1-10,
  "what_worked": "string — 1-2 frases sobre o que funcionou",
  "what_to_improve": "string — 1-2 frases sobre o que melhorar",
  "recommendation": "string — 1 frase acionável para o próximo post"
}`;

export async function analyzePost(
  postText: string,
  pillar: ContentPillar
): Promise<PostAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY não configurada");
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Pilar declarado: ${pillar}\n\nPost:\n${postText}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Resposta inesperada da API");
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("JSON não encontrado na resposta");
  }

  const analysis: PostAnalysis = JSON.parse(jsonMatch[0]);
  return analysis;
}
