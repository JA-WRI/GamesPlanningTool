export function calculateTotal(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}
