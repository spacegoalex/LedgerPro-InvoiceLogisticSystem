"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Settings,
  Database,
  BarChart3,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/invoice", label: "New Invoice", icon: FilePlus },
  { href: "/app/invoices", label: "Invoices", icon: FileText },
  { href: "/app/print", label: "Create Tagihan PUNDI", icon: Receipt },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/master", label: "Master", icon: Database },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app" || pathname === "/app/";
    // Exact match for /app/invoice so it doesn't also match /app/invoices
    if (href === "/app/invoice") return pathname === "/app/invoice" || pathname === "/app/invoice/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full w-52 flex-col border-r border-indigo-900/40 bg-gradient-to-b from-slate-800 to-indigo-900/30 text-slate-100 shadow-xl">
      <div className="border-b border-white/10 px-3 py-3">
        <span className="text-sm font-bold bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent">LedgerPro</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-all",
              isActive(href)
                ? "bg-violet-500/90 text-white shadow-md"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
