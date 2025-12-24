import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

export type MilestoneType =
  | 'germination'
  | 'seedling'
  | 'vegetative'
  | 'flowering'
  | 'harvest'
  | 'topping'
  | 'training'
  | 'transplant'
  | 'problem'
  | 'achievement'
  | 'custom';

interface MilestoneAttributes {
  id: number;
  plantId: number;
  type: MilestoneType;
  title: string;
  description?: string;
  date: Date;
  images?: string; // JSON string array of image URLs
  metadata?: string; // JSON string for additional data
  importance?: number; // 1-5 rating
  createdAt?: Date;
  updatedAt?: Date;
}

interface MilestoneCreationAttributes
  extends Optional<MilestoneAttributes, 'id' | 'description' | 'images' | 'metadata' | 'importance'> {}

export class Milestone
  extends Model<MilestoneAttributes, MilestoneCreationAttributes>
  implements MilestoneAttributes {
  public id!: number;
  public plantId!: number;
  public type!: MilestoneType;
  public title!: string;
  public description?: string;
  public date!: Date;
  public images?: string;
  public metadata?: string;
  public importance?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Milestone.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'plants',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    images: {
      type: DataTypes.TEXT, // Store as JSON string
      allowNull: true,
    },
    metadata: {
      type: DataTypes.TEXT, // Store as JSON string
      allowNull: true,
    },
    importance: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 3,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    sequelize,
    tableName: 'milestones',
  }
);
