import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada. Vá em Vercel → Settings → Environment Variables." },
      { status: 503 }
    );
  }

  try {
    const client = new Anthropic({ apiKey });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools: any[] = [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 10,
      },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      tools,
      messages: [
        {
          role: "user",
          content: `Busque os 3 temas mais comentados/relevantes HOJE em cada um destes pilares no contexto de LinkedIn Brasil:
1. Produto & Execução (CPO, PM, decisões de produto)
2. Operador & Bastidores (como empresas rodam por dentro)
3. Bastidores de Empresa (culture, hiring, gestão)
4. Pai & Família (paternidade, equilíbrio trabalho-família)
5. Líder & Liderança (gestão de pessoas, feedback)

Para cada tema, dê:
- O tema em 1 frase
- Por que está relevante agora
- Um possível ângulo para um post

Responda APENAS em JSON, sem markdown, sem backticks.
Formato: { "pilares": [ { "pilar": "...", "temas": [ { "tema": "...", "relevancia": "...", "angulo": "..." } ] } ] }`,
        },
      ],
    });

    // Extract text from the response
    let text = "";
    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text;
      }
    }

    // Try to parse JSON from the response
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
      { error: "Falha ao buscar trending topics", details: String(error) },
      { status: 500 }
    );
  }
}
