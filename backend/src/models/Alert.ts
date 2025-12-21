import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface AlertAttributes {
  id: number;
  name: string;
  type: 'email' | 'webhook';
  condition: 'tank_low' | 'nutrient_low' | 'nutrient_high' | 'moisture_low' | 'moisture_high';
  threshold: number;
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: Date;
  recipientEmail?: string;
  webhookUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AlertCreationAttributes extends Optional<AlertAttributes, 'id' | 'enabled' | 'lastTriggered' | 'recipientEmail' | 'webhookUrl'> {}

export class Alert extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
  public id!: number;
  public name!: string;
  public type!: 'email' | 'webhook';
  public condition!: 'tank_low' | 'nutrient_low' | 'nutrient_high' | 'moisture_low' | 'moisture_high';
  public threshold!: number;
  public enabled!: boolean;
  public cooldownMinutes!: number;
  public lastTriggered?: Date;
  public recipientEmail?: string;
  public webhookUrl?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Alert.init(
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
      type: DataTypes.ENUM('email', 'webhook'),
      allowNull: false,
    },
    condition: {
      type: DataTypes.ENUM('tank_low', 'nutrient_low', 'nutrient_high', 'moisture_low', 'moisture_high'),
      allowNull: false,
    },
    threshold: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    cooldownMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
    },
    lastTriggered: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    recipientEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    webhookUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'alerts',
  }
);
