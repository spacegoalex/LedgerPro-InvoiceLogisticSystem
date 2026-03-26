"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnterNavigation } from "@/hooks/useEnterNavigation";
import { formatCurrency, formatWithCommas } from "@/lib/utils";
import { Save, CheckCircle2, RotateCcw, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

const DRAFT_KEY = "swl-invoice-draft";

type InvoiceItemDraft = { productId: string; productName: string; bags: string; kg: string };

type Draft = {
  date: string;
  nomorSuratJalan: string;
  noPO: string;
  from: string;
  customer: string;
  driver: string;
  vehicle: string;
  destination: string;
  rate: string;
  qty: string;
  deliveryCost: string;
  fuel: string;
  tolls: string;
  loadingFees: string;
  uangBongkar: string;
  items?: InvoiceItemDraft[];
};

function loadDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    return d && typeof d.date === "string" ? d : null;
  } catch {
    return null;
  }
}

function saveDraft(d: Draft) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {}
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

type Customer = { id: string; name: string };
type Driver = { id: string; name: string };
type Vehicle = { id: string; name: string };
type Destination = {
  id: string;
  name: string;
  defaultRate: number;
  defaultDeliveryCost?: number;
  defaultFuel: number;
  defaultTolls: number;
  defaultLoading: number;
  defaultUangBongkar?: number;
  defaultPettyCash: number;
};

const defaultDate = () => new Date().toISOString().slice(0, 10);

function toNum(s: string): number {
  const n = parseFloat(String(s).replace(/[^\d.-]/g, "")) || 0;
  return isNaN(n) ? 0 : n;
}

const DEFAULT_CUSTOMER = "PT. Pundi Kencana";
const DEFAULT_FROM = "Cilegon";

const defaultDraft = (): Draft => ({
  date: defaultDate(),
  nomorSuratJalan: "",
  noPO: "",
  from: DEFAULT_FROM,
  customer: DEFAULT_CUSTOMER,
  driver: "",
  vehicle: "",
  destination: "",
  rate: "",
  qty: "1",
  deliveryCost: "0",
  fuel: "0",
  tolls: "0",
  loadingFees: "0",
  uangBongkar: "0",
  items: [],
});

function getInitialFormState(): Draft {
  const d = loadDraft();
  if (!d) return defaultDraft();
  const hasNew = "deliveryCost" in d && "uangBongkar" in d;
  const base = hasNew ? (d as Draft) : (() => {
    const old = d as Draft & { pettyCash?: string };
    const deliveryCost =
      String((old as { deliveryCost?: string }).deliveryCost || "").trim() ||
      String(toNum(old.fuel) + toNum(old.tolls) + toNum(old.loadingFees) + toNum(old.pettyCash ?? "0"));
    return { ...old, deliveryCost, uangBongkar: (old as { uangBongkar?: string }).uangBongkar ?? "0" };
  })();
  return {
    ...defaultDraft(),
    ...base,
    nomorSuratJalan: (base as Draft).nomorSuratJalan ?? "",
    noPO: (base as Draft).noPO ?? "",
    from: (base as Draft).from ?? "",
    items: Array.isArray((base as Draft).items) ? (base as Draft).items! : [],
  };
}

