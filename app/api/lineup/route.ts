import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada. Vá em Vercel → Settings → Environment Variables." },
      { status: 503 }
    );
  }

  try {
    const { pillar_performance, granola_context, manual_context, trending_topics, cadencia } =
      await request.json();

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Você é o estrategista de conteúdo LinkedIn do Simmon Nam, CPO da Musa.

CONTEXTO DO SIMMON:
- CPO de climate-tech (gestão de resíduos)
- Coreano-brasileiro, pai de 2, baseado em SP
- Tom: direto, pessoal, opinado, sem bullshit
- Pilares: Produto, Operador, Bastidores, Pai, Líder

PERFORMANCE DOS PILARES (baseado em dados reais):
${JSON.stringify(pillar_performance ?? {}, null, 2)}

CONTEXTO REAL DA SEMANA (reuniões e inputs):
${granola_context ?? "Sem dados de reuniões disponíveis."}
${manual_context ?? ""}

TRENDING TOPICS:
${JSON.stringify(trending_topics ?? [], null, 2)}

TAREFA:
Gere um lineup de ${cadencia ?? 2} posts para a próxima semana.

Para cada post, forneça:
1. Dia sugerido de publicação (terça e quinta são melhores para engajamento B2B)
2. Pilar (use exatamente um destes: "Produto & Execução", "Operador & Bastidores", "Bastidores de Empresa", "Pai & Família", "Líder & Liderança")
3. Tema
4. Hook (primeira linha que para o scroll)
5. Estrutura em 3 bullets
6. Por que este tema agora (timing)
7. Score de confiança (0-10) — quão provável é performar bem baseado nos dados

Priorize:
- Pilares que performam melhor (dados reais)
- Temas com timing forte (aconteceu essa semana)
- Mix entre pessoal e profissional

Responda APENAS em JSON, sem markdown.
Formato: { "lineup": [ { "dia": "...", "pilar": "...", "tema": "...", "hook": "...", "estrutura": ["...", "...", "..."], "timing": "...", "score_confianca": N } ] }`,
        },
      ],
    });

    let text = "";
    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text;
      }
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Resposta da API não contém JSON válido" },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao gerar lineup", details: String(error) },
      { status: 500 }
    );
  }
}
