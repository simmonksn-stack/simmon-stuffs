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
    const { tema, pilar, hook, estrutura } = await request.json();

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `Escreva um post de LinkedIn para Simmon Nam, CPO da Musa (climate-tech, gestão de resíduos).

REGRAS DE VOZ:
- Tom direto, pessoal, opinado, sem bullshit
- Nunca motivacional genérico, nunca jargão corporativo
- Parágrafos curtos (1-2 linhas)
- Comece com um hook forte que para o scroll
- Use "eu" e conte histórias reais
- Termine com uma pergunta ou reflexão que gere comentários
- Máximo 1.300 caracteres (ideal LinkedIn)

PILAR: ${pilar}
TEMA: ${tema}
HOOK SUGERIDO: ${hook}
ESTRUTURA: ${(estrutura ?? []).join(" / ")}

Escreva APENAS o texto do post, sem aspas, sem título, sem markdown. Pronto para copiar e colar no LinkedIn.`,
        },
      ],
    });

    let text = "";
    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text;
      }
    }

    return NextResponse.json({ draft: text.trim() });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao gerar post", details: String(error) },
      { status: 500 }
    );
  }
}
