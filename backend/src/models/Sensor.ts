import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface SensorAttributes {
  id: number;
  sensorId: number;
  name: string;
  type: 'moisture' | 'temperature' | 'humidity' | 'ph' | 'ec' | 'light' | 'water_level';
  unit: string;
  minValue: number;
  maxValue: number;
  calibrationOffset: number;
  isActive: boolean;
  location?: string;
  lastReading?: number;
  lastReadingAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SensorCreationAttributes extends Optional<SensorAttributes, 'id' | 'calibrationOffset' | 'isActive' | 'location' | 'lastReading' | 'lastReadingAt'> {}

export class Sensor extends Model<SensorAttributes, SensorCreationAttributes> implements SensorAttributes {
  public id!: number;
  public sensorId!: number;
  public name!: string;
  public type!: 'moisture' | 'temperature' | 'humidity' | 'ph' | 'ec' | 'light' | 'water_level';
  public unit!: string;
  public minValue!: number;
  public maxValue!: number;
  public calibrationOffset!: number;
  public isActive!: boolean;
  public location?: string;
  public lastReading?: number;
  public lastReadingAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Sensor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sensorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('moisture', 'temperature', 'humidity', 'ph', 'ec', 'light', 'water_level'),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    maxValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 100,
    },
    calibrationOffset: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastReading: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    lastReadingAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'sensors',
  }
);
