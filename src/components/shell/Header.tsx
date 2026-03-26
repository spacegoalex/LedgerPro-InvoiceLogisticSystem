"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Circle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUsername(data?.username ?? null))
      .catch(() => setUsername(null));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-white to-slate-50/80 px-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
        <span>System Status: Online</span>
      </div>
      <div className="flex items-center gap-3">
        {username && (
          <span className="text-sm font-medium text-slate-700">{username}</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-slate-600 hover:text-slate-900"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </header>
  );
}
