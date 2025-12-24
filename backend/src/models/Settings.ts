import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface SettingsAttributes {
  id: number;
  key: string;
  value: string | number | boolean | object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SettingsCreationAttributes extends Optional<SettingsAttributes, 'id'> {}

export class Settings extends Model<SettingsAttributes, SettingsCreationAttributes> implements SettingsAttributes {
  public id!: number;
  public key!: string;
  public value!: string | number | boolean | object;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Settings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'settings',
    timestamps: true,
  }
);
