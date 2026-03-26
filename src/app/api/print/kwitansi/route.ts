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
    let y = 30;

    doc.setFontSize(16);
    doc.text("KWITANSI", pageW / 2, y, { align: "center" });
    y += 14;

    doc.setFontSize(10);
    doc.text(`No. ${inv.invoiceNumber}`, pageW / 2, y, { align: "center" });
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.text(`Telah terima dari: ${inv.customer}`, 14, y);
    y += 8;
    doc.text(`Uang sejumlah: Rp ${inv.netRevenue.toLocaleString("id-ID")}`, 14, y);
    y += 8;
    doc.text(`Terbilang: (untuk pembayaran sesuai invoice ${inv.invoiceNumber})`, 14, y);
    y += 12;

    doc.text(`Tanggal: ${inv.date}`, 14, y);
    y += 6;
    doc.text(`Dari: ${inv.from || "-"}`, 14, y);
    y += 6;
    doc.text(`Tujuan: ${inv.destination || "-"}`, 14, y);
    y += 14;

    doc.text("Penerima,", 14, y);
    y += 24;
    doc.text("(_______________________)", 14, y);

    const blob = doc.output("arraybuffer");
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Kwitansi-${inv.invoiceNumber.replace(/\//g, "-")}.pdf"`,
      },
    });
  } catch (e) {
    console.error("GET /api/print/kwitansi", e);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
