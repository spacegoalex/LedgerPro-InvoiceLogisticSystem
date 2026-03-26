"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn, formatWithCommas } from "@/lib/utils";
import {
  Users,
  Truck,
  Car,
  MapPin,
  Package,
  Building2,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

type Customer = { id: string; name: string };
type Driver = { id: string; name: string };
type Vehicle = { id: string; name: string };
type Product = { id: string; name: string; kgPerBag: number };
type FromOrigin = { id: string; name: string };
type Destination = {
  id: string;
  name: string;
  defaultRate: number;
  defaultDeliveryCost: number;
  defaultFuel: number;
  defaultTolls: number;
  defaultLoading: number;
  defaultUangBongkar: number;
  defaultPettyCash: number;
};

const TABS = [
  { id: "customers", label: "Customers / Vendors", icon: Users },
  { id: "drivers", label: "Drivers", icon: Truck },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "destinations", label: "Destinations", icon: MapPin },
  { id: "from", label: "From", icon: Building2 },
  { id: "products", label: "Products", icon: Package },
] as const;

export default function MasterPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("customers");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fromOrigins, setFromOrigins] = useState<FromOrigin[]>([]);
  const [newName, setNewName] = useState("");
  const [productKgPerBag, setProductKgPerBag] = useState("25");
  const [destForm, setDestForm] = useState({
    name: "",
    defaultRate: "",
    defaultDeliveryCost: "",
    defaultFuel: "",
    defaultTolls: "",
    defaultLoading: "",
    defaultUangBongkar: "",
    defaultPettyCash: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingDestId, setEditingDestId] = useState<string | null>(null);
  const [editingDestForm, setEditingDestForm] = useState<{
    name: string;
    defaultRate: string;
    defaultDeliveryCost: string;
    defaultFuel: string;
    defaultTolls: string;
    defaultLoading: string;
    defaultUangBongkar: string;
    defaultPettyCash: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [c, d, v, dest, prod, fromList] = await Promise.all([
        fetch("/api/master/customers").then((r) => r.json()),
        fetch("/api/master/drivers").then((r) => r.json()),
        fetch("/api/master/vehicles").then((r) => r.json()),
        fetch("/api/master/destinations").then((r) => r.json()),
        fetch("/api/master/products").then((r) => r.json()),
        fetch("/api/master/from").then((r) => r.json()),
      ]);
      setCustomers(Array.isArray(c) ? c : []);
      setDrivers(Array.isArray(d) ? d : []);
      setVehicles(Array.isArray(v) ? v : []);
      setDestinations(Array.isArray(dest) ? dest : []);
      setProducts(Array.isArray(prod) ? prod : []);
      setFromOrigins(Array.isArray(fromList) ? fromList : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addCustomer = async () => {
    if (!newName.trim()) return;
    await fetch("/api/master/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    load();
  };

  const addDriver = async () => {
    if (!newName.trim()) return;
    await fetch("/api/master/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    load();
  };

  const addVehicle = async () => {
    if (!newName.trim()) return;
    await fetch("/api/master/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    load();
  };

  const addDestination = async () => {
    if (!destForm.name.trim()) return;
    await fetch("/api/master/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: destForm.name.trim(),
        defaultRate: Number(destForm.defaultRate) || 0,
        defaultDeliveryCost: Number(destForm.defaultDeliveryCost) || 0,
        defaultFuel: Number(destForm.defaultFuel) || 0,
        defaultTolls: Number(destForm.defaultTolls) || 0,
        defaultLoading: Number(destForm.defaultLoading) || 0,
        defaultUangBongkar: Number(destForm.defaultUangBongkar) || 0,
        defaultPettyCash: Number(destForm.defaultPettyCash) || 0,
      }),
    });
    setDestForm({
      name: "",
      defaultRate: "",
      defaultDeliveryCost: "",
      defaultFuel: "",
      defaultTolls: "",
      defaultLoading: "",
      defaultUangBongkar: "",
      defaultPettyCash: "",
    });
    load();
  };

  const updateCustomer = async (id: string) => {
    await fetch(`/api/master/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue.trim() }),
    });
    setEditingId(null);
    load();
  };

  const updateDriver = async (id: string) => {
    await fetch(`/api/master/drivers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue.trim() }),
    });
    setEditingId(null);
    load();
  };

  const updateVehicle = async (id: string) => {
    await fetch(`/api/master/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue.trim() }),
    });
    setEditingId(null);
    load();
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    await fetch(`/api/master/customers/${id}`, { method: "DELETE" });
    load();
  };

  const deleteDriver = async (id: string) => {
    if (!confirm("Delete this driver?")) return;
    await fetch(`/api/master/drivers/${id}`, { method: "DELETE" });
    load();
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    await fetch(`/api/master/vehicles/${id}`, { method: "DELETE" });
    load();
  };

  const deleteDestination = async (id: string) => {
    if (!confirm("Delete this destination?")) return;
    await fetch(`/api/master/destinations/${id}`, { method: "DELETE" });
    setEditingDestId(null);
    setEditingDestForm(null);
    load();
  };

  const addProduct = async () => {
    if (!newName.trim()) return;
    await fetch("/api/master/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), kgPerBag: Number(productKgPerBag) || 25 }),
    });
    setNewName("");
    setProductKgPerBag("25");
    load();
  };

  const updateProduct = async (id: string) => {
    await fetch(`/api/master/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue.trim(), kgPerBag: Number(productKgPerBag) || 25 }),
    });
    setEditingId(null);
    load();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/master/products/${id}`, { method: "DELETE" });
    load();
  };

  const addFrom = async () => {
    if (!newName.trim()) return;
    await fetch("/api/master/from", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    load();
  };

  const updateFrom = async (id: string) => {
    await fetch(`/api/master/from/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue.trim() }),
    });
    setEditingId(null);
    load();
  };

  const deleteFrom = async (id: string) => {
    if (!confirm("Delete this From (asal)?")) return;
    await fetch(`/api/master/from/${id}`, { method: "DELETE" });
    load();
  };

  const startEditDestination = (d: Destination) => {
    setEditingDestId(d.id);
    setEditingDestForm({
      name: d.name,
      defaultRate: String(d.defaultRate),
      defaultDeliveryCost: String(d.defaultDeliveryCost ?? 0),
      defaultFuel: String(d.defaultFuel),
      defaultTolls: String(d.defaultTolls),
      defaultLoading: String(d.defaultLoading),
      defaultUangBongkar: String(d.defaultUangBongkar ?? 0),
      defaultPettyCash: String(d.defaultPettyCash),
    });
  };

  const cancelEditDestination = () => {
    setEditingDestId(null);
    setEditingDestForm(null);
  };

  const updateDestination = async (id: string) => {
    if (!editingDestForm) return;
    await fetch(`/api/master/destinations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingDestForm.name.trim(),
        defaultRate: Number(editingDestForm.defaultRate) || 0,
        defaultDeliveryCost: Number(editingDestForm.defaultDeliveryCost) || 0,
        defaultFuel: Number(editingDestForm.defaultFuel) || 0,
        defaultTolls: Number(editingDestForm.defaultTolls) || 0,
        defaultLoading: Number(editingDestForm.defaultLoading) || 0,
        defaultUangBongkar: Number(editingDestForm.defaultUangBongkar) || 0,
        defaultPettyCash: Number(editingDestForm.defaultPettyCash) || 0,
      }),
    });
    setEditingDestId(null);
    setEditingDestForm(null);
    load();
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-4">
      <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
        Master Data
      </h1>
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                tab === t.id
                  ? "bg-violet-100 text-violet-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {tab === "customers" && (
          <Card className="border-violet-200/60 bg-gradient-to-br from-white to-violet-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add Customer / Vendor</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomer()}
                className="max-w-xs"
              />
              <Button size="sm" onClick={addCustomer} className="gap-1 bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </CardContent>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {customers.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-md bg-white px-2 py-1.5 shadow-sm"
                  >
                    {editingId === c.id ? (
                      <>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-7 flex-1"
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={() => updateCustomer(c.id)}>Save</Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">{c.name}</span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(c.id); setEditValue(c.name); }}><Pencil className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500" onClick={() => deleteCustomer(c.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {tab === "drivers" && (
          <Card className="border-amber-200/60 bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add Driver</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDriver()}
                className="max-w-xs"
              />
              <Button size="sm" onClick={addDriver} className="gap-1 bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </CardContent>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {drivers.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between rounded-md bg-white px-2 py-1.5 shadow-sm"
                  >
                    {editingId === d.id ? (
                      <>
                        <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-7 flex-1" autoFocus />
                        <Button size="sm" variant="ghost" onClick={() => updateDriver(d.id)}>Save</Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">{d.name}</span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(d.id); setEditValue(d.name); }}><Pencil className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500" onClick={() => deleteDriver(d.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {tab === "vehicles" && (
          <Card className="border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="e.g. B 1234 XYZ"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addVehicle()}
                className="max-w-xs"
              />
              <Button size="sm" onClick={addVehicle} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </CardContent>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {vehicles.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-md bg-white px-2 py-1.5 shadow-sm"
                  >
                    {editingId === v.id ? (
                      <>
                        <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-7 flex-1" autoFocus />
                        <Button size="sm" variant="ghost" onClick={() => updateVehicle(v.id)}>Save</Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-mono">{v.name}</span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(v.id); setEditValue(v.name); }}><Pencil className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500" onClick={() => deleteVehicle(v.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {tab === "destinations" && (
          <Card className="border-sky-200/60 bg-gradient-to-br from-white to-sky-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add Destination (Rate & Cost used when selected in New Invoice)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Name (e.g. Jakarta – Surabaya)</Label>
                  <Input
                    placeholder="Destination name"
                    value={destForm.name}
                    onChange={(e) => setDestForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-48"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Default Rate (Rp)</Label>
                  <Input
                    placeholder="0"
                    value={formatWithCommas(destForm.defaultRate)}
                    onChange={(e) => setDestForm((f) => ({ ...f, defaultRate: e.target.value.replace(/\D/g, "") }))}
                    className="w-28 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Delivery cost (Rp)</Label>
                  <Input
                    placeholder="0"
                    value={formatWithCommas(destForm.defaultDeliveryCost)}
                    onChange={(e) => setDestForm((f) => ({ ...f, defaultDeliveryCost: e.target.value.replace(/\D/g, "") }))}
                    className="w-28 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fuel</Label>
                  <Input
                    placeholder="0"
                    value={formatWithCommas(destForm.defaultFuel)}
                    onChange={(e) => setDestForm((f) => ({ ...f, defaultFuel: e.target.value.replace(/\D/g, "") }))}
                    className="w-24 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tolls</Label>
                  <Input
                    placeholder="0"
                    value={formatWithCommas(destForm.defaultTolls)}
                    onChange={(e) => setDestForm((f) => ({ ...f, defaultTolls: e.target.value.replace(/\D/g, "") }))}
                    className="w-24 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Loading</Label>
                  <Input
                    placeholder="0"
                    value={formatWithCommas(destForm.defaultLoading)}
                    onChange={(e) => setDestForm((f) => ({ ...f, defaultLoading: e.target.value.replace(/\D/g, "") }))}
                    className="w-24 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Uang bongkar</Label>
                  <Input
                    placeholder="0"
                    value={formatWithCommas(destForm.defaultUangBongkar)}
                    onChange={(e) => setDestForm((f) => ({ ...f, defaultUangBongkar: e.target.value.replace(/\D/g, "") }))}
                    className="w-24 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Petty cash (default)</Label>
                  <Input
                    placeholder="0"
                    value={formatWithCommas(destForm.defaultPettyCash)}
                    onChange={(e) => setDestForm((f) => ({ ...f, defaultPettyCash: e.target.value.replace(/\D/g, "") }))}
                    className="w-24 font-mono"
                  />
                </div>
                <Button size="sm" onClick={addDestination} className="gap-1 bg-sky-600 hover:bg-sky-700">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {destinations.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-2 shadow-sm"
                  >
                    {editingDestId === d.id && editingDestForm ? (
                      <div className="flex w-full flex-wrap items-end gap-2 border-t border-sky-100 pt-2 mt-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={editingDestForm.name}
                            onChange={(e) => setEditingDestForm((f) => f ? { ...f, name: e.target.value } : f)}
                            className="h-8 w-44"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Rate</Label>
                          <Input value={formatWithCommas(editingDestForm.defaultRate)} onChange={(e) => setEditingDestForm((f) => f ? { ...f, defaultRate: e.target.value.replace(/\D/g, "") } : f)} className="h-8 w-24 font-mono" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Delivery cost</Label>
                          <Input value={formatWithCommas(editingDestForm.defaultDeliveryCost)} onChange={(e) => setEditingDestForm((f) => f ? { ...f, defaultDeliveryCost: e.target.value.replace(/\D/g, "") } : f)} className="h-8 w-24 font-mono" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Fuel</Label>
                          <Input value={formatWithCommas(editingDestForm.defaultFuel)} onChange={(e) => setEditingDestForm((f) => f ? { ...f, defaultFuel: e.target.value.replace(/\D/g, "") } : f)} className="h-8 w-20 font-mono" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tolls</Label>
                          <Input value={formatWithCommas(editingDestForm.defaultTolls)} onChange={(e) => setEditingDestForm((f) => f ? { ...f, defaultTolls: e.target.value.replace(/\D/g, "") } : f)} className="h-8 w-20 font-mono" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Loading</Label>
                          <Input value={formatWithCommas(editingDestForm.defaultLoading)} onChange={(e) => setEditingDestForm((f) => f ? { ...f, defaultLoading: e.target.value.replace(/\D/g, "") } : f)} className="h-8 w-20 font-mono" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Uang bongkar</Label>
                          <Input value={formatWithCommas(editingDestForm.defaultUangBongkar)} onChange={(e) => setEditingDestForm((f) => f ? { ...f, defaultUangBongkar: e.target.value.replace(/\D/g, "") } : f)} className="h-8 w-20 font-mono" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Petty cash</Label>
                          <Input value={formatWithCommas(editingDestForm.defaultPettyCash)} onChange={(e) => setEditingDestForm((f) => f ? { ...f, defaultPettyCash: e.target.value.replace(/\D/g, "") } : f)} className="h-8 w-20 font-mono" />
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" className="bg-sky-600 hover:bg-sky-700" onClick={() => updateDestination(d.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={cancelEditDestination}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-sky-800">{d.name}</span>
                        <span className="text-xs text-slate-500 font-mono">
                          Rate: {formatWithCommas(d.defaultRate)} · DC: {formatWithCommas(d.defaultDeliveryCost ?? 0)} · F: {formatWithCommas(d.defaultFuel)} T: {formatWithCommas(d.defaultTolls)} L: {formatWithCommas(d.defaultLoading)} UB: {formatWithCommas(d.defaultUangBongkar ?? 0)} P: {formatWithCommas(d.defaultPettyCash)}
                        </span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-sky-600" onClick={() => startEditDestination(d)} title="Edit">
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-rose-500" onClick={() => deleteDestination(d.id)} title="Delete">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {tab === "products" && (
          <Card className="border-violet-200/60 bg-gradient-to-br from-white to-violet-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add Product (kg per bag used for auto kg in New Invoice)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-2">
              <Input
                placeholder="Product name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addProduct()}
                className="max-w-xs"
              />
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Kg per bag</Label>
                <Input
                  type="number"
                  min={1}
                  value={productKgPerBag}
                  onChange={(e) => setProductKgPerBag(e.target.value)}
                  className="h-8 w-20 font-mono"
                />
              </div>
              <Button size="sm" onClick={addProduct} className="gap-1 bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </CardContent>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {products.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-md bg-white px-2 py-1.5 shadow-sm"
                  >
                    {editingId === p.id ? (
                      <>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-7 flex-1"
                          autoFocus
                        />
                        <Input
                          type="number"
                          value={productKgPerBag}
                          onChange={(e) => setProductKgPerBag(e.target.value)}
                          className="h-7 w-20 font-mono"
                        />
                        <Button size="sm" variant="ghost" onClick={() => updateProduct(p.id)}>Save</Button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 text-sm">{p.name}</span>
                        <span className="inline-block w-16 shrink-0 text-right text-xs text-slate-500 font-mono">{p.kgPerBag} kg/bag</span>
                        <div className="flex shrink-0 gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(p.id); setEditValue(p.name); setProductKgPerBag(String(p.kgPerBag)); }}><Pencil className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500" onClick={() => deleteProduct(p.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {tab === "from" && (
          <Card className="border-violet-200/60 bg-gradient-to-br from-white to-violet-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add From — selectable in New Invoice</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="e.g. Gudang A, PT XYZ"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFrom()}
                className="max-w-xs"
              />
              <Button size="sm" onClick={addFrom} className="gap-1 bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </CardContent>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {fromOrigins.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between rounded-md bg-white px-2 py-1.5 shadow-sm"
                  >
                    {editingId === o.id ? (
                      <>
                        <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-7 flex-1" autoFocus />
                        <Button size="sm" variant="ghost" onClick={() => updateFrom(o.id)}>Save</Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">{o.name}</span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(o.id); setEditValue(o.name); }}><Pencil className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500" onClick={() => deleteFrom(o.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {loading && (
        <p className="text-sm text-slate-500">Loading master data…</p>
      )}
    </div>
  );
}
