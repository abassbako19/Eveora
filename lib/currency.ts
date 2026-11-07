export const EVEORA_CURRENCIES = [
  "NGN",
  "USD",
  "GBP",
  "EUR",
  "GHS",
  "KES",
  "CAD",
  "AUD",
] as const;

export type EveoraCurrency = (typeof EVEORA_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<EveoraCurrency, string> = {
  NGN: "Nigerian naira (NGN)",
  USD: "US dollar (USD)",
  GBP: "British pound (GBP)",
  EUR: "Euro (EUR)",
  GHS: "Ghanaian cedi (GHS)",
  KES: "Kenyan shilling (KES)",
  CAD: "Canadian dollar (CAD)",
  AUD: "Australian dollar (AUD)",
};

export function isEveoraCurrency(
  value: unknown
): value is EveoraCurrency {
  return (
    typeof value === "string" &&
    (EVEORA_CURRENCIES as readonly string[]).includes(value)
  );
}

export function formatCurrency(
  amountMajor: number,
  currency: EveoraCurrency
): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountMajor);
}

export function toMinorUnits(amountMajor: number): number {
  return Math.round((amountMajor + Number.EPSILON) * 100);
}
