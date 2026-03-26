import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const invoices = await prisma.invoice.findMany({
      select: { date: true, netRevenue: true, totalCost: true, netProfit: true },
    });
    const byMonth: Record<string, { revenue: number; cost: number; profit: number }> = {};
    for (const inv of invoices) {
      const monthKey = inv.date.slice(0, 7);
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = { revenue: 0, cost: 0, profit: 0 };
      }
      byMonth[monthKey].revenue += inv.netRevenue;
      byMonth[monthKey].cost += inv.totalCost;
      byMonth[monthKey].profit += inv.netProfit;
    }
    const data = Object.entries(byMonth)
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => a.month.localeCompare(b.month));
    return NextResponse.json(data);
  } catch (e) {
    console.error("GET /api/analytics", e);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
