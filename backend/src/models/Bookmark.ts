import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/config';

export type BookmarkItemType = 'plant' | 'sensor' | 'device' | 'harvest' | 'automation' | 'recipe' | 'report' | 'strain' | 'alert' | 'note';

export interface BookmarkAttributes {
  id?: number;
  userId: number;
  itemType: BookmarkItemType;
  itemId: number;
  itemName: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Bookmark extends Model<BookmarkAttributes> implements BookmarkAttributes {
  public id!: number;
  public userId!: number;
  public itemType!: BookmarkItemType;
  public itemId!: number;
  public itemName!: string;
  public metadata?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Bookmark.init(
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
      onDelete: 'CASCADE',
    },
    itemType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['plant', 'sensor', 'device', 'harvest', 'automation', 'recipe', 'report', 'strain', 'alert', 'note']],
      },
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
  },
  {
    sequelize,
    tableName: 'bookmarks',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'itemType', 'itemId'],
      },
      {
        fields: ['userId', 'itemType'],
      },
      {
        fields: ['userId', 'createdAt'],
      },
    ],
  }
);

export default Bookmark;
