import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface PlantAttributes {
  id: number;
  name: string;
  strainId?: number;
  phase: 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'harvested';
  plantedDate?: Date;
  harvestDate?: Date;
  sensorId: number;
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlantCreationAttributes extends Optional<PlantAttributes, 'id' | 'strainId' | 'plantedDate' | 'harvestDate' | 'notes' | 'isActive' | 'phase'> {}

export class Plant extends Model<PlantAttributes, PlantCreationAttributes> implements PlantAttributes {
  public id!: number;
  public name!: string;
  public strainId?: number;
  public phase!: 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'harvested';
  public plantedDate?: Date;
  public harvestDate?: Date;
  public sensorId!: number;
  public notes?: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Plant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    strainId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'strains',
        key: 'id',
      },
    },
    phase: {
      type: DataTypes.ENUM('germination', 'seedling', 'vegetative', 'flowering', 'harvested'),
      defaultValue: 'germination',
      allowNull: false,
    },
    plantedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    harvestDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sensorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'plants',
  }
);
