import { describe, it, expect } from "vitest";
import { calculateTotal } from "@/lib/math";

describe("calculateTotal", () => {
  it("sums an array of numbers correctly", () => {
    expect(calculateTotal([1, 2, 3])).toBe(6);
  });

  it("returns 0 for an empty array", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("handles negative numbers", () => {
    expect(calculateTotal([5, -2, 3])).toBe(6);
  });
});