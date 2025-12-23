import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface AlertAttributes {
  id: number;
  name: string;
  type: 'email' | 'webhook' | 'telegram' | 'discord';
  condition: 'tank_low' | 'nutrient_low' | 'nutrient_high' | 'moisture_low' | 'moisture_high' | 'temperature_high' | 'temperature_low' | 'humidity_high' | 'humidity_low';
  threshold: number;
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: Date;
  recipientEmail?: string;
  webhookUrl?: string;
  telegramChatId?: string;
  telegramBotToken?: string;
  discordWebhookUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AlertCreationAttributes extends Optional<AlertAttributes, 'id' | 'enabled' | 'lastTriggered' | 'recipientEmail' | 'webhookUrl' | 'telegramChatId' | 'telegramBotToken' | 'discordWebhookUrl'> {}

export class Alert extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
  public id!: number;
  public name!: string;
  public type!: 'email' | 'webhook' | 'telegram' | 'discord';
  public condition!: 'tank_low' | 'nutrient_low' | 'nutrient_high' | 'moisture_low' | 'moisture_high' | 'temperature_high' | 'temperature_low' | 'humidity_high' | 'humidity_low';
  public threshold!: number;
  public enabled!: boolean;
  public cooldownMinutes!: number;
  public lastTriggered?: Date;
  public recipientEmail?: string;
  public webhookUrl?: string;
  public telegramChatId?: string;
  public telegramBotToken?: string;
  public discordWebhookUrl?: string;

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
      type: DataTypes.ENUM('email', 'webhook', 'telegram', 'discord'),
      allowNull: false,
    },
    condition: {
      type: DataTypes.ENUM('tank_low', 'nutrient_low', 'nutrient_high', 'moisture_low', 'moisture_high', 'temperature_high', 'temperature_low', 'humidity_high', 'humidity_low'),
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
    telegramChatId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telegramBotToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discordWebhookUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'alerts',
  }
);
