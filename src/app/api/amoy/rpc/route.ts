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

  console.log("req", req);

  const body = await req.json();

  console.log("body", body);

  console.log("rpcUrl", rpcUrl);
  console.log("apiKey", apiKey);
  console.log("req.headers", req.headers);
  console.log("JSON.stringify(body)", JSON.stringify(body));
  console.log("JSON.stringify(req.headers)", JSON.stringify(req.headers));

  console.log(`${rpcUrl}/${apiKey}`);

  const res = await fetch(`${rpcUrl}/${apiKey}`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  console.log("res", res);

  if (!res.ok) {
    return NextResponse.json(await res.json().catch((e) => ({})), {
      status: res.status,
    });
  }

  return NextResponse.json(await res.json());
}
