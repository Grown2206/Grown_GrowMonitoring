import { CostEntry, CostCategory } from '../models/CostEntry';
import { Plant, Harvest } from '../models';
import { Op } from 'sequelize';

/**
 * Cost Tracking Service
 * Analyzes expenses and calculates ROI for grow operations
 */

export interface CostSummary {
  totalCosts: number;
  currency: string;
  byCategory: Record<CostCategory, number>;
  periodStart: Date;
  periodEnd: Date;
  entryCount: number;
}

export interface PlantCostAnalysis {
  plantId: number;
  plantName: string;
  totalCosts: number;
  costPerDay: number;
  growDays: number;
  byCategory: Record<CostCategory, number>;
  projectedFinalCost?: number;
  estimatedCompletionDays?: number;
}

export interface ROIAnalysis {
  plantId: number;
  plantName: string;
  totalCosts: number;
  harvestValue: number;
  harvestWeight: number;
  roi: number; // Percentage
  profit: number;
  costPerGram: number;
  valuePerGram: number;
  breakEven: boolean;
}

export interface BudgetAnalysis {
  period: string;
  budgetLimit?: number;
  totalSpent: number;
  percentageUsed?: number;
  remainingBudget?: number;
  averageDaily: number;
  projectedMonthly: number;
  topExpenses: Array<{
    category: CostCategory;
    amount: number;
    percentage: number;
  }>;
}

export class CostTrackingService {
  /**
   * Get cost summary for a period
   */
  static async getCostSummary(
    startDate: Date,
    endDate: Date,
    plantId?: number
  ): Promise<CostSummary> {
    const where: any = {
      date: {
        [Op.between]: [startDate, endDate],
      },
    };

    if (plantId) {
      where.plantId = plantId;
    }

    const entries = await CostEntry.findAll({ where });

    const byCategory: Record<CostCategory, number> = {
      seeds: 0,
      nutrients: 0,
      electricity: 0,
      water: 0,
      equipment: 0,
      soil: 0,
      containers: 0,
      maintenance: 0,
      other: 0,
    };

    let totalCosts = 0;
    let currency = 'EUR';

    entries.forEach((entry) => {
      const amount = parseFloat(entry.amount.toString());
      totalCosts += amount;
      byCategory[entry.category] += amount;
      currency = entry.currency;
    });

    return {
      totalCosts: Math.round(totalCosts * 100) / 100,
      currency,
      byCategory,
      periodStart: startDate,
      periodEnd: endDate,
      entryCount: entries.length,
    };
  }

