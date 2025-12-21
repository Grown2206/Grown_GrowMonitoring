import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface SensorDataAttributes {
  id: number;
  sensorId: number;
  moistureLevel: number;
  tankLevel?: number;
  nutrientLevel?: number;
  temperature?: number;
  humidity?: number;
  timestamp: Date;
}

interface SensorDataCreationAttributes extends Optional<SensorDataAttributes, 'id' | 'tankLevel' | 'nutrientLevel' | 'temperature' | 'humidity'> {}

export class SensorData extends Model<SensorDataAttributes, SensorDataCreationAttributes> implements SensorDataAttributes {
  public id!: number;
  public sensorId!: number;
  public moistureLevel!: number;
  public tankLevel?: number;
  public nutrientLevel?: number;
  public temperature?: number;
  public humidity?: number;
  public timestamp!: Date;
}

SensorData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sensorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    moistureLevel: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    tankLevel: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    nutrientLevel: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'sensor_data',
    timestamps: false,
    indexes: [
      {
        fields: ['sensorId', 'timestamp'],
      },
      {
        fields: ['timestamp'],
      },
    ],
  }
);
