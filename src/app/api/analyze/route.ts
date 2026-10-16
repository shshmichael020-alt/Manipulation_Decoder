import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/types/analyzer";
import { runAnalysisEngine } from "@/lib/analyzer/engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce strict request size check (< 250KB for EML support)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 256000) {
      return NextResponse.json(
        {
          error: "Payload Too Large",
          message: "Submitted content exceeds maximum allowable payload size (250KB).",
        },
        { status: 413 }
      );
    }

    // 2. Parse JSON safely
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON",
          message: "Request body could not be parsed as valid JSON.",
        },
        { status: 400 }
      );
    }

    // 3. Schema validation with Zod
    const validationResult = AnalyzeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errorDetails = validationResult.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json(
        {
          error: "Validation Error",
          details: errorDetails,
        },
        { status: 400 }
      );
    }

    // 4. Run Analysis Engine
    // Privacy safeguard: do not log raw message contents to console!
    const report = await runAnalysisEngine(validationResult.data);

    // 5. Return structured report with no-store privacy header
    return NextResponse.json(report, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    // Safe error reporting without leaking internal stack traces or user payload
    console.error("[Analyzer API Error] An unexpected error occurred during message processing.");
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while analyzing the message. Please try again.",
      },
      { status: 500 }
    );
  }
}
