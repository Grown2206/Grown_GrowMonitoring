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
  co2?: number;
  par?: number;
  ph?: number;
  ec?: number;
  tds?: number;
  voc?: number;
  pm25?: number;
  light?: number;
  timestamp: Date;
}

interface SensorDataCreationAttributes extends Optional<SensorDataAttributes, 'id' | 'tankLevel' | 'nutrientLevel' | 'temperature' | 'humidity' | 'co2' | 'par' | 'ph' | 'ec' | 'tds' | 'voc' | 'pm25' | 'light'> {}

export class SensorData extends Model<SensorDataAttributes, SensorDataCreationAttributes> implements SensorDataAttributes {
  public id!: number;
  public sensorId!: number;
  public moistureLevel!: number;
  public tankLevel?: number;
  public nutrientLevel?: number;
  public temperature?: number;
  public humidity?: number;
  public co2?: number;
  public par?: number;
  public ph?: number;
  public ec?: number;
  public tds?: number;
  public voc?: number;
  public pm25?: number;
  public light?: number;
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
    co2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    par: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ph: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ec: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tds: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    voc: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    pm25: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    light: {
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
    hooks: {
      afterCreate: async (sensorData: SensorData) => {
        try {
          const { mqttService } = await import('../services/mqttService');

          // Publish each sensor type that has a value
          const sensorMappings: Array<{ field: keyof SensorDataAttributes; type: string; unit: string }> = [
            { field: 'temperature', type: 'temperature', unit: '°C' },
            { field: 'humidity', type: 'humidity', unit: '%' },
            { field: 'moistureLevel', type: 'soil_moisture', unit: '%' },
            { field: 'light', type: 'light', unit: 'lux' },
            { field: 'ph', type: 'ph', unit: 'pH' },
            { field: 'ec', type: 'ec', unit: 'mS/cm' },
            { field: 'co2', type: 'co2', unit: 'ppm' },
            { field: 'par', type: 'par', unit: 'µmol/m²/s' },
          ];

          for (const mapping of sensorMappings) {
            const value = sensorData[mapping.field];
            if (value !== null && value !== undefined) {
              await mqttService.publishSensorData({
                type: mapping.type,
                value: value as number,
                unit: mapping.unit,
                timestamp: sensorData.timestamp,
                sensorId: sensorData.sensorId,
              } as any);
            }
          }
        } catch (error) {
          // Silently fail - MQTT is not critical
          console.error('Failed to publish sensor data to MQTT:', error);
        }
      },
    },
  }
);
