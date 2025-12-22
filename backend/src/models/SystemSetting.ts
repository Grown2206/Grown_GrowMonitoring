import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface SystemSettingAttributes {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SystemSettingCreationAttributes extends Optional<SystemSettingAttributes, 'id' | 'description'> {}

export class SystemSetting extends Model<SystemSettingAttributes, SystemSettingCreationAttributes> implements SystemSettingAttributes {
  public id!: number;
  public key!: string;
  public value!: string;
  public type!: 'string' | 'number' | 'boolean' | 'json';
  public category!: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SystemSetting.init(
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
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
      allowNull: false,
      defaultValue: 'string',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'system_settings',
  }
);
