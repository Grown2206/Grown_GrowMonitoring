import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/config';

interface PlantPhotoAttributes {
  id: number;
  plantId: number;
  imageUrl: string;
  title?: string;
  description?: string;
  takenAt: Date;
  createdAt?: Date;
}

interface PlantPhotoCreationAttributes extends Optional<PlantPhotoAttributes, 'id' | 'title' | 'description'> {}

export class PlantPhoto extends Model<PlantPhotoAttributes, PlantPhotoCreationAttributes> implements PlantPhotoAttributes {
  public id!: number;
  public plantId!: number;
  public imageUrl!: string;
  public title?: string;
  public description?: string;
  public takenAt!: Date;

  public readonly createdAt!: Date;
}

PlantPhoto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'plants',
        key: 'id',
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    takenAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'plant_photos',
    timestamps: true,
    updatedAt: false,
  }
);
