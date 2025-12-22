import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface HarvestAttributes {
  id: number;
  plantId: number;
  harvestDate: Date;
  wetWeight?: number;
  dryWeight?: number;
  dryingDays?: number;
  quality: 'excellent' | 'good' | 'average' | 'poor';
  notes?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface HarvestCreationAttributes extends Optional<HarvestAttributes, 'id' | 'wetWeight' | 'dryWeight' | 'dryingDays' | 'notes' | 'imageUrl'> {}

export class Harvest extends Model<HarvestAttributes, HarvestCreationAttributes> implements HarvestAttributes {
  public id!: number;
  public plantId!: number;
  public harvestDate!: Date;
  public wetWeight?: number;
  public dryWeight?: number;
  public dryingDays?: number;
  public quality!: 'excellent' | 'good' | 'average' | 'poor';
  public notes?: string;
  public imageUrl?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Harvest.init(
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
    harvestDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    wetWeight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    dryWeight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    dryingDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quality: {
      type: DataTypes.ENUM('excellent', 'good', 'average', 'poor'),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'harvests',
  }
);
