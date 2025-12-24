import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface ReportScheduleAttributes {
  id: number;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  recipientEmail: string;
  reportFormat: 'pdf' | 'html';
  includeCharts: boolean;
  includeSensorData: boolean;
  includePlantStatus: boolean;
  includeHarvests: boolean;
  includeAlerts: boolean;
  lastRun?: Date;
  nextRun?: Date;
  dayOfWeek?: number; // 0-6 for weekly reports
  dayOfMonth?: number; // 1-31 for monthly reports
  timeOfDay: string; // HH:MM format
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReportScheduleCreationAttributes extends Optional<ReportScheduleAttributes, 'id' | 'enabled' | 'includeCharts' | 'includeSensorData' | 'includePlantStatus' | 'includeHarvests' | 'includeAlerts' | 'lastRun' | 'nextRun' | 'dayOfWeek' | 'dayOfMonth'> {}

export class ReportSchedule extends Model<ReportScheduleAttributes, ReportScheduleCreationAttributes> implements ReportScheduleAttributes {
  public id!: number;
  public name!: string;
  public type!: 'daily' | 'weekly' | 'monthly';
  public enabled!: boolean;
  public recipientEmail!: string;
  public reportFormat!: 'pdf' | 'html';
  public includeCharts!: boolean;
  public includeSensorData!: boolean;
  public includePlantStatus!: boolean;
  public includeHarvests!: boolean;
  public includeAlerts!: boolean;
  public lastRun?: Date;
  public nextRun?: Date;
  public dayOfWeek?: number;
  public dayOfMonth?: number;
  public timeOfDay!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ReportSchedule.init(
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
      type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    recipientEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    reportFormat: {
      type: DataTypes.ENUM('pdf', 'html'),
      defaultValue: 'pdf',
      allowNull: false,
    },
    includeCharts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    includeSensorData: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    includePlantStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    includeHarvests: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    includeAlerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    lastRun: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextRun: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 6,
      },
    },
    dayOfMonth: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 31,
      },
    },
    timeOfDay: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '08:00',
      validate: {
        is: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
  },
  {
    sequelize,
    tableName: 'report_schedules',
  }
);
