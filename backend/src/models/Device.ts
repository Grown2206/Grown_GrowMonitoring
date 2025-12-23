import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface DeviceAttributes {
  id: number;
  deviceId: string; // Unique identifier (MAC address or custom ID)
  name: string;
  type: 'esp32' | 'esp8266' | 'raspberry_pi' | 'other';
  ipAddress?: string;
  macAddress?: string;
  firmwareVersion?: string;
  status: 'online' | 'offline' | 'error';
  lastSeen?: Date;
  location?: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DeviceCreationAttributes extends Optional<DeviceAttributes, 'id' | 'ipAddress' | 'macAddress' | 'firmwareVersion' | 'lastSeen' | 'location' | 'description' | 'isActive'> {}

export class Device extends Model<DeviceAttributes, DeviceCreationAttributes> implements DeviceAttributes {
  public id!: number;
  public deviceId!: string;
  public name!: string;
  public type!: 'esp32' | 'esp8266' | 'raspberry_pi' | 'other';
  public ipAddress?: string;
  public macAddress?: string;
  public firmwareVersion?: string;
  public status!: 'online' | 'offline' | 'error';
  public lastSeen?: Date;
  public location?: string;
  public description?: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Device.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('esp32', 'esp8266', 'raspberry_pi', 'other'),
      allowNull: false,
      defaultValue: 'esp32',
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    macAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firmwareVersion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('online', 'offline', 'error'),
      allowNull: false,
      defaultValue: 'offline',
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'devices',
  }
);
