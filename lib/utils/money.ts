export function formatMoney(cents: bigint, currency: string = 'USD'): string {
  const amount = Number(cents) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function toCents(amount: number): bigint {
  // TODO: should validate input amount - could be negative, NaN, etc
  // A Money value object with Zod validation would be safer
  return BigInt(Math.round(amount * 100));
}

export function fromCents(cents: bigint): number {
  return Number(cents) / 100;
}
