import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.invoiceItem.deleteMany({ where: { invoiceId: { in: ids } } }),
      prisma.invoice.deleteMany({ where: { id: { in: ids } } }),
    ]);
    return NextResponse.json({ deleted: ids.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete";
    console.error("DELETE /api/invoices/bulk-delete", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
