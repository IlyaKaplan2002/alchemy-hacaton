import { NextResponse } from "next/server";
import { polygonAmoy } from "@alchemy/aa-core";

export async function POST(req: Request) {
  const rpcUrl = polygonAmoy.rpcUrls.alchemy.http[0];
  const apiKey = process.env.AMOY_ALCHEMY_API_KEY;

  if (apiKey == null) {
    return NextResponse.json(
      { error: "ALCHEMY_API_KEY is not set" },
      { status: 500 },
    );
  }

  const body = await req.json();

  const res = await fetch(`${rpcUrl}/${apiKey}`, {
    method: "POST",
    headers: {
      ...req.headers,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(await res.json().catch((e) => ({})), {
      status: res.status,
    });
  }

  return NextResponse.json(await res.json());
}
