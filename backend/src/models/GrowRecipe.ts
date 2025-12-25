import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

/**
 * Grow Recipe Model
 * Pre-defined recipes for different strains and growth phases
 */

export interface EnvironmentalParams {
  temperature: { min: number; max: number; ideal: number };
  humidity: { min: number; max: number; ideal: number };
  vpd?: { min: number; max: number; ideal: number };
  co2?: number;
  light?: { intensity: number; dli: number };
}

export interface LightingSchedule {
  onTime: string; // HH:MM format
  offTime: string; // HH:MM format
  intensity: number; // 0-100%
  spectrum?: string; // e.g., "full", "veg", "bloom"
}

export interface WateringSchedule {
  frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly' | 'as_needed';
  amount: number; // ml or liters
  method?: string; // e.g., "drip", "hand", "flood"
}

export interface NutrientSchedule {
  npk: string; // e.g., "5-10-5"
  ec: number; // Electrical conductivity
  ph: { min: number; max: number };
  schedule: string; // e.g., "twice weekly", "every watering"
}

export interface PhaseSettings {
  name: string; // e.g., "Seedling", "Vegetative", "Flowering"
  durationDays: number;
  environmental: EnvironmentalParams;
  lighting: LightingSchedule;
  watering: WateringSchedule;
  nutrients?: NutrientSchedule;
  notes?: string;
}

interface GrowRecipeAttributes {
  id: number;
  name: string;
  strainType: 'indica' | 'sativa' | 'hybrid' | 'auto' | 'cbd' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
  author?: string;
  isPublic: boolean;
  phases: string; // JSON array of PhaseSettings
  tags?: string; // JSON array of tags
  estimatedYield?: string; // e.g., "400-500g/m²"
  estimatedDuration?: number; // Total days
  automationRules?: string; // JSON array of rule IDs to apply
  notes?: string;
  version: number; // Recipe version for updates
  createdBy?: number; // User ID
  usageCount: number; // How many times this recipe has been applied
  rating?: number; // Average user rating (1-5)
  createdAt?: Date;
  updatedAt?: Date;
}

interface GrowRecipeCreationAttributes
  extends Optional<
    GrowRecipeAttributes,
    | 'id'
    | 'isPublic'
    | 'version'
    | 'usageCount'
    | 'createdAt'
    | 'updatedAt'
    | 'description'
    | 'author'
    | 'tags'
    | 'estimatedYield'
    | 'estimatedDuration'
    | 'automationRules'
    | 'notes'
    | 'createdBy'
    | 'rating'
  > {}

export class GrowRecipe
  extends Model<GrowRecipeAttributes, GrowRecipeCreationAttributes>
  implements GrowRecipeAttributes
{
  public id!: number;
  public name!: string;
  public strainType!: 'indica' | 'sativa' | 'hybrid' | 'auto' | 'cbd' | 'custom';
  public difficulty!: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  public description?: string;
  public author?: string;
  public isPublic!: boolean;
  public phases!: string;
  public tags?: string;
  public estimatedYield?: string;
  public estimatedDuration?: number;
  public automationRules?: string;
  public notes?: string;
  public version!: number;
  public createdBy?: number;
  public usageCount!: number;
  public rating?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GrowRecipe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 100],
      },
    },
    strainType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['indica', 'sativa', 'hybrid', 'auto', 'cbd', 'custom']],
      },
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'beginner',
      validate: {
        isIn: [['beginner', 'intermediate', 'advanced', 'expert']],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    phases: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isJSON(value: string) {
          try {
            JSON.parse(value);
          } catch (e) {
            throw new Error('phases must be valid JSON');
          }
        },
      },
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isJSON(value: string) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('tags must be valid JSON');
            }
          }
        },
      },
    },
    estimatedYield: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 365,
      },
    },
    automationRules: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isJSON(value: string) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('automationRules must be valid JSON');
            }
          }
        },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    sequelize,
    tableName: 'grow_recipes',
    timestamps: true,
  }
);

export default GrowRecipe;
