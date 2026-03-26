import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const list = await prisma.product.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(
      list.map((p) => ({ id: p.id, name: p.name, kgPerBag: p.kgPerBag }))
    );
  } catch (e) {
    console.error("GET /api/master/products", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const kgPerBag = Number(body.kgPerBag) || 25;
    const created = await prisma.product.create({
      data: { name, kgPerBag },
    });
    return NextResponse.json({
      id: created.id,
      name: created.name,
      kgPerBag: created.kgPerBag,
    });
  } catch (e) {
    console.error("POST /api/master/products", e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
