import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const list = await prisma.vehicle.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(list.map((v) => ({ id: v.id, name: v.name })));
  } catch (e) {
    console.error("GET /api/master/vehicles", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const created = await prisma.vehicle.create({ data: { name: String(name).trim() } });
    return NextResponse.json({ id: created.id, name: created.name });
  } catch (e) {
    console.error("POST /api/master/vehicles", e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
