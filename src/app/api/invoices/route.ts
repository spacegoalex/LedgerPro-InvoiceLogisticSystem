import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") ?? "";
    const endDate = searchParams.get("endDate") ?? "";
    const search = (searchParams.get("search") ?? "").trim();

    const where: Prisma.InvoiceWhereInput = {};
    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    }
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { contains: search } },
        { destination: { contains: search } },
        { driver: { contains: search } },
        { vehicle: { contains: search } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { invoiceNumber: "desc" },
      include: { items: true },
    });

    return NextResponse.json(
      invoices.map((inv) => ({
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
        paidAt: (inv as { paidAt?: string | null }).paidAt ?? "",
        items: inv.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          bags: i.bags,
          kg: i.kg,
        })),
      }))
    );
  } catch (e) {
    console.error("GET /api/invoices", e);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      invoiceNumber,
      nomorSuratJalan,
      noPO,
      from,
      customer,
      driver,
      vehicle,
      destination,
      rate,
      qty,
      netRevenue,
      deliveryCost,
      fuel,
      tolls,
      loadingFees,
      uangBongkar,
      pettyCash,
      totalCost,
      netProfit,
      status = "Pending",
      items = [],
    } = body;

    const invoice = await prisma.invoice.create({
      data: {
        date: String(date),
        invoiceNumber: String(invoiceNumber),
        nomorSuratJalan: nomorSuratJalan ? String(nomorSuratJalan) : null,
        noPO: noPO ? String(noPO) : null,
        from: from ? String(from) : null,
        customer: String(customer),
        driver: driver ? String(driver) : null,
        vehicle: vehicle ? String(vehicle) : null,
        destination: destination ? String(destination) : null,
        rate: Number(rate) || 0,
        qty: Number(qty) || 1,
        netRevenue: Number(netRevenue) || 0,
        deliveryCost: Number(deliveryCost) ?? 0,
        fuel: Number(fuel) || 0,
        tolls: Number(tolls) || 0,
        loadingFees: Number(loadingFees) || 0,
        uangBongkar: Number(uangBongkar) ?? 0,
        pettyCash: Number(pettyCash) ?? 0,
        totalCost: Number(totalCost) ?? 0,
        netProfit: Number(netProfit) || 0,
        status: String(status),
        items: Array.isArray(items) && items.length > 0
          ? {
              create: items.map((it: { productId?: string; productName: string; bags: number; kg: number }) => ({
                productId: it.productId || null,
                productName: String(it.productName || ""),
                bags: Number(it.bags) || 0,
                kg: Number(it.kg) || 0,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    });
  } catch (e) {
    console.error("POST /api/invoices", e);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
