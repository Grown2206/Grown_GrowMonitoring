import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

/**
 * Cost Entry Model
 * Tracks all expenses related to growing operations
 */

export type CostCategory =
  | 'seeds'
  | 'nutrients'
  | 'electricity'
  | 'water'
  | 'equipment'
  | 'soil'
  | 'containers'
  | 'maintenance'
  | 'other';

interface CostEntryAttributes {
  id: number;
  plantId?: number;
  growCycleId?: number;
  category: CostCategory;
  description: string;
  amount: number; // Cost in currency
  currency: string;
  quantity?: number;
  unit?: string;
  date: Date;
  vendor?: string;
  invoiceNumber?: string;
  notes?: string;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string; // JSON array
  createdAt?: Date;
  updatedAt?: Date;
}

interface CostEntryCreationAttributes
  extends Optional<
    CostEntryAttributes,
    | 'id'
    | 'plantId'
    | 'growCycleId'
    | 'quantity'
    | 'unit'
    | 'vendor'
    | 'invoiceNumber'
    | 'notes'
    | 'recurringInterval'
    | 'tags'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class CostEntry
  extends Model<CostEntryAttributes, CostEntryCreationAttributes>
  implements CostEntryAttributes
{
  public id!: number;
  public plantId?: number;
  public growCycleId?: number;
  public category!: CostCategory;
  public description!: string;
  public amount!: number;
  public currency!: string;
  public quantity?: number;
  public unit?: string;
  public date!: Date;
  public vendor?: string;
  public invoiceNumber?: string;
  public notes?: string;
  public isRecurring!: boolean;
  public recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  public tags?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CostEntry.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'plants',
        key: 'id',
      },
    },
    growCycleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          [
            'seeds',
            'nutrients',
            'electricity',
            'water',
            'equipment',
            'soil',
            'containers',
            'maintenance',
            'other',
          ],
        ],
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'EUR',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    vendor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    recurringInterval: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['daily', 'weekly', 'monthly', 'yearly']],
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
  },
  {
    sequelize,
    tableName: 'cost_entries',
    timestamps: true,
  }
);

export default CostEntry;
