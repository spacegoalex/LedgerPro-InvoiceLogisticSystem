import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json();
    const name = body.name != null ? String(body.name).trim() : undefined;
    const kgPerBag = body.kgPerBag != null ? Number(body.kgPerBag) || 25 : undefined;
    const updated = await prisma.product.update({
      where: { id },
      data: { ...(name != null && { name }), ...(kgPerBag != null && { kgPerBag }) },
    });
    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      kgPerBag: updated.kgPerBag,
    });
  } catch (e) {
    console.error("PATCH /api/master/products", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/master/products", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
