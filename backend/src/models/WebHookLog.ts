import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';
import { WebHookEvent } from './WebHook';

interface WebHookLogAttributes {
  id: number;
  webhookId: number;
  event: WebHookEvent;
  payload: Record<string, any>;
  response?: string;
  statusCode?: number;
  success: boolean;
  errorMessage?: string;
  durationMs: number;
  attempt: number;
  createdAt?: Date;
}

interface WebHookLogCreationAttributes
  extends Optional<WebHookLogAttributes, 'id' | 'response' | 'statusCode' | 'errorMessage'> {}

export class WebHookLog extends Model<WebHookLogAttributes, WebHookLogCreationAttributes> implements WebHookLogAttributes {
  public id!: number;
  public webhookId!: number;
  public event!: WebHookEvent;
  public payload!: Record<string, any>;
  public response?: string;
  public statusCode?: number;
  public success!: boolean;
  public errorMessage?: string;
  public durationMs!: number;
  public attempt!: number;

  public readonly createdAt!: Date;
}

WebHookLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    webhookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'webhooks',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    event: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    durationMs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attempt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'webhook_logs',
    timestamps: true,
    updatedAt: false,
  }
);
