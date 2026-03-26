import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const year = request.nextUrl.searchParams.get("year") ?? new Date().getFullYear().toString();
    const invoices = await prisma.invoice.findMany({
      where: { invoiceNumber: { contains: `LP/${year}` } },
      select: { invoiceNumber: true },
    });
    const sequences = invoices
      .map((inv) => {
        const match = inv.invoiceNumber.match(/^(\d+)\/LP\/\d+$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);
    const nextSeq = (sequences.length ? Math.max(...sequences) : 0) + 1;
    const invoiceNumber = `${String(nextSeq).padStart(4, "0")}/LP/${year}`;
    return NextResponse.json({ invoiceNumber });
  } catch (e) {
    console.error("GET /api/invoices/next-number", e);
    return NextResponse.json({ error: "Failed to get next number" }, { status: 500 });
  }
}
