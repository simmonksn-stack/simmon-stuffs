import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.GRANOLA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      available: false,
      meetings: [],
      error: "GRANOLA_API_KEY não configurada. Adicione nas variáveis de ambiente do Vercel para importar reuniões automaticamente.",
    });
  }

  try {
    const response = await fetch("https://api.granola.ai/v1/meetings?limit=10", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      // Try MCP endpoint as fallback
      const mcpResponse = await fetch("https://mcp.granola.ai/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "list_meetings",
            arguments: { limit: 10 },
          },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!mcpResponse.ok) {
        return NextResponse.json({
          available: false,
          meetings: [],
          error: "Granola retornou erro. Verifique se a GRANOLA_API_KEY é válida.",
        });
      }

      const mcpData = await mcpResponse.json();
      const meetings = mcpData.result?.content?.[0]?.text
        ? JSON.parse(mcpData.result.content[0].text)
        : mcpData.result ?? [];

      return NextResponse.json({ available: true, meetings });
    }

    const data = await response.json();
    return NextResponse.json({ available: true, meetings: data.meetings ?? data ?? [] });
  } catch {
    return NextResponse.json({
      available: false,
      meetings: [],
      error: "Falha ao conectar com Granola. Verifique sua GRANOLA_API_KEY.",
    });
  }
}
