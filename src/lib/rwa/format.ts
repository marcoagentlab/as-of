import type { AssetClass, Freshness, Quality } from "./schema.ts";

export function dash(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return String(value);
}

export function formatApy(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${(value * 100).toFixed(2)}%`;
}

export function formatBps(value: number | null | undefined): string {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value} bps`;
}

export function formatUsd(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function classLabel(value: AssetClass): string {
  const map: Record<AssetClass, string> = {
    treasury_fund: "Treasury fund",
    private_credit: "Private credit",
    commodity: "Commodity",
    equity_wrapper: "Equity wrapper",
    cash_mgmt: "Cash management",
    other: "Other",
  };
  return map[value] ?? value;
}

export function wrapperLabel(value: string): string {
  const map: Record<string, string> = {
    reg_d: "Reg D",
    forty_act_mmf: "40 Act MMF",
    ucits_mmf: "UCITS MMF",
    open_ended_fund: "Open-ended fund",
    tokenized_note: "Tokenized note",
    unknown: "Unknown wrapper",
  };
  return map[value] ?? value;
}

export function qualityLabel(value: Quality): string {
  return value;
}

export function freshnessLabel(value: Freshness): string {
  return value;
}

export function gateLabel(value: string): string {
  const map: Record<string, string> = {
    none: "None",
    us_qp: "US QP",
    non_us: "Non-US",
    kyc: "KYC",
    allowlist: "Allowlist",
    jurisdiction_block: "Jurisdiction block",
    unknown: "Unknown",
  };
  return map[value] ?? value;
}
