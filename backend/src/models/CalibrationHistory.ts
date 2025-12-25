import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface CalibrationHistoryAttributes {
  id: number;
  sensorId: number;
  previousOffset: number;
  newOffset: number;
  calibratedBy?: string;
  referenceValue?: number;
  measuredValue?: number;
  notes?: string;
  createdAt?: Date;
}

interface CalibrationHistoryCreationAttributes
  extends Optional<CalibrationHistoryAttributes, 'id' | 'calibratedBy' | 'referenceValue' | 'measuredValue' | 'notes' | 'createdAt'> {}

class CalibrationHistory
  extends Model<CalibrationHistoryAttributes, CalibrationHistoryCreationAttributes>
  implements CalibrationHistoryAttributes
{
  public id!: number;
  public sensorId!: number;
  public previousOffset!: number;
  public newOffset!: number;
  public calibratedBy?: string;
  public referenceValue?: number;
  public measuredValue?: number;
  public notes?: string;
  public readonly createdAt!: Date;
}

CalibrationHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sensorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sensors',
        key: 'id',
      },
    },
    previousOffset: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    newOffset: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    calibratedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referenceValue: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Known reference value used for calibration',
    },
    measuredValue: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Value measured by sensor before calibration',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'calibration_history',
    timestamps: false,
  }
);

export default CalibrationHistory;
