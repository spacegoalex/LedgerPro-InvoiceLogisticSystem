import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
// @ts-expect-error jspdf has no types
import { jsPDF } from "jspdf";

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

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 18;

    doc.setFontSize(18);
    doc.text("INVOICE", pageW / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(10);
    doc.text(`No. ${inv.invoiceNumber}`, 14, y);
    y += 6;
    doc.text(`Date: ${inv.date}`, 14, y);
    y += 6;
    if (inv.nomorSuratJalan) {
      doc.text(`Surat Jalan: ${inv.nomorSuratJalan}`, 14, y);
      y += 6;
    }
    if (inv.noPO) {
      doc.text(`No. PO: ${inv.noPO}`, 14, y);
      y += 6;
    }
    y += 4;

    doc.text(`From: ${inv.from || "-"}`, 14, y);
    y += 6;
    doc.text(`To / Customer: ${inv.customer}`, 14, y);
    y += 6;
    doc.text(`Destination: ${inv.destination || "-"}`, 14, y);
    y += 6;
    doc.text(`Driver: ${inv.driver || "-"} | Vehicle: ${inv.vehicle || "-"}`, 14, y);
    y += 10;

    if (inv.items.length > 0) {
      doc.setFontSize(11);
      doc.text("Items", 14, y);
      y += 6;
      doc.setFontSize(9);
      inv.items.forEach((i) => {
        doc.text(`${i.productName} — ${i.bags} bag, ${i.kg} kg`, 18, y);
        y += 5;
      });
      y += 4;
    }

    doc.text(`Rate: Rp ${inv.rate.toLocaleString("id-ID")}`, 14, y);
    y += 6;
    doc.text(`Qty: ${inv.qty}`, 14, y);
    y += 6;
    doc.text(`Net Revenue: Rp ${inv.netRevenue.toLocaleString("id-ID")}`, 14, y);
    y += 6;
    doc.text(`Total Cost: Rp ${inv.totalCost.toLocaleString("id-ID")}`, 14, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text(`Net Profit: Rp ${inv.netProfit.toLocaleString("id-ID")}`, 14, y);

    const blob = doc.output("arraybuffer");
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${inv.invoiceNumber.replace(/\//g, "-")}.pdf"`,
      },
    });
  } catch (e) {
    console.error("GET /api/print/invoice", e);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
