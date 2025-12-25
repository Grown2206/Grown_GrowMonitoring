import { GrowRecipe, PhaseSettings } from '../models/GrowRecipe';
import { Plant } from '../models';
import { AutomationRule } from '../models/AutomationRule';

/**
 * Grow Recipe Service
 * Manages recipe application and provides pre-built recipes
 */

export interface RecipeApplication {
  recipeId: number;
  recipeName: string;
  plantId: number;
  plantName: string;
  appliedPhases: PhaseSettings[];
  appliedAutomationRules: number[]; // Rule IDs
  appliedAt: Date;
  estimatedCompletion: Date;
  success: boolean;
  errors?: string[];
}

export class GrowRecipeService {
  /**
   * Apply a recipe to a plant
   */
  static async applyRecipeToPlant(
    recipeId: number,
    plantId: number,
    options: {
      startPhase?: number; // Start at specific phase (0-indexed)
      overrideExisting?: boolean; // Override existing automation rules
    } = {}
  ): Promise<RecipeApplication> {
    const { startPhase = 0, overrideExisting = false } = options;

    const recipe = await GrowRecipe.findByPk(recipeId);
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    const plant = await Plant.findByPk(plantId);
    if (!plant) {
      throw new Error('Plant not found');
    }

    const phases: PhaseSettings[] = JSON.parse(recipe.phases);
    const appliedAutomationRules: number[] = [];
    const errors: string[] = [];

    // Apply phases starting from specified phase
    const phasesToApply = phases.slice(startPhase);

    // Update plant metadata with recipe info
    // Note: This would typically update a PlantRecipe junction table
    // For now, we'll just track in plant notes or create automation rules

    // Apply automation rules if specified
    if (recipe.automationRules) {
      const ruleIds: number[] = JSON.parse(recipe.automationRules);

      for (const ruleId of ruleIds) {
        try {
          const rule = await AutomationRule.findByPk(ruleId);
          if (rule) {
            // Clone rule for this specific plant
            const newRule = await AutomationRule.create({
              name: `${recipe.name} - ${rule.name} (Plant ${plant.id})`,
              description: `Auto-applied from recipe: ${recipe.name}`,
              triggerType: rule.triggerType,
              triggerConfig: rule.triggerConfig,
              actionType: rule.actionType,
              actionConfig: rule.actionConfig,
              conditions: rule.conditions,
              enabled: true,
            });

            appliedAutomationRules.push(newRule.id);
          }
        } catch (error) {
          errors.push(
            `Failed to apply automation rule ${ruleId}: ${(error as Error).message}`
          );
        }
      }
    }

    // Calculate estimated completion date
    const totalDays =
      phasesToApply.reduce((sum, phase) => sum + phase.durationDays, 0) || 90;
    const estimatedCompletion = new Date();
    estimatedCompletion.setDate(estimatedCompletion.getDate() + totalDays);

    // Increment usage count
    await recipe.update({ usageCount: recipe.usageCount + 1 });

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      plantId: plant.id,
      plantName: plant.name,
      appliedPhases: phasesToApply,
      appliedAutomationRules,
      appliedAt: new Date(),
      estimatedCompletion,
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Get recommended recipe for a strain type
   */
  static async getRecommendedRecipe(
    strainType: 'indica' | 'sativa' | 'hybrid' | 'auto' | 'cbd',
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner'
  ): Promise<GrowRecipe | null> {
    const recipe = await GrowRecipe.findOne({
      where: {
        strainType,
        difficulty,
        isPublic: true,
      },
      order: [
        ['rating', 'DESC'],
        ['usageCount', 'DESC'],
      ],
    });

    return recipe;
  }

  /**
   * Create default recipes for system
   */
  static async createDefaultRecipes(): Promise<GrowRecipe[]> {
    const defaultRecipes = [
      {
        name: 'Beginner Indica Recipe',
        strainType: 'indica' as const,
        difficulty: 'beginner' as const,
        description:
          'Simple, forgiving recipe for indica strains. Ideal for first-time growers.',
        author: 'System',
        isPublic: true,
        estimatedYield: '300-400g/m²',
        estimatedDuration: 90,
        phases: JSON.stringify([
          {
            name: 'Seedling',
            durationDays: 14,
            environmental: {
              temperature: { min: 20, max: 25, ideal: 22 },
              humidity: { min: 60, max: 70, ideal: 65 },
              vpd: { min: 0.4, max: 0.8, ideal: 0.6 },
            },
            lighting: {
              onTime: '06:00',
              offTime: '00:00',
              intensity: 40,
              spectrum: 'full',
            },
            watering: {
              frequency: 'every_2_days' as const,
              amount: 100,
              method: 'hand',
            },
            notes: 'Keep soil moist but not wet. Gentle light.',
          },
          {
            name: 'Vegetative',
            durationDays: 35,
            environmental: {
              temperature: { min: 22, max: 28, ideal: 24 },
              humidity: { min: 50, max: 70, ideal: 60 },
              vpd: { min: 0.8, max: 1.2, ideal: 1.0 },
            },
            lighting: {
              onTime: '06:00',
              offTime: '00:00',
              intensity: 70,
              spectrum: 'veg',
            },
            watering: {
              frequency: 'every_2_days' as const,
              amount: 500,
              method: 'drip',
            },
            nutrients: {
              npk: '10-5-5',
              ec: 1.2,
              ph: { min: 5.8, max: 6.5 },
              schedule: 'every watering',
            },
            notes: 'Increase nutrients gradually. Monitor for deficiencies.',
          },
          {
            name: 'Flowering',
            durationDays: 56,
            environmental: {
              temperature: { min: 20, max: 26, ideal: 23 },
              humidity: { min: 40, max: 55, ideal: 45 },
              vpd: { min: 1.0, max: 1.5, ideal: 1.2 },
            },
            lighting: {
              onTime: '06:00',
              offTime: '18:00',
              intensity: 100,
              spectrum: 'bloom',
            },
            watering: {
              frequency: 'daily' as const,
              amount: 1000,
              method: 'drip',
            },
            nutrients: {
              npk: '5-10-10',
              ec: 1.6,
              ph: { min: 5.8, max: 6.2 },
              schedule: 'every watering',
            },
            notes:
              'Switch to flowering nutrients. Monitor trichomes for harvest timing.',
          },
        ] as PhaseSettings[]),
        tags: JSON.stringify(['indica', 'beginner', 'indoor', '18-6', '12-12']),
        version: 1,
      },
      {
        name: 'Auto-Flower Fast Track',
        strainType: 'auto' as const,
        difficulty: 'beginner' as const,
        description: 'Quick and easy recipe for auto-flowering strains. No photoperiod needed.',
        author: 'System',
        isPublic: true,
        estimatedYield: '50-100g/plant',
        estimatedDuration: 70,
        phases: JSON.stringify([
          {
            name: 'Seedling',
            durationDays: 10,
            environmental: {
              temperature: { min: 20, max: 25, ideal: 22 },
              humidity: { min: 60, max: 70, ideal: 65 },
              vpd: { min: 0.4, max: 0.8, ideal: 0.6 },
            },
            lighting: {
              onTime: '00:00',
              offTime: '00:00',
              intensity: 40,
              spectrum: 'full',
            },
            watering: {
              frequency: 'every_2_days' as const,
              amount: 100,
              method: 'hand',
            },
            notes: '18-24 hours of light. Auto-flowers do not need darkness.',
          },
          {
            name: 'Vegetative & Early Flower',
            durationDays: 30,
            environmental: {
              temperature: { min: 22, max: 28, ideal: 24 },
              humidity: { min: 50, max: 65, ideal: 58 },
              vpd: { min: 0.8, max: 1.2, ideal: 1.0 },
            },
            lighting: {
              onTime: '00:00',
              offTime: '06:00',
              intensity: 80,
              spectrum: 'full',
            },
            watering: {
              frequency: 'every_2_days' as const,
              amount: 400,
              method: 'drip',
            },
            nutrients: {
              npk: '7-7-7',
              ec: 1.0,
              ph: { min: 6.0, max: 6.5 },
              schedule: 'twice weekly',
            },
            notes: 'Autos flower automatically. Use balanced nutrients.',
          },
          {
            name: 'Flowering',
            durationDays: 30,
            environmental: {
              temperature: { min: 20, max: 26, ideal: 23 },
              humidity: { min: 40, max: 50, ideal: 45 },
              vpd: { min: 1.0, max: 1.4, ideal: 1.2 },
            },
            lighting: {
              onTime: '00:00',
              offTime: '06:00',
              intensity: 100,
              spectrum: 'bloom',
            },
            watering: {
              frequency: 'daily' as const,
              amount: 600,
              method: 'drip',
            },
            nutrients: {
              npk: '5-10-10',
              ec: 1.4,
              ph: { min: 6.0, max: 6.5 },
              schedule: 'every watering',
            },
            notes: 'Watch trichomes for harvest. Flush 1-2 weeks before harvest.',
          },
        ] as PhaseSettings[]),
        tags: JSON.stringify(['auto', 'beginner', 'fast', '18-6', 'low-maintenance']),
        version: 1,
      },
      {
        name: 'Advanced Sativa High Yield',
        strainType: 'sativa' as const,
        difficulty: 'advanced' as const,
        description:
          'Intensive recipe for experienced growers seeking maximum sativa yields.',
        author: 'System',
        isPublic: true,
        estimatedYield: '500-700g/m²',
        estimatedDuration: 120,
        phases: JSON.stringify([
          {
            name: 'Seedling',
            durationDays: 14,
            environmental: {
              temperature: { min: 22, max: 26, ideal: 24 },
              humidity: { min: 65, max: 75, ideal: 70 },
              vpd: { min: 0.4, max: 0.8, ideal: 0.6 },
              co2: 400,
            },
            lighting: {
              onTime: '06:00',
              offTime: '00:00',
              intensity: 50,
              spectrum: 'full',
            },
            watering: {
              frequency: 'every_2_days' as const,
              amount: 100,
              method: 'hand',
            },
            notes: 'Maintain high humidity. Start CO2 enrichment.',
          },
          {
            name: 'Vegetative',
            durationDays: 42,
            environmental: {
              temperature: { min: 24, max: 30, ideal: 27 },
              humidity: { min: 55, max: 70, ideal: 62 },
              vpd: { min: 0.8, max: 1.2, ideal: 1.0 },
              co2: 800,
            },
            lighting: {
              onTime: '06:00',
              offTime: '00:00',
              intensity: 85,
              spectrum: 'veg',
            },
            watering: {
              frequency: 'daily' as const,
              amount: 800,
              method: 'drip',
            },
            nutrients: {
              npk: '20-10-10',
              ec: 1.8,
              ph: { min: 5.8, max: 6.2 },
              schedule: 'every watering',
            },
            notes: 'Aggressive training (LST/HST). High CO2 for faster growth.',
          },
          {
            name: 'Flowering',
            durationDays: 70,
            environmental: {
              temperature: { min: 22, max: 28, ideal: 25 },
              humidity: { min: 40, max: 50, ideal: 45 },
              vpd: { min: 1.2, max: 1.6, ideal: 1.4 },
              co2: 1200,
            },
            lighting: {
              onTime: '06:00',
              offTime: '18:00',
              intensity: 100,
              spectrum: 'bloom',
            },
            watering: {
              frequency: 'daily' as const,
              amount: 1500,
              method: 'drip',
            },
            nutrients: {
              npk: '5-15-15',
              ec: 2.0,
              ph: { min: 5.8, max: 6.0 },
              schedule: 'every watering',
            },
            notes:
              'Maximum CO2 for bud development. Sativa may take 10-12 weeks to flower.',
          },
        ] as PhaseSettings[]),
        tags: JSON.stringify(['sativa', 'advanced', 'high-yield', 'co2', 'intensive']),
        version: 1,
      },
    ];

    const createdRecipes: GrowRecipe[] = [];

    for (const recipeData of defaultRecipes) {
      // Check if recipe already exists
      const existing = await GrowRecipe.findOne({
        where: { name: recipeData.name },
      });

      if (!existing) {
        const recipe = await GrowRecipe.create(recipeData);
        createdRecipes.push(recipe);
      }
    }

    return createdRecipes;
  }

  /**
   * Get current phase for a plant based on plant age and recipe
   */
  static getCurrentPhase(
    recipe: GrowRecipe,
    plantAge: number // Days since planting
  ): { phase: PhaseSettings; phaseIndex: number; daysIntoPhase: number } | null {
    const phases: PhaseSettings[] = JSON.parse(recipe.phases);
    let cumulativeDays = 0;

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const phaseEndDay = cumulativeDays + phase.durationDays;

      if (plantAge < phaseEndDay) {
        return {
          phase,
          phaseIndex: i,
          daysIntoPhase: plantAge - cumulativeDays,
        };
      }

      cumulativeDays = phaseEndDay;
    }

    // Plant has completed all phases
    return {
      phase: phases[phases.length - 1],
      phaseIndex: phases.length - 1,
      daysIntoPhase: plantAge - (cumulativeDays - phases[phases.length - 1].durationDays),
    };
  }

  /**
   * Validate recipe phases
   */
  static validateRecipe(recipe: GrowRecipe): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const phases: PhaseSettings[] = JSON.parse(recipe.phases);

      if (!Array.isArray(phases) || phases.length === 0) {
        errors.push('Recipe must have at least one phase');
      }

      phases.forEach((phase, index) => {
        if (!phase.name) {
          errors.push(`Phase ${index}: name is required`);
        }

        if (!phase.durationDays || phase.durationDays < 1) {
          errors.push(`Phase ${index}: durationDays must be at least 1`);
        }

        if (!phase.environmental) {
          errors.push(`Phase ${index}: environmental parameters required`);
        }

        if (!phase.lighting) {
          errors.push(`Phase ${index}: lighting schedule required`);
        }

        if (!phase.watering) {
          errors.push(`Phase ${index}: watering schedule required`);
        }
      });
    } catch (error) {
      errors.push(`Invalid phases JSON: ${(error as Error).message}`);
    }

    return { valid: errors.length === 0, errors };
  }
}
