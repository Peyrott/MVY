const PLATFORM_FEE = 0.20;

/**
 * Calculate pricing breakdown
 * @param {number} price
 * @returns {{total: number, platformFee: number, ownerReceives: number}}
 */
export function calculatePricing(price) {
  const platformFee = price * PLATFORM_FEE;
  const ownerReceives = price - platformFee;

  return {
    total: price,
    platformFee: Number(platformFee.toFixed(2)),
    ownerReceives: Number(ownerReceives.toFixed(2))
  };
}
