import assert from "node:assert/strict";
import test from "node:test";
import { allocateQuotas } from "../../src/lib/learning/blueprint";

const roomy = (weights: number[]) => weights.map((weight) => ({ weight, capacity: 1000 }));

test("SAA-C03 blueprint apportions a 65-question exam by largest remainder", () => {
  assert.deepEqual(allocateQuotas(roomy([0.3, 0.26, 0.24, 0.2]), 65), [19, 17, 16, 13]);
});

test("CLF-C02 blueprint apportions a 65-question exam by largest remainder", () => {
  assert.deepEqual(allocateQuotas(roomy([0.24, 0.3, 0.34, 0.12]), 65), [16, 19, 22, 8]);
});

test("capped domains hand their unfilled seats to the others", () => {
  const quotas = allocateQuotas(
    [
      { weight: 0.3, capacity: 5 },
      { weight: 0.26, capacity: 50 },
      { weight: 0.24, capacity: 50 },
      { weight: 0.2, capacity: 50 },
    ],
    65,
  );
  assert.equal(quotas[0], 5);
  assert.equal(quotas.reduce((a, b) => a + b, 0), 65);
});

test("never allocates more than the combined capacity", () => {
  assert.deepEqual(allocateQuotas([{ weight: 0.5, capacity: 2 }, { weight: 0.5, capacity: 3 }], 65), [2, 3]);
});

test("missing weights are rejected instead of producing an empty exam", () => {
  assert.throws(() => allocateQuotas([{ weight: 0, capacity: 10 }], 5), /weights/);
});
