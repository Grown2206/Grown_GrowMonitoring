import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

export type VirtualSensorType =
  | 'vpd'
  | 'dli'
  | 'dew_point'
  | 'heat_index'
  | 'absolute_humidity'
  | 'custom';

interface VirtualSensorAttributes {
  id: number;
  name: string;
  type: VirtualSensorType;
  sensorId: number; // Virtual sensor ID (unique sensor identifier)
  description?: string;
  formula?: string; // For custom type or advanced formulas
  config: string; // JSON config: { sourceSensorIds: [1, 2], params: {...} }
  unit: string;
  enabled: boolean;
  updateIntervalMinutes: number;
  lastCalculated?: Date;
  lastValue?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VirtualSensorCreationAttributes
  extends Optional<
    VirtualSensorAttributes,
    'id' | 'description' | 'formula' | 'lastCalculated' | 'lastValue' | 'createdAt' | 'updatedAt'
  > {}

class VirtualSensor
  extends Model<VirtualSensorAttributes, VirtualSensorCreationAttributes>
  implements VirtualSensorAttributes
{
  public id!: number;
  public name!: string;
  public type!: VirtualSensorType;
  public sensorId!: number;
  public description?: string;
  public formula?: string;
  public config!: string;
  public unit!: string;
  public enabled!: boolean;
  public updateIntervalMinutes!: number;
  public lastCalculated?: Date;
  public lastValue?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VirtualSensor.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['vpd', 'dli', 'dew_point', 'heat_index', 'absolute_humidity', 'custom']],
      },
    },
    sensorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: 'Unique sensor ID for this virtual sensor',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    formula: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Custom formula or advanced calculation logic',
    },
    config: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'JSON config with sourceSensorIds and parameters',
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    updateIntervalMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      comment: 'How often to recalculate this virtual sensor',
    },
    lastCalculated: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastValue: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'virtual_sensors',
    timestamps: true,
  }
);

export default VirtualSensor;
