import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface CalendarEventAttributes {
  id: number;
  plantId?: number;
  title: string;
  description?: string;
  eventDate: Date;
  eventType: 'feeding' | 'watering' | 'pruning' | 'harvest' | 'other';
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CalendarEventCreationAttributes extends Optional<CalendarEventAttributes, 'id' | 'plantId' | 'description' | 'completed'> {}

export class CalendarEvent extends Model<CalendarEventAttributes, CalendarEventCreationAttributes> implements CalendarEventAttributes {
  public id!: number;
  public plantId?: number;
  public title!: string;
  public description?: string;
  public eventDate!: Date;
  public eventType!: 'feeding' | 'watering' | 'pruning' | 'harvest' | 'other';
  public completed!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CalendarEvent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'plants',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    eventDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    eventType: {
      type: DataTypes.ENUM('feeding', 'watering', 'pruning', 'harvest', 'other'),
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'calendar_events',
  }
);
