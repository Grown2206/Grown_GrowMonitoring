import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface StrainAttributes {
  id: number;
  name: string;
  type: 'indica' | 'sativa' | 'hybrid';
  floweringWeeks: number;
  description?: string;
  thcContent?: string;
  cbdContent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StrainCreationAttributes extends Optional<StrainAttributes, 'id' | 'description' | 'thcContent' | 'cbdContent'> {}

export class Strain extends Model<StrainAttributes, StrainCreationAttributes> implements StrainAttributes {
  public id!: number;
  public name!: string;
  public type!: 'indica' | 'sativa' | 'hybrid';
  public floweringWeeks!: number;
  public description?: string;
  public thcContent?: string;
  public cbdContent?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Strain.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('indica', 'sativa', 'hybrid'),
      allowNull: false,
    },
    floweringWeeks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 20,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thcContent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cbdContent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'strains',
  }
);
