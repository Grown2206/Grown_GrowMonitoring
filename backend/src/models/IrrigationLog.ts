import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface IrrigationLogAttributes {
  id: number;
  plantId: number;
  pumpId: number;
  moistureLevel: number;
  durationSeconds: number;
  triggeredBy: 'manual' | 'automatic';
  timestamp: Date;
}

interface IrrigationLogCreationAttributes extends Optional<IrrigationLogAttributes, 'id'> {}

export class IrrigationLog extends Model<IrrigationLogAttributes, IrrigationLogCreationAttributes> implements IrrigationLogAttributes {
  public id!: number;
  public plantId!: number;
  public pumpId!: number;
  public moistureLevel!: number;
  public durationSeconds!: number;
  public triggeredBy!: 'manual' | 'automatic';
  public timestamp!: Date;
}

IrrigationLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pumpId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    moistureLevel: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    triggeredBy: {
      type: DataTypes.ENUM('manual', 'automatic'),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'irrigation_logs',
    timestamps: false,
  }
);
