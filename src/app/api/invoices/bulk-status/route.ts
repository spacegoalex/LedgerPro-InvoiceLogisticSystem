import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, status, paidAt } = body as { ids?: string[]; status?: string; paidAt?: string };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }
    const data: { status?: string; paidAt?: string | null } = {};
    if (status != null && status !== "") data.status = String(status);
    if (paidAt !== undefined) data.paidAt = paidAt ? String(paidAt) : null;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "status or paidAt required" }, { status: 400 });
    }
    await prisma.invoice.updateMany({
      where: { id: { in: ids } },
      data,
    });
    return NextResponse.json({ updated: ids.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update";
    console.error("PATCH /api/invoices/bulk-status", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
