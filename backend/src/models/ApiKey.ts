import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';
import { v4 as uuidv4 } from 'uuid';

interface ApiKeyAttributes {
  id: number;
  userId: number;
  key: string;
  name: string;
  description?: string;
  isActive: boolean;
  lastUsed?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ApiKeyCreationAttributes extends Optional<ApiKeyAttributes, 'id' | 'isActive' | 'description' | 'lastUsed'> {}

export class ApiKey extends Model<ApiKeyAttributes, ApiKeyCreationAttributes> implements ApiKeyAttributes {
  public id!: number;
  public userId!: number;
  public key!: string;
  public name!: string;
  public description?: string;
  public isActive!: boolean;
  public lastUsed?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static generateKey(): string {
    return `gms_${uuidv4().replace(/-/g, '')}`;
  }
}

ApiKey.init(
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
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    lastUsed: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'api_keys',
    hooks: {
      beforeCreate: (apiKey: ApiKey) => {
        if (!apiKey.key) {
          apiKey.key = ApiKey.generateKey();
        }
      },
    },
  }
);
