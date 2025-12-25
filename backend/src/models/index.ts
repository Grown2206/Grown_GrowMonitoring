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
import { Sensor } from './Sensor';
import { AutomationRule } from './AutomationRule';
import { ActivityLog } from './ActivityLog';
import { SystemSetting } from './SystemSetting';
import { Schedule } from './Schedule';
import { Harvest } from './Harvest';
import { PlantPhoto } from './PlantPhoto';
import { Device } from './Device';
import { ReportSchedule } from './ReportSchedule';
import { Milestone } from './Milestone';
import { AlertHistory } from './AlertHistory';
import { Settings } from './Settings';
import CalibrationHistory from './CalibrationHistory';
import SensorGroup from './SensorGroup';

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

User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Plant.hasMany(Harvest, { foreignKey: 'plantId', as: 'harvests' });
Harvest.belongsTo(Plant, { foreignKey: 'plantId', as: 'plant' });

Plant.hasMany(PlantPhoto, { foreignKey: 'plantId', as: 'photos' });
PlantPhoto.belongsTo(Plant, { foreignKey: 'plantId', as: 'plant' });

Plant.hasMany(Milestone, { foreignKey: 'plantId', as: 'milestones' });
Milestone.belongsTo(Plant, { foreignKey: 'plantId', as: 'plant' });

Alert.hasMany(AlertHistory, { foreignKey: 'alertId', as: 'history' });
AlertHistory.belongsTo(Alert, { foreignKey: 'alertId', as: 'alert' });

Sensor.hasMany(CalibrationHistory, { foreignKey: 'sensorId', as: 'calibrationHistory' });
CalibrationHistory.belongsTo(Sensor, { foreignKey: 'sensorId', as: 'sensor' });

Device.hasMany(Sensor, { foreignKey: 'deviceId', as: 'sensors' });
Sensor.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' });

Device.hasMany(Relay, { foreignKey: 'deviceId', as: 'relays' });
Relay.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' });

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
  Sensor,
  AutomationRule,
  ActivityLog,
  SystemSetting,
  Schedule,
  Harvest,
  PlantPhoto,
  Device,
  ReportSchedule,
  Milestone,
  AlertHistory,
  Settings,
  CalibrationHistory,
  SensorGroup,
};
