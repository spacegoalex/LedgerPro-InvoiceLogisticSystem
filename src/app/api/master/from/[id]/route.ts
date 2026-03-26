import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json();
    const updated = await prisma.fromOrigin.update({
      where: { id },
      data: { name: String(body.name ?? "").trim() },
    });
    return NextResponse.json({ id: updated.id, name: updated.name });
  } catch (e) {
    console.error("PATCH /api/master/from", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.fromOrigin.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/master/from", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
