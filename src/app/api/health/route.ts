import { NextResponse } from "next/server";
import { getExternalAdapterStatus } from "@/lib/analyzer/optional-adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  const adapterStatus = getExternalAdapterStatus();

  return NextResponse.json({
    status: "healthy",
    product: "The Manipulation Decoder",
    version: "1.0.0",
    engine: "Heuristic Linguistic & Cybersecurity Evaluation Engine",
    timestamp: new Date().toISOString(),
    adapters: adapterStatus,
  });
}
