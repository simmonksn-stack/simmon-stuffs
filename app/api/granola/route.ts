import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch("https://mcp.granola.ai/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "list_meetings",
          arguments: {
            limit: 10,
          },
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { available: false, meetings: [], error: "Granola não disponível" },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ available: true, meetings: data.result ?? [] });
  } catch {
    return NextResponse.json(
      { available: false, meetings: [], error: "Granola não configurado ou indisponível. Use o campo manual abaixo." },
      { status: 200 }
    );
  }
}
