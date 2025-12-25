import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

export type WebHookEvent =
  | 'sensor.data'
  | 'sensor.alert'
  | 'plant.created'
  | 'plant.updated'
  | 'plant.deleted'
  | 'harvest.created'
  | 'irrigation.triggered'
  | 'relay.state_changed'
  | 'automation.triggered'
  | 'alert.triggered'
  | 'device.online'
  | 'device.offline';

export type WebHookMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';

export type WebHookStatus = 'active' | 'paused' | 'failed';

interface WebHookAttributes {
  id: number;
  name: string;
  url: string;
  method: WebHookMethod;
  events: WebHookEvent[];
  headers?: Record<string, string>;
  secret?: string;
  status: WebHookStatus;
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  lastTriggeredAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  failureCount: number;
  successCount: number;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WebHookCreationAttributes
  extends Optional<
    WebHookAttributes,
    'id' | 'headers' | 'secret' | 'status' | 'retryCount' | 'maxRetries' | 'timeoutMs' | 'lastTriggeredAt' | 'lastSuccessAt' | 'lastFailureAt' | 'failureCount' | 'successCount' | 'enabled'
  > {}

export class WebHook extends Model<WebHookAttributes, WebHookCreationAttributes> implements WebHookAttributes {
  public id!: number;
  public name!: string;
  public url!: string;
  public method!: WebHookMethod;
  public events!: WebHookEvent[];
  public headers?: Record<string, string>;
  public secret?: string;
  public status!: WebHookStatus;
  public retryCount!: number;
  public maxRetries!: number;
  public timeoutMs!: number;
  public lastTriggeredAt?: Date;
  public lastSuccessAt?: Date;
  public lastFailureAt?: Date;
  public failureCount!: number;
  public successCount!: number;
  public enabled!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WebHook.init(
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
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    method: {
      type: DataTypes.ENUM('GET', 'POST', 'PUT', 'PATCH'),
      allowNull: false,
      defaultValue: 'POST',
    },
    events: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidEvents(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Events must be an array');
          }
          const validEvents: WebHookEvent[] = [
            'sensor.data',
            'sensor.alert',
            'plant.created',
            'plant.updated',
            'plant.deleted',
            'harvest.created',
            'irrigation.triggered',
            'relay.state_changed',
            'automation.triggered',
            'alert.triggered',
            'device.online',
            'device.offline',
          ];
          for (const event of value) {
            if (!validEvents.includes(event)) {
              throw new Error(`Invalid event: ${event}`);
            }
          }
        },
      },
    },
    headers: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'failed'),
      allowNull: false,
      defaultValue: 'active',
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxRetries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    timeoutMs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5000,
    },
    lastTriggeredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastSuccessAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastFailureAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failureCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    successCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'webhooks',
  }
);
