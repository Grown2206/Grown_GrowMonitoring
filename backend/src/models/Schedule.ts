import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface ScheduleAttributes {
  id: number;
  name: string;
  type: 'light' | 'watering' | 'feeding' | 'ventilation' | 'custom';
  relayId?: number;
  startTime: string;
  endTime: string;
  daysOfWeek: string;
  enabled: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ScheduleCreationAttributes extends Optional<ScheduleAttributes, 'id' | 'relayId' | 'enabled' | 'description'> {}

export class Schedule extends Model<ScheduleAttributes, ScheduleCreationAttributes> implements ScheduleAttributes {
  public id!: number;
  public name!: string;
  public type!: 'light' | 'watering' | 'feeding' | 'ventilation' | 'custom';
  public relayId?: number;
  public startTime!: string;
  public endTime!: string;
  public daysOfWeek!: string;
  public enabled!: boolean;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Schedule.init(
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
      type: DataTypes.ENUM('light', 'watering', 'feeding', 'ventilation', 'custom'),
      allowNull: false,
    },
    relayId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    daysOfWeek: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1,2,3,4,5,6,7',
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'schedules',
  }
);
