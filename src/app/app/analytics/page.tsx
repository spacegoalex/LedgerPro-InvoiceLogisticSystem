"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

type MonthData = {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const chartData = data.map((d) => ({
    ...d,
    monthLabel: d.month,
  }));

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
        Analytics — Revenue & Cost by Month
      </h1>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          <Card className="border-violet-200/60 bg-gradient-to-br from-white to-violet-50/30 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-800">
                Monthly trend (line)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="cost" name="Cost" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="profit" name="Profit" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/30 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-800">
                Revenue vs cost (area)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#059669" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cost" name="Cost" stroke="#d97706" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-800">
                Table by month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2 text-left font-medium text-slate-700">Month</th>
                      <th className="px-3 py-2 text-right font-mono font-medium text-emerald-700">Revenue</th>
                      <th className="px-3 py-2 text-right font-mono font-medium text-amber-700">Cost</th>
                      <th className="px-3 py-2 text-right font-mono font-medium text-violet-700">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr
                        key={row.month}
                        className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-violet-50/30" : ""}`}
                      >
                        <td className="px-3 py-2 font-medium">{row.month}</td>
                        <td className="px-3 py-2 text-right font-mono text-emerald-700" data-financial>
                          {formatCurrency(row.revenue)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-amber-700" data-financial>
                          {formatCurrency(row.cost)}
                        </td>
                        <td className={`px-3 py-2 text-right font-mono font-medium ${row.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`} data-financial>
                          {formatCurrency(row.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
