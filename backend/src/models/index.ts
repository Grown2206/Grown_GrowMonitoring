import { User } from './User';
import { ApiKey } from './ApiKey';
import { Strain } from './Strain';
import { Plant } from './Plant';
import { SensorData } from './SensorData';
import { Relay } from './Relay';
import { IrrigationConfig } from './IrrigationConfig';
import { IrrigationLog } from './IrrigationLog';
import { Alert } from './Alert';
import { Note } from './Note';
import { CalendarEvent } from './CalendarEvent';

// Define associations
User.hasMany(ApiKey, { foreignKey: 'userId', as: 'apiKeys' });
ApiKey.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Strain.hasMany(Plant, { foreignKey: 'strainId', as: 'plants' });
Plant.belongsTo(Strain, { foreignKey: 'strainId', as: 'strain' });

Plant.hasOne(IrrigationConfig, { foreignKey: 'plantId', as: 'irrigationConfig' });
IrrigationConfig.belongsTo(Plant, { foreignKey: 'plantId', as: 'plant' });

Plant.hasMany(Note, { foreignKey: 'plantId', as: 'notes' });
Note.belongsTo(Plant, { foreignKey: 'plantId', as: 'plant' });

Plant.hasMany(CalendarEvent, { foreignKey: 'plantId', as: 'events' });
CalendarEvent.belongsTo(Plant, { foreignKey: 'plantId', as: 'plant' });

export {
  User,
  ApiKey,
  Strain,
  Plant,
  SensorData,
  Relay,
  IrrigationConfig,
  IrrigationLog,
  Alert,
  Note,
  CalendarEvent,
};
