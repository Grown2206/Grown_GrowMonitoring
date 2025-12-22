import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface AutomationRuleAttributes {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
  triggerType: 'time' | 'sensor' | 'manual';
  triggerConfig: string; // JSON string
  actionType: 'relay' | 'pump' | 'notification';
  actionConfig: string; // JSON string
  conditions?: string; // JSON string
  lastTriggered?: Date;
  triggerCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AutomationRuleCreationAttributes extends Optional<AutomationRuleAttributes, 'id' | 'description' | 'enabled' | 'conditions' | 'lastTriggered' | 'triggerCount'> {}

export class AutomationRule extends Model<AutomationRuleAttributes, AutomationRuleCreationAttributes> implements AutomationRuleAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public enabled!: boolean;
  public triggerType!: 'time' | 'sensor' | 'manual';
  public triggerConfig!: string;
  public actionType!: 'relay' | 'pump' | 'notification';
  public actionConfig!: string;
  public conditions?: string;
  public lastTriggered?: Date;
  public triggerCount!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AutomationRule.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    triggerType: {
      type: DataTypes.ENUM('time', 'sensor', 'manual'),
      allowNull: false,
    },
    triggerConfig: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    actionType: {
      type: DataTypes.ENUM('relay', 'pump', 'notification'),
      allowNull: false,
    },
    actionConfig: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    conditions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastTriggered: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    triggerCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'automation_rules',
  }
);
