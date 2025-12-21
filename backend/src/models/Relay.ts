import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface RelayAttributes {
  id: number;
  relayId: number;
  name: string;
  type: 'light' | 'fan' | 'pump' | 'heater' | 'humidifier' | 'other';
  status: boolean;
  lastChanged?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RelayCreationAttributes extends Optional<RelayAttributes, 'id' | 'status' | 'lastChanged'> {}

export class Relay extends Model<RelayAttributes, RelayCreationAttributes> implements RelayAttributes {
  public id!: number;
  public relayId!: number;
  public name!: string;
  public type!: 'light' | 'fan' | 'pump' | 'heater' | 'humidifier' | 'other';
  public status!: boolean;
  public lastChanged?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Relay.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    relayId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('light', 'fan', 'pump', 'heater', 'humidifier', 'other'),
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    lastChanged: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'relays',
  }
);