  /**
   * Analyze costs for a specific plant
   */
  static async analyzePlantCosts(plantId: number): Promise<PlantCostAnalysis | null> {
    const plant = await Plant.findByPk(plantId);
    if (!plant) return null;

    const entries = await CostEntry.findAll({
      where: { plantId },
      order: [['date', 'ASC']],
    });

    if (entries.length === 0) {
      return {
        plantId,
        plantName: plant.name,
        totalCosts: 0,
        costPerDay: 0,
        growDays: 0,
        byCategory: {
          seeds: 0,
          nutrients: 0,
          electricity: 0,
          water: 0,
          equipment: 0,
          soil: 0,
          containers: 0,
          maintenance: 0,
          other: 0,
        },
      };
    }

    const byCategory: Record<CostCategory, number> = {
      seeds: 0,
      nutrients: 0,
      electricity: 0,
      water: 0,
      equipment: 0,
      soil: 0,
      containers: 0,
      maintenance: 0,
      other: 0,
    };

    let totalCosts = 0;

    entries.forEach((entry) => {
      const amount = parseFloat(entry.amount.toString());
      totalCosts += amount;
      byCategory[entry.category] += amount;
    });

    // Calculate grow days
    const plantedDate = plant.plantedDate ? new Date(plant.plantedDate) : new Date();
    const now = new Date();
    const growDays = Math.floor(
      (now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const costPerDay = growDays > 0 ? totalCosts / growDays : 0;

    // Project final cost if plant is still active
    let projectedFinalCost: number | undefined;
    let estimatedCompletionDays: number | undefined;

    if (plant.isActive) {
      // Assume typical grow cycle is 90-120 days
      const estimatedTotalDays = 100;
      estimatedCompletionDays = Math.max(0, estimatedTotalDays - growDays);
      projectedFinalCost = totalCosts + costPerDay * estimatedCompletionDays;
    }

    return {
      plantId,
      plantName: plant.name,
      totalCosts: Math.round(totalCosts * 100) / 100,
      costPerDay: Math.round(costPerDay * 100) / 100,
      growDays,
      byCategory,
      projectedFinalCost: projectedFinalCost
        ? Math.round(projectedFinalCost * 100) / 100
        : undefined,
      estimatedCompletionDays,
    };
  }

  /**
   * Calculate ROI for a harvested plant
   */
  static async calculateROI(
    plantId: number,
    marketPricePerGram: number
  ): Promise<ROIAnalysis | null> {
    const plant = await Plant.findByPk(plantId);
    if (!plant) return null;

    // Get harvest data
    const harvest = await Harvest.findOne({
      where: { plantId },
      order: [['harvestDate', 'DESC']],
    });

    if (!harvest) {
      return null; // No harvest data yet
    }

    const harvestWeight = parseFloat(harvest.wetWeight?.toString() || '0');

    if (harvestWeight === 0) {
      return null;
    }

    // Get total costs
    const costAnalysis = await this.analyzePlantCosts(plantId);
    if (!costAnalysis) return null;

    const totalCosts = costAnalysis.totalCosts;
    const harvestValue = harvestWeight * marketPricePerGram;
    const profit = harvestValue - totalCosts;
    const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
    const costPerGram = harvestWeight > 0 ? totalCosts / harvestWeight : 0;

    return {
      plantId,
      plantName: plant.name,
      totalCosts: Math.round(totalCosts * 100) / 100,
      harvestValue: Math.round(harvestValue * 100) / 100,
      harvestWeight,
      roi: Math.round(roi * 10) / 10,
      profit: Math.round(profit * 100) / 100,
      costPerGram: Math.round(costPerGram * 100) / 100,
      valuePerGram: marketPricePerGram,
      breakEven: profit >= 0,
    };
  }

  /**
   * Analyze budget for a period
   */
  static async analyzeBudget(
    startDate: Date,
    endDate: Date,
    budgetLimit?: number
  ): Promise<BudgetAnalysis> {
    const summary = await this.getCostSummary(startDate, endDate);

    // Calculate daily average
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const averageDaily = days > 0 ? summary.totalCosts / days : 0;

    // Project monthly
    const projectedMonthly = averageDaily * 30;

    // Get top expenses
    const categoryEntries = Object.entries(summary.byCategory)
      .filter(([_, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);

    const topExpenses = categoryEntries.slice(0, 5).map(([category, amount]) => ({
      category: category as CostCategory,
      amount: Math.round(amount * 100) / 100,
      percentage: Math.round((amount / summary.totalCosts) * 100 * 10) / 10,
    }));

    const result: BudgetAnalysis = {
      period: `${startDate.toISOString().split('T')[0]} - ${
        endDate.toISOString().split('T')[0]
      }`,
      totalSpent: summary.totalCosts,
      averageDaily: Math.round(averageDaily * 100) / 100,
      projectedMonthly: Math.round(projectedMonthly * 100) / 100,
      topExpenses,
    };

    if (budgetLimit !== undefined) {
      result.budgetLimit = budgetLimit;
      result.percentageUsed = Math.round((summary.totalCosts / budgetLimit) * 100 * 10) / 10;
      result.remainingBudget = Math.round((budgetLimit - summary.totalCosts) * 100) / 100;
    }

    return result;
  }

  /**
   * Get cost trends over time
   */
  static async getCostTrends(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'month'
  ): Promise<
    Array<{
      period: string;
      totalCosts: number;
      byCategory: Record<CostCategory, number>;
    }>
  > {
    const entries = await CostEntry.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [['date', 'ASC']],
    });

    const trends: Map<
      string,
      {
        period: string;
        totalCosts: number;
        byCategory: Record<CostCategory, number>;
      }
    > = new Map();

    entries.forEach((entry) => {
      const date = new Date(entry.date);
      let periodKey: string;

      switch (groupBy) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!trends.has(periodKey)) {
        trends.set(periodKey, {
          period: periodKey,
          totalCosts: 0,
          byCategory: {
            seeds: 0,
            nutrients: 0,
            electricity: 0,
            water: 0,
            equipment: 0,
            soil: 0,
            containers: 0,
            maintenance: 0,
            other: 0,
          },
        });
      }

      const trend = trends.get(periodKey)!;
      const amount = parseFloat(entry.amount.toString());
      trend.totalCosts += amount;
      trend.byCategory[entry.category] += amount;
    });

    return Array.from(trends.values()).map((trend) => ({
      ...trend,
      totalCosts: Math.round(trend.totalCosts * 100) / 100,
    }));
  }

  /**
   * Process recurring costs
   */
  static async processRecurringCosts(): Promise<number> {
    const recurringEntries = await CostEntry.findAll({
      where: {
        isRecurring: true,
      },
    });

    let processedCount = 0;

    for (const entry of recurringEntries) {
      const lastDate = new Date(entry.date);
      const now = new Date();

      let shouldCreate = false;
      let newDate = new Date(lastDate);

      switch (entry.recurringInterval) {
        case 'daily':
          newDate.setDate(newDate.getDate() + 1);
          shouldCreate = newDate <= now;
          break;
        case 'weekly':
          newDate.setDate(newDate.getDate() + 7);
          shouldCreate = newDate <= now;
          break;
        case 'monthly':
          newDate.setMonth(newDate.getMonth() + 1);
          shouldCreate = newDate <= now;
          break;
        case 'yearly':
          newDate.setFullYear(newDate.getFullYear() + 1);
          shouldCreate = newDate <= now;
          break;
      }

      if (shouldCreate) {
        await CostEntry.create({
          plantId: entry.plantId,
          growCycleId: entry.growCycleId,
          category: entry.category,
          description: `${entry.description} (Auto-generated)`,
          amount: entry.amount,
          currency: entry.currency,
          quantity: entry.quantity,
          unit: entry.unit,
          date: newDate,
          vendor: entry.vendor,
          notes: `Automatically created from recurring entry #${entry.id}`,
          isRecurring: false,
        });

        // Update original entry's date
        await entry.update({ date: newDate });

        processedCount++;
      }
    }

    return processedCount;
  }
}
