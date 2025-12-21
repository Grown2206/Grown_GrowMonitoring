import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface IrrigationConfigAttributes {
  id: number;
  plantId: number;
  pumpId: number;
  enabled: boolean;
  moistureThreshold: number;
  pumpDurationSeconds: number;
  cooldownMinutes: number;
  lastTriggered?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IrrigationConfigCreationAttributes extends Optional<IrrigationConfigAttributes, 'id' | 'enabled' | 'lastTriggered'> {}

export class IrrigationConfig extends Model<IrrigationConfigAttributes, IrrigationConfigCreationAttributes> implements IrrigationConfigAttributes {
  public id!: number;
  public plantId!: number;
  public pumpId!: number;
  public enabled!: boolean;
  public moistureThreshold!: number;
  public pumpDurationSeconds!: number;
  public cooldownMinutes!: number;
  public lastTriggered?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

IrrigationConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'plants',
        key: 'id',
      },
    },
    pumpId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    moistureThreshold: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    pumpDurationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 300,
      },
    },
    cooldownMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 1440,
      },
    },
    lastTriggered: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'irrigation_configs',
  }
);
