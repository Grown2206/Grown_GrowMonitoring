import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

export type RecentItemType = 'plant' | 'sensor' | 'device' | 'harvest' | 'automation' | 'recipe' | 'report';

interface RecentItemAttributes {
  id: number;
  userId: number;
  itemType: RecentItemType;
  itemId: number;
  itemName: string;
  metadata?: Record<string, any>;
  lastAccessedAt: Date;
  accessCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RecentItemCreationAttributes
  extends Optional<RecentItemAttributes, 'id' | 'metadata' | 'accessCount'> {}

export class RecentItem extends Model<RecentItemAttributes, RecentItemCreationAttributes> implements RecentItemAttributes {
  public id!: number;
  public userId!: number;
  public itemType!: RecentItemType;
  public itemId!: number;
  public itemName!: string;
  public metadata?: Record<string, any>;
  public lastAccessedAt!: Date;
  public accessCount!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RecentItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    itemType: {
      type: DataTypes.ENUM('plant', 'sensor', 'device', 'harvest', 'automation', 'recipe', 'report'),
      allowNull: false,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    accessCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'recent_items',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'itemType', 'itemId'],
      },
      {
        fields: ['userId', 'lastAccessedAt'],
      },
    ],
  }
);
