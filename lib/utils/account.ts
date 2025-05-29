export function generateAccountNumber(): string {
  const segment = () => Math.floor(1000 + Math.random() * 9000).toString();
  return `BANK-${segment()}-${segment()}-${segment()}`;
}
