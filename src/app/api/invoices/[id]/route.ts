import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      date,
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
      status,
      paidAt,
      items,
    } = body;

    if (Array.isArray(items)) {
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      if (items.length > 0) {
        await prisma.invoiceItem.createMany({
          data: items.map((it: { productId?: string; productName: string; bags: number; kg: number }) => ({
            invoiceId: id,
            productId: it.productId || null,
            productName: String(it.productName || ""),
            bags: Number(it.bags) || 0,
            kg: Number(it.kg) || 0,
          })),
        });
      }
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        ...(date != null && { date: String(date) }),
        ...(nomorSuratJalan !== undefined && { nomorSuratJalan: nomorSuratJalan ? String(nomorSuratJalan) : null }),
        ...(noPO !== undefined && { noPO: noPO ? String(noPO) : null }),
        ...(from !== undefined && { from: from ? String(from) : null }),
        ...(customer != null && { customer: String(customer) }),
        ...(driver != null && { driver: driver ? String(driver) : null }),
        ...(vehicle != null && { vehicle: vehicle ? String(vehicle) : null }),
        ...(destination != null && { destination: destination ? String(destination) : null }),
        ...(rate != null && { rate: Number(rate) || 0 }),
        ...(qty != null && { qty: Number(qty) || 1 }),
        ...(netRevenue != null && { netRevenue: Number(netRevenue) || 0 }),
        ...(deliveryCost != null && { deliveryCost: Number(deliveryCost) ?? 0 }),
        ...(fuel != null && { fuel: Number(fuel) || 0 }),
        ...(tolls != null && { tolls: Number(tolls) || 0 }),
        ...(loadingFees != null && { loadingFees: Number(loadingFees) || 0 }),
        ...(uangBongkar != null && { uangBongkar: Number(uangBongkar) ?? 0 }),
        ...(pettyCash != null && { pettyCash: Number(pettyCash) || 0 }),
        ...(totalCost != null && { totalCost: Number(totalCost) || 0 }),
        ...(netProfit != null && { netProfit: Number(netProfit) || 0 }),
        ...(status != null && { status: String(status) }),
        ...(paidAt !== undefined && { paidAt: paidAt ? String(paidAt) : null }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      invoiceNumber: updated.invoiceNumber,
    });
  } catch (e) {
    console.error("PATCH /api/invoices/[id]", e);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}
