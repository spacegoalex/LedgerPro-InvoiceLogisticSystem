import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await prisma.destination.update({
      where: { id },
      data: {
        name: body.name != null ? String(body.name).trim() : undefined,
        defaultRate: body.defaultRate != null ? Number(body.defaultRate) : undefined,
        defaultDeliveryCost: body.defaultDeliveryCost != null ? Number(body.defaultDeliveryCost) : undefined,
        defaultFuel: body.defaultFuel != null ? Number(body.defaultFuel) : undefined,
        defaultTolls: body.defaultTolls != null ? Number(body.defaultTolls) : undefined,
        defaultLoading: body.defaultLoading != null ? Number(body.defaultLoading) : undefined,
        defaultUangBongkar: body.defaultUangBongkar != null ? Number(body.defaultUangBongkar) : undefined,
        defaultPettyCash: body.defaultPettyCash != null ? Number(body.defaultPettyCash) : undefined,
      },
    });
    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      defaultRate: updated.defaultRate,
      defaultDeliveryCost: updated.defaultDeliveryCost,
      defaultFuel: updated.defaultFuel,
      defaultTolls: updated.defaultTolls,
      defaultLoading: updated.defaultLoading,
      defaultUangBongkar: updated.defaultUangBongkar,
      defaultPettyCash: updated.defaultPettyCash,
    });
  } catch (e) {
    console.error("PATCH /api/master/destinations", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.destination.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/master/destinations", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
