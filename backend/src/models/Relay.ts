import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface RelayAttributes {
  id: number;
  relayId: number;
  deviceId?: number; // Foreign key to Device
  name: string;
  type: 'light' | 'fan' | 'pump' | 'heater' | 'humidifier' | 'other';
  status: boolean;
  lastChanged?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RelayCreationAttributes extends Optional<RelayAttributes, 'id' | 'deviceId' | 'status' | 'lastChanged'> {}

export class Relay extends Model<RelayAttributes, RelayCreationAttributes> implements RelayAttributes {
  public id!: number;
  public relayId!: number;
  public deviceId?: number;
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
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'devices',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    hooks: {
      afterUpdate: async (relay: Relay) => {
        try {
          const { mqttService } = await import('../services/mqttService');
          await mqttService.publishRelayState(relay);
        } catch (error) {
          // Silently fail - MQTT is not critical
          console.error('Failed to publish relay state to MQTT:', error);
        }
      },
      afterCreate: async (relay: Relay) => {
        try {
          const { mqttService } = await import('../services/mqttService');
          await mqttService.publishRelayState(relay);
        } catch (error) {
          // Silently fail - MQTT is not critical
          console.error('Failed to publish relay state to MQTT:', error);
        }
      },
    },
  }
);
