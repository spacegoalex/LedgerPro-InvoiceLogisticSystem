import Link from "next/link";
import { FilePlus, FileText, BarChart3, Database, Receipt, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
        Dashboard
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <Link
          href="/app/invoice"
          className="group flex items-center gap-4 rounded-xl border border-violet-200/60 bg-gradient-to-br from-white to-violet-50/50 p-5 shadow-sm transition-all hover:shadow-md hover:border-violet-300"
        >
          <div className="rounded-lg bg-violet-100 p-3 group-hover:bg-violet-200/80">
            <FilePlus className="h-8 w-8 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">New Invoice</p>
            <p className="text-xs text-slate-500">Create a new trip invoice</p>
          </div>
        </Link>
        <Link
          href="/app/invoices"
          className="group flex items-center gap-4 rounded-xl border border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/50 p-5 shadow-sm transition-all hover:shadow-md hover:border-emerald-300"
        >
          <div className="rounded-lg bg-emerald-100 p-3 group-hover:bg-emerald-200/80">
            <FileText className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Invoices</p>
            <p className="text-xs text-slate-500">View all invoices & export</p>
          </div>
        </Link>
        <Link
          href="/app/print"
          className="group flex items-center gap-4 rounded-xl border border-indigo-200/60 bg-gradient-to-br from-white to-indigo-50/50 p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-300"
        >
          <div className="rounded-lg bg-indigo-100 p-3 group-hover:bg-indigo-200/80">
            <Receipt className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Invoice & Kwitansi</p>
            <p className="text-xs text-slate-500">Search & download PDF</p>
          </div>
        </Link>
        <Link
          href="/app/analytics"
          className="group flex items-center gap-4 rounded-xl border border-amber-200/60 bg-gradient-to-br from-white to-amber-50/50 p-5 shadow-sm transition-all hover:shadow-md hover:border-amber-300"
        >
          <div className="rounded-lg bg-amber-100 p-3 group-hover:bg-amber-200/80">
            <BarChart3 className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Analytics</p>
            <p className="text-xs text-slate-500">Revenue & cost by month</p>
          </div>
        </Link>
        <Link
          href="/app/master"
          className="group flex items-center gap-4 rounded-xl border border-sky-200/60 bg-gradient-to-br from-white to-sky-50/50 p-5 shadow-sm transition-all hover:shadow-md hover:border-sky-300"
        >
          <div className="rounded-lg bg-sky-100 p-3 group-hover:bg-sky-200/80">
            <Database className="h-8 w-8 text-sky-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Master Data</p>
            <p className="text-xs text-slate-500">Customers, drivers, vehicles, destinations</p>
          </div>
        </Link>
        <Link
          href="/app/settings"
          className="group flex items-center gap-4 rounded-xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
        >
          <div className="rounded-lg bg-slate-100 p-3 group-hover:bg-slate-200/80">
            <Settings className="h-8 w-8 text-slate-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Settings</p>
            <p className="text-xs text-slate-500">Preferences & defaults</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
