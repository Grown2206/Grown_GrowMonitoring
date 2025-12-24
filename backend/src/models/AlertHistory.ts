import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';
import { AlertSeverity } from './Alert';

interface AlertHistoryAttributes {
  id: number;
  alertId: number;
  severity: AlertSeverity;
  value: number;
  threshold: number;
  message: string;
  condition: string;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  createdAt?: Date;
}

interface AlertHistoryCreationAttributes
  extends Optional<AlertHistoryAttributes, 'id' | 'acknowledged' | 'acknowledgedAt' | 'acknowledgedBy'> {}

export class AlertHistory
  extends Model<AlertHistoryAttributes, AlertHistoryCreationAttributes>
  implements AlertHistoryAttributes {
  public id!: number;
  public alertId!: number;
  public severity!: AlertSeverity;
  public value!: number;
  public threshold!: number;
  public message!: string;
  public condition!: string;
  public acknowledged!: boolean;
  public acknowledgedAt?: Date;
  public acknowledgedBy?: string;

  public readonly createdAt!: Date;
}

AlertHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    alertId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'alerts',
        key: 'id',
      },
    },
    severity: {
      type: DataTypes.ENUM('warning', 'critical'),
      allowNull: false,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    threshold: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    acknowledged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    acknowledgedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'alert_history',
    updatedAt: false, // History entries don't need updates
  }
);
