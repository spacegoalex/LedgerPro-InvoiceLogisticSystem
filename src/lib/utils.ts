import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format number with comma as thousand separator for easier reading (e.g. 1,000,000). */
export function formatWithCommas(value: string | number): string {
  const str = typeof value === "number" ? String(value) : value;
  const digits = str.replace(/\D/g, "");
  if (digits === "") return "";
  const n = parseInt(digits, 10);
  if (isNaN(n)) return "";
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
