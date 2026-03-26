"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: Brand panel */}
      <div className="hidden flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">LedgerPro</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">
            B2B invoice & logistics ledger
          </h2>
          <p className="mt-2 max-w-sm text-slate-400">
            Secure, multi-tenant invoicing and analytics for your business.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} LedgerPro. All rights reserved.
        </p>
      </div>

      {/* Right: Login form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              LedgerPro
            </span>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900">
                Sign in
              </CardTitle>
              <CardDescription className="text-slate-600">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="h-10 border-slate-200 focus-visible:ring-indigo-600"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-10 border-slate-200 focus-visible:ring-indigo-600"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="xl"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>
                {error && (
                  <p className="text-center text-sm text-rose-600">{error}</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
