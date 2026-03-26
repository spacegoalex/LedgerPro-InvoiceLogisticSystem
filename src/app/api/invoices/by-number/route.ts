import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const number = request.nextUrl.searchParams.get("number")?.trim();
    if (!number) {
      return NextResponse.json({ error: "Missing number" }, { status: 400 });
    }
    const inv = await prisma.invoice.findUnique({
      where: { invoiceNumber: number },
      include: { items: true },
    });
    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: inv.id,
      date: inv.date,
      invoiceNumber: inv.invoiceNumber,
      nomorSuratJalan: inv.nomorSuratJalan ?? "",
      noPO: inv.noPO ?? "",
      from: inv.from ?? "",
      customer: inv.customer,
      driver: inv.driver ?? "",
      vehicle: inv.vehicle ?? "",
      destination: inv.destination ?? "",
      rate: inv.rate,
      qty: inv.qty,
      netRevenue: inv.netRevenue,
      deliveryCost: inv.deliveryCost,
      fuel: inv.fuel,
      tolls: inv.tolls,
      loadingFees: inv.loadingFees,
      uangBongkar: inv.uangBongkar,
      pettyCash: inv.pettyCash,
      totalCost: inv.totalCost,
      netProfit: inv.netProfit,
      status: inv.status,
      items: inv.items.map((i) => ({
        id: i.id,
        productName: i.productName,
        bags: i.bags,
        kg: i.kg,
      })),
    });
  } catch (e) {
    console.error("GET /api/invoices/by-number", e);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}
