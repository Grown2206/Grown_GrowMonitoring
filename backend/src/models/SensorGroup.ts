import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface SensorGroupAttributes {
  id: number;
  name: string;
  description?: string;
  sensorIds: string; // JSON array of sensor IDs
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SensorGroupCreationAttributes
  extends Optional<SensorGroupAttributes, 'id' | 'description' | 'color' | 'icon' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class SensorGroup
  extends Model<SensorGroupAttributes, SensorGroupCreationAttributes>
  implements SensorGroupAttributes
{
  public id!: number;
  public name!: string;
  public description?: string;
  public sensorIds!: string;
  public color?: string;
  public icon?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SensorGroup.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sensorIds: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'JSON array of sensor IDs',
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#1976d2',
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'sensors',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'sensor_groups',
    timestamps: true,
  }
);

export default SensorGroup;
