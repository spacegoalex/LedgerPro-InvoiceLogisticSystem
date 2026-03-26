"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatWithCommas } from "@/lib/utils";
import { FileSpreadsheet, Search, Pencil, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InvoiceRow = {
  id: string;
  date: string;
  invoiceNumber: string;
  nomorSuratJalan: string;
  noPO: string;
  from: string;
  customer: string;
  driver: string;
  vehicle: string;
  destination: string;
  rate: number;
  qty: number;
  netRevenue: number;
  deliveryCost: number;
  fuel: number;
  tolls: number;
  loadingFees: number;
  uangBongkar: number;
  pettyCash: number;
  totalCost: number;
  netProfit: number;
  status: string;
  paidAt: string;
  items: { productName: string; bags: number; kg: number }[];
};

function toNum(s: string): number {
  const n = parseFloat(String(s).replace(/[^\d.-]/g, "")) || 0;
  return isNaN(n) ? 0 : n;
}

export default function InvoicesPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<InvoiceRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [paidAtBulk, setPaidAtBulk] = useState("");
  const [markingLunas, setMarkingLunas] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [costOpenId, setCostOpenId] = useState<string | null>(null);
  const [costPopoverPos, setCostPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const [editForm, setEditForm] = useState({
    date: "",
    customer: "",
    driver: "",
    vehicle: "",
    destination: "",
    rate: "",
    qty: "",
    deliveryCost: "",
    fuel: "",
    tolls: "",
    loadingFees: "",
    uangBongkar: "",
    status: "Pending",
  });
  const [saving, setSaving] = useState(false);

  const loadInvoices = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (search.trim()) params.set("search", search.trim());
    setLoading(true);
    setError(null);
    fetch(`/api/invoices?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load invoices");
        return res.json();
      })
      .then(setInvoices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, [startDate, endDate, search]);

  const openEdit = (row: InvoiceRow) => {
    setEditing(row);
    setEditForm({
      date: row.date,
      customer: row.customer,
      driver: row.driver || "",
      vehicle: row.vehicle || "",
      destination: row.destination || "",
      rate: String(row.rate),
      qty: String(row.qty),
      deliveryCost: String((row as { deliveryCost?: number }).deliveryCost ?? row.totalCost ?? 0),
      fuel: String(row.fuel),
      tolls: String(row.tolls),
      loadingFees: String(row.loadingFees),
      uangBongkar: String((row as { uangBongkar?: number }).uangBongkar ?? 0),
      status: row.status,
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setSaving(false);
  };

  const netRevenue = toNum(editForm.rate) * Math.max(0, toNum(editForm.qty));
  const deliveryCostNum = toNum(editForm.deliveryCost);
  const detailsSum = toNum(editForm.fuel) + toNum(editForm.tolls) + toNum(editForm.loadingFees) + toNum(editForm.uangBongkar);
  const pettyCashComputed = Math.max(0, deliveryCostNum - detailsSum);
  const totalCost = deliveryCostNum;
  const netProfit = netRevenue - totalCost;

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/invoices/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editForm.date,
          customer: editForm.customer,
          driver: editForm.driver || null,
          vehicle: editForm.vehicle || null,
          destination: editForm.destination || null,
          rate: toNum(editForm.rate),
          qty: toNum(editForm.qty),
          netRevenue,
          deliveryCost: deliveryCostNum,
          fuel: toNum(editForm.fuel),
          tolls: toNum(editForm.tolls),
          loadingFees: toNum(editForm.loadingFees),
          uangBongkar: toNum(editForm.uangBongkar),
          pettyCash: pettyCashComputed,
          totalCost,
          netProfit,
          status: editForm.status,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      closeEdit();
      loadInvoices();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

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
  const markAsLunas = async () => {
    if (selectedIds.size === 0 || !paidAtBulk) return;
    setError(null);
    setMarkingLunas(true);
    try {
      const res = await fetch("/api/invoices/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status: "LUNAS", paidAt: paidAtBulk }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Update failed");
      setSelectedIds(new Set());
      setPaidAtBulk("");
      loadInvoices();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setMarkingLunas(false);
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Hapus ${selectedIds.size} invoice yang dipilih? Tindakan ini tidak bisa dibatalkan.`)) return;
    setError(null);
    setDeletingBulk(true);
    try {
      const res = await fetch("/api/invoices/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Delete failed");
      setSelectedIds(new Set());
      loadInvoices();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingBulk(false);
    }
  };

  const exportToExcel = () => {
    const headers = [
      "Vendor",
      "Date",
      "Nomor Invoice",
      "Nomor Surat Jalan",
      "Nomor PO",
      "Customer",
      "From",
      "Destination",
      "Driver",
      "Vehicle",
      "Revenue",
      "Cost",
      "Profit",
      "Status",
      "Fuel",
      "Tolls",
      "Uang Muat",
      "Uang Bongkar",
      "Petty Cash (Sisa Uang)",
      "Produk dan Jumlah Bags",
    ];
    const rows = invoices.map((r) => [
      r.customer,
      r.date,
      r.invoiceNumber,
      r.nomorSuratJalan || "",
      r.noPO || "",
      r.customer,
      r.from || "",
      r.destination || "",
      r.driver || "",
      r.vehicle || "",
      r.netRevenue,
      r.totalCost,
      r.netProfit,
      r.status,
      r.fuel ?? "",
      r.tolls ?? "",
      r.loadingFees ?? "",
      r.uangBongkar ?? "",
      r.pettyCash ?? "",
      (r.items ?? []).map((i) => `${i.productName} (${i.bags} bags)`).join("; ") || "",
    ]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    const filename = `invoices-${startDate || "all"}-${endDate || "all"}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-3">
      <Card className="shrink-0 border-violet-200/60 bg-gradient-to-r from-white to-violet-50/30 shadow-sm">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-semibold bg-gradient-to-r from-violet-700 to-fuchsia-700 bg-clip-text text-transparent">
            Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3 p-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-600">Start date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 w-36"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-600">End date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 w-36"
            />
          </div>
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search invoice #, customer, destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-9"
            />
          </div>
          <Button
            variant="success"
            size="default"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            onClick={exportToExcel}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel (date range)
          </Button>
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-violet-200/60 pt-3 mt-2">
              <Label className="text-xs">Tanggal dibayar</Label>
              <Input
                type="date"
                value={paidAtBulk}
                onChange={(e) => setPaidAtBulk(e.target.value)}
                className="h-8 w-36"
              />
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={markAsLunas}
                disabled={markingLunas || !paidAtBulk}
              >
                {markingLunas ? "Updating…" : `Mark ${selectedIds.size} as LUNAS`}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1"
                onClick={deleteSelected}
                disabled={deletingBulk}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deletingBulk ? "Menghapus…" : `Hapus ${selectedIds.size} invoice`}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>Cancel</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="min-h-0 flex-1 overflow-hidden border-slate-200 shadow-sm">
        <div className="h-full overflow-auto">
          {error && !editing && (
            <p className="p-3 text-sm text-rose-600">
              {error}
              {error.toLowerCase().includes("load") || error.toLowerCase().includes("fetch") ? " Ensure the database is set up (see README)." : ""}
            </p>
          )}
          {loading && (
            <p className="p-3 text-sm text-slate-500">Loading…</p>
          )}
          {!loading && !error && invoices.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <p className="text-sm font-medium text-slate-600">No invoices yet</p>
              <p className="text-xs text-slate-500">Create one from New Invoice, or adjust the date range and search.</p>
            </div>
          )}
          {!loading && !error && invoices.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-100 to-violet-50/50 hover:bg-violet-50/50">
                  <TableHead className="w-10">
                    <input type="checkbox" checked={selectedIds.size === invoices.length && invoices.length > 0} onChange={toggleSelectAll} className="rounded" />
                  </TableHead>
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="w-32 font-mono">Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="w-24">Driver</TableHead>
                  <TableHead className="w-28">Vehicle</TableHead>
                  <TableHead className="text-right font-mono">Revenue</TableHead>
                  <TableHead className="text-right font-mono">Cost</TableHead>
                  <TableHead className="text-right font-mono">Profit</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((row, i) => (
                  <TableRow
                    key={row.id}
                    className={i % 2 === 1 ? "bg-violet-50/30" : ""}
                  >
                    <TableCell className="p-2">
                      <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} className="rounded" />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.date}</TableCell>
                    <TableCell className="font-mono text-xs">{row.invoiceNumber}</TableCell>
                    <TableCell className="text-xs">{row.customer}</TableCell>
                    <TableCell className="text-xs">{row.destination || "—"}</TableCell>
                    <TableCell className="text-xs">{row.driver || "—"}</TableCell>
                    <TableCell className="text-xs font-mono">{row.vehicle || "—"}</TableCell>
                    <TableCell
                      className="text-right font-mono text-xs text-emerald-700"
                      data-financial
                    >
                      {formatCurrency(row.netRevenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          if (costOpenId === row.id) {
                            setCostOpenId(null);
                            setCostPopoverPos(null);
                            return;
                          }
                          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                          const pad = 8;
                          const w = 208;
                          let top = rect.bottom + pad;
                          let left = rect.right - w;
                          if (top + 160 > window.innerHeight) top = rect.top - 160 - pad;
                          if (left < pad) left = pad;
                          if (left + w > window.innerWidth - pad) left = window.innerWidth - w - pad;
                          setCostPopoverPos({ top, left });
                          setCostOpenId(row.id);
                        }}
                        className="font-mono text-xs text-amber-700 hover:underline"
                        data-financial
                      >
                        {formatCurrency(row.totalCost)}
                      </button>
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono text-xs font-medium ${
                        row.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                      data-financial
                    >
                      {formatCurrency(row.netProfit)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.status === "LUNAS" || row.status === "Paid"
                            ? "success"
                            : row.status === "Overdue"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-violet-600 hover:bg-violet-100"
                        onClick={() => openEdit(row)}
                        title="Edit invoice"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Floating cost rincian (portal) */}
      {typeof document !== "undefined" && costOpenId && costPopoverPos && (() => {
        const row = invoices.find((r) => r.id === costOpenId);
        if (!row) return null;
        return createPortal(
          <>
            <div
              className="fixed inset-0 z-[90]"
              aria-hidden
              onClick={() => { setCostOpenId(null); setCostPopoverPos(null); }}
            />
            <div
              className="fixed z-[100] w-52 rounded-lg border border-slate-200 bg-white py-3 px-3 shadow-xl text-left text-xs"
              style={{ top: costPopoverPos.top, left: costPopoverPos.left }}
              role="dialog"
              aria-label="Rincian cost"
            >
              <p className="font-semibold text-slate-800 mb-2">Rincian Cost</p>
              <p>Fuel: {formatCurrency(row.fuel ?? 0)}</p>
              <p>Tolls: {formatCurrency(row.tolls ?? 0)}</p>
              <p>Uang Muat: {formatCurrency(row.loadingFees ?? 0)}</p>
              <p>Uang Bongkar: {formatCurrency(row.uangBongkar ?? 0)}</p>
              <p className="border-t pt-2 mt-2 font-medium">Petty cash: {formatCurrency(row.pettyCash ?? 0)}</p>
            </div>
          </>,
          document.body
        );
      })()}

      {/* Edit invoice modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-hidden border-2 border-violet-200/80 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-violet-50/50 px-4 py-3">
              <h2 className="font-semibold text-violet-900">Edit invoice — {editing.invoiceNumber}</h2>
              <Button variant="ghost" size="sm" onClick={closeEdit}>Close</Button>
            </div>
            <div className="max-h-[70vh] overflow-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={editForm.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Invoice #</Label>
                  <Input value={editing.invoiceNumber} readOnly className="h-8 bg-slate-100 font-mono text-slate-600" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Customer</Label>
                  <Input value={editForm.customer} onChange={(e) => setEditForm((f) => ({ ...f, customer: e.target.value }))} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Destination</Label>
                  <Input value={editForm.destination} onChange={(e) => setEditForm((f) => ({ ...f, destination: e.target.value }))} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Driver</Label>
                  <Input value={editForm.driver} onChange={(e) => setEditForm((f) => ({ ...f, driver: e.target.value }))} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Vehicle</Label>
                  <Input value={editForm.vehicle} onChange={(e) => setEditForm((f) => ({ ...f, vehicle: e.target.value }))} className="h-8 font-mono" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Rate (Rp)</Label>
                  <Input value={formatWithCommas(editForm.rate)} onChange={(e) => setEditForm((f) => ({ ...f, rate: e.target.value.replace(/\D/g, "") }))} className="h-8 font-mono" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Qty</Label>
                  <Input type="number" value={editForm.qty} onChange={(e) => setEditForm((f) => ({ ...f, qty: e.target.value }))} className="h-8 font-mono" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Delivery cost (uang kas jalan)</Label>
                  <Input value={formatWithCommas(editForm.deliveryCost)} onChange={(e) => setEditForm((f) => ({ ...f, deliveryCost: e.target.value.replace(/\D/g, "") }))} className="h-8 font-mono" />
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Fuel</Label>
                    <Input value={formatWithCommas(editForm.fuel)} onChange={(e) => setEditForm((f) => ({ ...f, fuel: e.target.value.replace(/\D/g, "") }))} className="h-8 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tolls</Label>
                    <Input value={formatWithCommas(editForm.tolls)} onChange={(e) => setEditForm((f) => ({ ...f, tolls: e.target.value.replace(/\D/g, "") }))} className="h-8 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Loading fees</Label>
                    <Input value={formatWithCommas(editForm.loadingFees)} onChange={(e) => setEditForm((f) => ({ ...f, loadingFees: e.target.value.replace(/\D/g, "") }))} className="h-8 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Uang bongkar</Label>
                    <Input value={formatWithCommas(editForm.uangBongkar)} onChange={(e) => setEditForm((f) => ({ ...f, uangBongkar: e.target.value.replace(/\D/g, "") }))} className="h-8 font-mono" />
                  </div>
                </div>
                <div className="col-span-2 rounded bg-slate-100 px-2 py-1.5 text-xs">
                  <span className="text-slate-600">Petty cash (sisa, auto): </span>
                  <span className="font-mono font-medium">{formatCurrency(pettyCashComputed)}</span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status</Label>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="LUNAS">LUNAS</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 rounded-lg bg-slate-100 p-2">
                  <p className="text-xs font-medium text-slate-600">Calculated</p>
                  <p className="text-xs font-mono">Revenue: {formatCurrency(netRevenue)} · Delivery cost: {formatCurrency(totalCost)} · Profit: {formatCurrency(netProfit)}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
              <Button variant="outline" onClick={closeEdit}>Cancel</Button>
              <Button onClick={saveEdit} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
