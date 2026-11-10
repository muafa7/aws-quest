export type DomainCapacity = {
  weight: number;
  capacity: number;
};

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0);
}

// Largest-remainder apportionment of `count` items across weighted domains.
// A domain never receives more than its capacity; seats it cannot fill go to the
// domains with the largest remaining shortfall. Ties prefer the heavier domain,
// then the earlier domain, so the result is deterministic.
export function allocateQuotas(domains: readonly DomainCapacity[], count: number): number[] {
  if (!Number.isSafeInteger(count) || count < 0) throw new Error("Quota count must be a non-negative integer.");

  const weights = domains.map((domain) => Math.max(0, domain.weight));
  const capacities = domains.map((domain) => Math.max(0, Math.floor(domain.capacity)));
  const totalWeight = sum(weights);
  if (totalWeight <= 0) throw new Error("Domain weights must be configured before allocating quotas.");

  const target = Math.min(count, sum(capacities));
  // Rounding to 1e-9 keeps float noise such as 12.999999999999998 from losing a whole seat.
  const ideal = weights.map((weight) => Math.round(((target * weight) / totalWeight) * 1e9) / 1e9);
  const quotas = ideal.map((share, index) => Math.min(Math.floor(share), capacities[index]));

  for (let remaining = target - sum(quotas); remaining > 0; remaining--) {
    let best = -1;
    for (let index = 0; index < domains.length; index++) {
      if (quotas[index] >= capacities[index]) continue;
      if (best === -1) {
        best = index;
        continue;
      }
      const shortfall = ideal[index] - quotas[index];
      const bestShortfall = ideal[best] - quotas[best];
      if (shortfall > bestShortfall || (shortfall === bestShortfall && weights[index] > weights[best])) best = index;
    }
    quotas[best]++;
  }

  return quotas;
}
