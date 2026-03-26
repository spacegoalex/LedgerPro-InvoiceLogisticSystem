import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const list = await prisma.destination.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(
      list.map((d) => ({
        id: d.id,
        name: d.name,
        defaultRate: d.defaultRate,
        defaultDeliveryCost: d.defaultDeliveryCost,
        defaultFuel: d.defaultFuel,
        defaultTolls: d.defaultTolls,
        defaultLoading: d.defaultLoading,
        defaultUangBongkar: d.defaultUangBongkar,
        defaultPettyCash: d.defaultPettyCash,
      }))
    );
  } catch (e) {
    console.error("GET /api/master/destinations", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      defaultRate = 0,
      defaultDeliveryCost = 0,
      defaultFuel = 0,
      defaultTolls = 0,
      defaultLoading = 0,
      defaultUangBongkar = 0,
      defaultPettyCash = 0,
    } = body;
    const created = await prisma.destination.create({
      data: {
        name: String(name).trim(),
        defaultRate: Number(defaultRate) || 0,
        defaultDeliveryCost: Number(defaultDeliveryCost) || 0,
        defaultFuel: Number(defaultFuel) || 0,
        defaultTolls: Number(defaultTolls) || 0,
        defaultLoading: Number(defaultLoading) || 0,
        defaultUangBongkar: Number(defaultUangBongkar) || 0,
        defaultPettyCash: Number(defaultPettyCash) || 0,
      },
    });
    return NextResponse.json({
      id: created.id,
      name: created.name,
      defaultRate: created.defaultRate,
      defaultDeliveryCost: created.defaultDeliveryCost,
      defaultFuel: created.defaultFuel,
      defaultTolls: created.defaultTolls,
      defaultLoading: created.defaultLoading,
      defaultUangBongkar: created.defaultUangBongkar,
      defaultPettyCash: created.defaultPettyCash,
    });
  } catch (e) {
    console.error("POST /api/master/destinations", e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
