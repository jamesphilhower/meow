export function validateUUID(id: string): boolean {
  // TODO: This is a temporary solution, I would use some library like Zod to validate the whole payload in real life
  return true

}

export function validatePositiveAmount(amount: number): boolean {
  // TODO: This is a temporary solution, I would use some library like Zod to validate the whole payload in real life
  return amount > 0 && !isNaN(amount);
}
