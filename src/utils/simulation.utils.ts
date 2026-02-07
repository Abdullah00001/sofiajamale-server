import { injectable } from 'tsyringe';

@injectable()
export class Simulation {
  simulateRealisticAIAnalysis(basePrice?: number) {
    // More realistic trend distribution (market tends to be stable or slightly up)
    const trendWeights = [
      { trend: 'up' as const, weight: 0.45 },
      { trend: 'down' as const, weight: 0.35 },
      { trend: 'stable' as const, weight: 0.2 },
    ];

    const random = Math.random();
    let cumulative = 0;
    let selectedTrend: 'up' | 'down' | 'stable' = 'stable';

    for (const { trend, weight } of trendWeights) {
      cumulative += weight;
      if (random <= cumulative) {
        selectedTrend = trend;
        break;
      }
    }

    // More realistic change percentages
    let changePercentage: number;
    if (selectedTrend === 'up') {
      // Most gains are modest (0-15%), rare spikes (15-30%)
      const isLargeGain = Math.random() < 0.1;
      changePercentage = parseFloat(
        (isLargeGain
          ? Math.random() * 15 + 15 // 15-30%
          : Math.random() * 15
        ).toFixed(1)
      );
    } else if (selectedTrend === 'down') {
      // Most losses are modest (0-12%), rare crashes (12-25%)
      const isLargeLoss = Math.random() < 0.15;
      changePercentage = parseFloat(
        (isLargeLoss
          ? -(Math.random() * 13 + 12) // -12 to -25%
          : -(Math.random() * 12)
        ).toFixed(1)
      );
    } else {
      // Neutral: very small changes
      changePercentage = parseFloat((Math.random() * 2 - 1).toFixed(1)); // -1 to 1%
    }

    // Calculate current value
    const calculatedBasePrice =
      basePrice || Math.random() * (80000 - 3000) + 3000;
    const currentValue = parseFloat(
      (calculatedBasePrice * (1 + changePercentage / 100)).toFixed(2)
    );

    // Production year with vintage premium consideration
    const currentYear = new Date().getFullYear();
    const vintageChance = Math.random();
    let randomYear: number;

    if (vintageChance < 0.1) {
      // 10% chance: vintage (20-30 years old)
      randomYear = currentYear - Math.floor(Math.random() * 10 + 20);
    } else if (vintageChance < 0.3) {
      // 20% chance: older (10-20 years)
      randomYear = currentYear - Math.floor(Math.random() * 10 + 10);
    } else {
      // 70% chance: recent (1-10 years)
      randomYear = currentYear - Math.floor(Math.random() * 10 + 1);
    }

    const randomMonth = Math.floor(Math.random() * 12);
    const productionYear = new Date(randomYear, randomMonth, 1);

    return {
      trend: selectedTrend,
      changePercentage,
      currentValue,
      productionYear,
    };
  }
}
