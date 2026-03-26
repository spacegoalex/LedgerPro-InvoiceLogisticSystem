"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HistoryRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/invoices");
  }, [router]);
  return (
    <div className="flex h-full items-center justify-center p-6">
      <p className="text-sm text-slate-500">Redirecting to Invoices…</p>
    </div>
  );
}