export default function NewInvoicePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEnterNavigation(containerRef);

  const initial = useRef(getInitialFormState()).current;
  const [date, setDate] = useState(initial.date);
  const [nomorSuratJalan, setNomorSuratJalan] = useState(initial.nomorSuratJalan);
  const [noPO, setNoPO] = useState(initial.noPO);
  const [from, setFrom] = useState(initial.from || DEFAULT_FROM);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customer, setCustomer] = useState(initial.customer || DEFAULT_CUSTOMER);
  const [driver, setDriver] = useState(initial.driver);
  const [vehicle, setVehicle] = useState(initial.vehicle);
  const [destination, setDestination] = useState(initial.destination);
  const [defaultsSet, setDefaultsSet] = useState(false);
  const [rate, setRate] = useState(initial.rate);
  const [qty, setQty] = useState(initial.qty);
  const [deliveryCost, setDeliveryCost] = useState(initial.deliveryCost);
  const [fuel, setFuel] = useState(initial.fuel);
  const [tolls, setTolls] = useState(initial.tolls);
  const [loadingFees, setLoadingFees] = useState(initial.loadingFees);
  const [uangBongkar, setUangBongkar] = useState(initial.uangBongkar);
  const [items, setItems] = useState<InvoiceItemDraft[]>(initial.items ?? []);
  const [costDetailsOpen, setCostDetailsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [showUseSameData, setShowUseSameData] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; kgPerBag: number }[]>([]);
  const [fromOrigins, setFromOrigins] = useState<{ id: string; name: string }[]>([]);

  const draft: Draft = useMemo(
    () => ({
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
      deliveryCost,
      fuel,
      tolls,
      loadingFees,
      uangBongkar,
      items,
    }),
    [date, nomorSuratJalan, noPO, from, customer, driver, vehicle, destination, rate, qty, deliveryCost, fuel, tolls, loadingFees, uangBongkar, items]
  );
  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    Promise.all([
      fetch("/api/master/customers").then((r) => r.json()),
      fetch("/api/master/drivers").then((r) => r.json()),
      fetch("/api/master/vehicles").then((r) => r.json()),
      fetch("/api/master/destinations").then((r) => r.json()),
      fetch("/api/master/products").then((r) => r.json()),
      fetch("/api/master/from").then((r) => r.json()),
    ]).then(([c, d, v, dest, prod, fromList]) => {
      const custList = Array.isArray(c) ? c : [];
      const fromListArr = Array.isArray(fromList) ? fromList : [];
      setCustomers(custList);
      setDrivers(Array.isArray(d) ? d : []);
      setVehicles(Array.isArray(v) ? v : []);
      setDestinations(Array.isArray(dest) ? dest : []);
      setProducts(Array.isArray(prod) ? prod : []);
      setFromOrigins(fromListArr);
      if (!defaultsSet) {
        setCustomer((c) => ((c === "" || c === DEFAULT_CUSTOMER) && custList.some((x: { name: string }) => x.name === DEFAULT_CUSTOMER) ? DEFAULT_CUSTOMER : c));
        setFrom((f) => ((f === "" || f === DEFAULT_FROM) && fromListArr.some((x: { name: string }) => x.name === DEFAULT_FROM) ? DEFAULT_FROM : f));
        setDefaultsSet(true);
      }
    });
  }, [defaultsSet]);

  const year = date.slice(0, 4);
  useEffect(() => {
    fetch(`/api/invoices/next-number?year=${year}`)
      .then((r) => r.json())
      .then((data: { invoiceNumber?: string }) => setInvoiceNumber(data.invoiceNumber ?? ""));
  }, [year]);

  const selectedDest = useMemo(
    () => destinations.find((d) => d.name === destination),
    [destinations, destination]
  );
  useEffect(() => {
    if (!selectedDest) return;
    setRate(String(selectedDest.defaultRate));
    setDeliveryCost(String(selectedDest.defaultDeliveryCost ?? 0));
    setFuel(String(selectedDest.defaultFuel));
    setTolls(String(selectedDest.defaultTolls));
    setLoadingFees(String(selectedDest.defaultLoading));
    setUangBongkar(String(selectedDest.defaultUangBongkar ?? 0));
  }, [selectedDest?.id]);

  const netRevenue = useMemo(
    () => toNum(rate) * Math.max(0, toNum(qty)),
    [rate, qty]
  );
  const detailsSum = useMemo(
    () => toNum(fuel) + toNum(tolls) + toNum(loadingFees) + toNum(uangBongkar),
    [fuel, tolls, loadingFees, uangBongkar]
  );
  const deliveryCostNum = toNum(deliveryCost);
  const pettyCashComputed = Math.max(0, deliveryCostNum - detailsSum);
  const totalCost = deliveryCostNum;
  const netProfit = useMemo(() => netRevenue - totalCost, [netRevenue, totalCost]);

  const resetForm = () => {
    clearDraft();
    const def = defaultDraft();
    setDate(def.date);
    setNomorSuratJalan(def.nomorSuratJalan);
    setNoPO(def.noPO);
    setFrom(def.from);
    setCustomer(def.customer);
    setDriver(def.driver);
    setVehicle(def.vehicle);
    setDestination(def.destination);
    setRate(def.rate);
    setQty(def.qty);
    setDeliveryCost(def.deliveryCost);
    setFuel(def.fuel);
    setTolls(def.tolls);
    setLoadingFees(def.loadingFees);
    setUangBongkar(def.uangBongkar);
    setItems(def.items ?? []);
    setSaveStatus("idle");
    setShowUseSameData(false);
    fetch(`/api/invoices/next-number?year=${def.date.slice(0, 4)}`)
      .then((r) => r.json())
      .then((data: { invoiceNumber?: string }) => setInvoiceNumber(data.invoiceNumber ?? ""));
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { productId: "", productName: "", bags: "", kg: "" }]);
  };
  const setItemProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    setItems((prev) => {
      const next = [...prev];
      if (!product) {
        next[index] = { ...next[index], productId: "", productName: "", kg: "" };
        return next;
      }
      next[index] = {
        ...next[index],
        productId: product.id,
        productName: product.name,
        kg: next[index].bags ? String(toNum(next[index].bags) * product.kgPerBag) : "",
      };
      return next;
    });
  };
  const setItemBags = (index: number, bags: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index].bags = bags;
      const p = products.find((x) => x.id === next[index].productId || x.name === next[index].productName);
      const kgPerBag = p?.kgPerBag ?? 25;
      next[index].kg = bags ? String(toNum(bags) * kgPerBag) : "";
      return next;
    });
  };
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const saveInvoice = async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          invoiceNumber,
          nomorSuratJalan: nomorSuratJalan.trim() || null,
          noPO: noPO.trim() || null,
          from: from.trim() || null,
          customer,
          driver,
          vehicle,
          destination: destination || null,
          rate: toNum(rate),
          qty: toNum(qty),
          netRevenue,
          deliveryCost: deliveryCostNum,
          fuel: toNum(fuel),
          tolls: toNum(tolls),
          loadingFees: toNum(loadingFees),
          uangBongkar: toNum(uangBongkar),
          pettyCash: pettyCashComputed,
          totalCost,
          netProfit,
          status: "Pending",
          items: items
            .filter((i) => i.productName.trim() && (toNum(i.bags) > 0 || toNum(i.kg) > 0))
            .map((i) => ({
              productId: i.productId || null,
              productName: i.productName.trim(),
              bags: toNum(i.bags),
              kg: toNum(i.kg),
            })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setSaveStatus("success");
      setShowUseSameData(true);
    } catch {
      setSaveStatus("error");
    }
  };

  return (
    <div
      ref={containerRef}
      className="grid h-full grid-cols-12 gap-3 overflow-hidden p-3"
    >
      {/* Panel A: Logistics Context */}
      <div className="col-span-3 flex flex-col gap-2 overflow-auto">
        <Card className="border-indigo-200/60 bg-gradient-to-br from-slate-50 to-indigo-50/40 shadow-sm">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Logistics Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            <div className="space-y-1">
              <Label className="text-xs">Tanggal surat jalan</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Invoice</Label>
              <Input value={invoiceNumber} readOnly className="h-8 font-mono text-slate-600 bg-slate-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nomor surat jalan</Label>
              <Input value={nomorSuratJalan} onChange={(e) => setNomorSuratJalan(e.target.value)} placeholder="Optional" className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">No PO</Label>
              <Input value={noPO} onChange={(e) => setNoPO(e.target.value)} placeholder="Optional" className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Customer / Vendor</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {fromOrigins.map((o) => (
                    <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Destination</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select (auto-fills rate & cost)..." />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((d) => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Driver</Label>
              <Select value={driver} onValueChange={setDriver}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Vehicle</Label>
              <Select value={vehicle} onValueChange={setVehicle}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel B: Revenue & Cost */}
      <div className="col-span-5 flex flex-col gap-2 overflow-auto">
        <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-white shadow-sm">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Rate (Rp)</Label>
                <Input value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0" className="h-8 font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input type="number" min={0} value={qty} onChange={(e) => setQty(e.target.value)} className="h-8 font-mono" />
              </div>
            </div>
            <div className="flex justify-between border-t border-emerald-200/60 pt-2">
              <span className="text-xs font-medium text-emerald-800">Net Revenue</span>
              <span data-financial className="font-mono text-sm font-semibold text-emerald-700">
                {formatCurrency(netRevenue)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60 bg-gradient-to-br from-slate-50 to-white shadow-sm">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Items (Product · Bags · Kg · Ton)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            <div className="space-y-1.5">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 rounded border border-slate-200/60 bg-white p-2">
                  <Select value={item.productId || item.productName} onValueChange={(v) => setItemProduct(idx, v)}>
                    <SelectTrigger className="h-8 w-36">
                      <SelectValue placeholder="Product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.kgPerBag} kg/bag)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs w-8">Bags</Label>
                    <Input
                      type="number"
                      min={0}
                      className="h-8 w-20 font-mono"
                      value={item.bags}
                      onChange={(e) => setItemBags(idx, e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs w-6">Kg</Label>
                    <Input readOnly className="h-8 w-20 font-mono bg-slate-100 text-slate-600" value={item.kg} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs w-7">Ton</Label>
                    <Input readOnly className="h-8 w-16 font-mono bg-slate-100 text-slate-600 text-xs" value={item.kg ? (toNum(item.kg) / 1000).toFixed(3) : "0"} />
                  </div>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-rose-500" onClick={() => removeItem(idx)} title="Remove row">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-1 w-full" onClick={addItemRow}>
              <Plus className="h-4 w-4" /> Add product row
            </Button>
          </CardContent>
        </Card>
        <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white shadow-sm">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              Cost (Uang kas jalan)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            <div className="space-y-1">
              <Label className="text-xs">Delivery cost (total given, e.g. 1,000,000)</Label>
              <Input
                value={formatWithCommas(deliveryCost)}
                onChange={(e) => setDeliveryCost(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                className="h-8 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => setCostDetailsOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-md border border-amber-200/60 bg-amber-50/50 px-2 py-1.5 text-left text-xs font-medium text-amber-800 hover:bg-amber-100/50"
            >
              {costDetailsOpen ? "Hide" : "Show"} details (fuel, tolls, loading, uang bongkar)
              {costDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {costDetailsOpen && (
              <div className="space-y-2 rounded-md border border-amber-200/40 bg-white/60 p-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Fuel</Label>
                    <Input
                      value={formatWithCommas(fuel)}
                      onChange={(e) => setFuel(e.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      className="h-8 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tolls</Label>
                    <Input
                      value={formatWithCommas(tolls)}
                      onChange={(e) => setTolls(e.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      className="h-8 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Loading fees</Label>
                    <Input
                      value={formatWithCommas(loadingFees)}
                      onChange={(e) => setLoadingFees(e.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      className="h-8 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Uang bongkar</Label>
                    <Input
                      value={formatWithCommas(uangBongkar)}
                      onChange={(e) => setUangBongkar(e.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      className="h-8 font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-between border-t border-amber-200/40 pt-2 text-xs">
                  <span className="text-amber-700">Petty cash (sisa, auto)</span>
                  <span data-financial className="font-mono font-medium text-amber-800">
                    {formatCurrency(pettyCashComputed)}
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-between border-t border-amber-200/60 pt-2">
              <span className="text-xs font-medium text-amber-800">Total cost</span>
              <span data-financial className="font-mono text-sm font-semibold text-amber-700">
                {formatCurrency(totalCost)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel C: Net Profit + Save */}
      <div className="col-span-4 flex flex-col gap-2 overflow-auto">
        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Profit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3">
            <div className="rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 text-center ring-1 ring-violet-200/50">
              <p className="text-xs font-medium text-slate-600">Net Profit</p>
              <p
                data-financial
                className={`font-mono text-2xl font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                {formatCurrency(netProfit)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="default"
                size="sm"
                className="w-full gap-1.5 bg-violet-600 hover:bg-violet-700"
                onClick={saveInvoice}
                disabled={saveStatus === "saving" || !customer}
              >
                <Save className="h-4 w-4" />
                {saveStatus === "saving" ? "Saving…" : "Save to database"}
              </Button>
              {saveStatus === "success" && !showUseSameData && (
                <p className="text-xs text-emerald-600">Saved.</p>
              )}
              {saveStatus === "error" && (
                <p className="text-xs text-rose-600">Save failed. Check DB setup.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* After save: "Use same data?" — Yes = keep form, No = reset and stay on New Invoice */}
      {showUseSameData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md overflow-hidden border-2 border-violet-200/80 bg-gradient-to-b from-white to-violet-50/30 shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Invoice saved</h2>
                  <p className="text-sm text-emerald-100">Successfully saved to database</p>
                </div>
              </div>
            </div>
            <CardContent className="space-y-5 p-6">
              <p className="text-center text-sm font-medium text-slate-700">
                Use the same data for the next invoice?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShowUseSameData(false)}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-violet-200 bg-violet-50/50 py-4 transition-all hover:border-violet-400 hover:bg-violet-100/80 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <CheckCircle2 className="h-10 w-10 text-violet-600" />
                  <span className="font-semibold text-violet-800">Yes, keep it</span>
                  <span className="text-xs text-slate-500">Stay and enter next invoice with same details</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50/50 py-4 transition-all hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <RotateCcw className="h-10 w-10 text-slate-600" />
                  <span className="font-semibold text-slate-800">No, start fresh</span>
                  <span className="text-xs text-slate-500">Clear form and get new invoice number</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
