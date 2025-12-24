import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

export type AlertSeverity = 'warning' | 'critical';

interface AlertAttributes {
  id: number;
  name: string;
  type: 'email' | 'webhook' | 'telegram' | 'discord' | 'sms';
  condition: 'tank_low' | 'nutrient_low' | 'nutrient_high' | 'moisture_low' | 'moisture_high' | 'temperature_high' | 'temperature_low' | 'humidity_high' | 'humidity_low';
  threshold: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  enabled: boolean;
  useEscalation: boolean;
  escalationMinutes: number;
  cooldownMinutes: number;
  lastTriggered?: Date;
  lastWarningAt?: Date;
  currentSeverity?: AlertSeverity;
  recipientEmail?: string;
  webhookUrl?: string;
  telegramChatId?: string;
  telegramBotToken?: string;
  discordWebhookUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AlertCreationAttributes extends Optional<AlertAttributes, 'id' | 'enabled' | 'useEscalation' | 'warningThreshold' | 'criticalThreshold' | 'lastTriggered' | 'lastWarningAt' | 'currentSeverity' | 'recipientEmail' | 'webhookUrl' | 'telegramChatId' | 'telegramBotToken' | 'discordWebhookUrl'> {}

export class Alert extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
  public id!: number;
  public name!: string;
  public type!: 'email' | 'webhook' | 'telegram' | 'discord' | 'sms';
  public condition!: 'tank_low' | 'nutrient_low' | 'nutrient_high' | 'moisture_low' | 'moisture_high' | 'temperature_high' | 'temperature_low' | 'humidity_high' | 'humidity_low';
  public threshold!: number;
  public warningThreshold?: number;
  public criticalThreshold?: number;
  public enabled!: boolean;
  public useEscalation!: boolean;
  public escalationMinutes!: number;
  public cooldownMinutes!: number;
  public lastTriggered?: Date;
  public lastWarningAt?: Date;
  public currentSeverity?: AlertSeverity;
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
    warningThreshold: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    criticalThreshold: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    useEscalation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    escalationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
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
    lastWarningAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    currentSeverity: {
      type: DataTypes.ENUM('warning', 'critical'),
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
