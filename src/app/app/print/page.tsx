"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileDown, Loader2, Receipt, CheckCircle, Circle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InvoiceRow = {
  id: string;
  date: string;
  invoiceNumber: string;
  customer: string;
  destination: string;
  netRevenue: number;
  totalCost: number;
  netProfit: number;
};

const DOWNLOAD_KEY = "tagihan-pundi-downloaded";

function getDownloadKey(invoiceNumber: string, type: "invoice" | "kwitansi") {
  return `${DOWNLOAD_KEY}-${invoiceNumber}-${type}`;
}

function isDownloaded(invoiceNumber: string, type: "invoice" | "kwitansi"): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getDownloadKey(invoiceNumber, type)) === "1";
}

function markDownloaded(invoiceNumber: string, type: "invoice" | "kwitansi") {
  if (typeof window === "undefined") return;
  localStorage.setItem(getDownloadKey(invoiceNumber, type), "1");
}

function downloadOnePdf(type: "invoice" | "kwitansi", invoiceNumber: string, onDone?: () => void) {
  const url = `/api/print/${type}?number=${encodeURIComponent(invoiceNumber)}`;
  const a = document.createElement("a");
  a.href = url;
  a.download = type === "invoice" ? `Invoice-${invoiceNumber.replace(/\//g, "-")}.pdf` : `Kwitansi-${invoiceNumber.replace(/\//g, "-")}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  markDownloaded(invoiceNumber, type);
  onDone?.();
}

export default function PrintPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [downloadFlags, setDownloadFlags] = useState(0);

  const loadInvoices = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    fetch(`/api/invoices?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) ? setInvoices(data) : setInvoices([]))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, [startDate, endDate]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === invoices.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(invoices.map((r) => r.id)));
  };

  const selectedInvoices = invoices.filter((r) => selectedIds.has(r.id));

  const bulkDownload = async (type: "invoice" | "kwitansi") => {
    if (selectedInvoices.length === 0) return;
    setDownloading(true);
    for (let i = 0; i < selectedInvoices.length; i++) {
      downloadOnePdf(type, selectedInvoices[i].invoiceNumber, () => setDownloadFlags((f) => f + 1));
      if (i < selectedInvoices.length - 1) await new Promise((r) => setTimeout(r, 400));
    }
    setDownloading(false);
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
        Create Tagihan PUNDI
      </h1>
      <Card className="border-violet-200/60 bg-gradient-to-r from-white to-violet-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Filter & select invoices</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-600">Start date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 w-36" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-600">End date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 w-36" />
          </div>
          <Button variant="outline" size="sm" onClick={loadInvoices} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </CardContent>
      </Card>

      <Card className="min-h-0 flex-1 border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold">Invoices</CardTitle>
          {selectedInvoices.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => bulkDownload("invoice")}
                disabled={downloading}
              >
                <FileDown className="h-4 w-4" />
                Download {selectedInvoices.length} Invoice PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-violet-300 text-violet-700"
                onClick={() => bulkDownload("kwitansi")}
                disabled={downloading}
              >
                <FileDown className="h-4 w-4" />
                Download {selectedInvoices.length} Kwitansi PDF
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-sm text-slate-500">Loading…</p>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <Receipt className="h-10 w-10 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">No invoices</p>
              <p className="text-xs text-slate-500">Create invoices from New Invoice, or adjust the date range.</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[50vh]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-10">
                      <input type="checkbox" checked={selectedIds.size === invoices.length} onChange={toggleSelectAll} className="rounded" />
                    </TableHead>
                    <TableHead className="w-24">Date</TableHead>
                    <TableHead className="font-mono">Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right font-mono">Revenue</TableHead>
                    <TableHead className="text-right font-mono">Cost</TableHead>
                    <TableHead className="text-right font-mono">Profit</TableHead>
                    <TableHead className="w-20 text-center">Invoice</TableHead>
                    <TableHead className="w-20 text-center">Kwitansi</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="p-2">
                        <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} className="rounded" />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.date}</TableCell>
                      <TableCell className="font-mono text-xs">{row.invoiceNumber}</TableCell>
                      <TableCell className="text-xs">{row.customer}</TableCell>
                      <TableCell className="text-xs">{row.destination || "—"}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-emerald-700">{formatCurrency(row.netRevenue)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-amber-700">{formatCurrency(row.totalCost)}</TableCell>
                      <TableCell className="text-right font-mono text-xs font-medium">{formatCurrency(row.netProfit)}</TableCell>
                      <TableCell className="p-1 text-center">
                        <span title={isDownloaded(row.invoiceNumber, "invoice") ? "Sudah didownload" : "Belum didownload"} className="inline-flex items-center justify-center">
                          {isDownloaded(row.invoiceNumber, "invoice") ? (
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-300" />
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="p-1 text-center">
                        <span title={isDownloaded(row.invoiceNumber, "kwitansi") ? "Sudah didownload" : "Belum didownload"} className="inline-flex items-center justify-center">
                          {isDownloaded(row.invoiceNumber, "kwitansi") ? (
                            <CheckCircle className="h-5 w-5 text-violet-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-300" />
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="p-1">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 hover:bg-emerald-50" onClick={() => { downloadOnePdf("invoice", row.invoiceNumber, () => setDownloadFlags((f) => f + 1)); }}>
                            Invoice PDF
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-violet-600 hover:bg-violet-50" onClick={() => { downloadOnePdf("kwitansi", row.invoiceNumber, () => setDownloadFlags((f) => f + 1)); }}>
                            Kwitansi PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
