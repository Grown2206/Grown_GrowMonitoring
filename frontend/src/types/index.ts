export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt?: string;
}

export interface Plant {
  id: number;
  name: string;
  strainId?: number;
  strainName?: string;
  phase: 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'harvested';
  plantedDate?: string;
  harvestDate?: string;
  expectedHarvestDate?: string;
  sensorId: number;
  description?: string;
  isActive: boolean;
  strain?: Strain;
  irrigationConfig?: IrrigationConfig;
}

export interface Strain {
  id: number;
  name: string;
  type: 'indica' | 'sativa' | 'hybrid';
  floweringWeeks: number;
  description?: string;
  thcContent?: string;
  cbdContent?: string;
}

export interface SensorData {
  id: number;
  sensorId: number;
  moistureLevel: number;
  tankLevel?: number;
  nutrientLevel?: number;
  temperature?: number;
  humidity?: number;
  co2?: number;
  par?: number;
  ph?: number;
  ec?: number;
  tds?: number;
  voc?: number;
  pm25?: number;
  light?: number;
  timestamp: string;
}

export interface Device {
  id: number;
  deviceId: string;
  name: string;
  type: 'esp32' | 'esp8266' | 'raspberry_pi' | 'other';
  ipAddress?: string;
  macAddress?: string;
  firmwareVersion?: string;
  status: 'online' | 'offline' | 'error';
  lastSeen?: string;
  location?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  sensors?: Sensor[];
  relays?: Relay[];
}

export interface Sensor {
  id: number;
  sensorId: number;
  deviceId?: number;
  name: string;
  type: 'moisture' | 'temperature' | 'humidity' | 'ph' | 'ec' | 'light' | 'water_level' | 'co2' | 'par' | 'tds' | 'voc' | 'pm25';
  unit: string;
  minValue: number;
  maxValue: number;
  calibrationOffset: number;
  isActive: boolean;
  location?: string;
  lastReading?: number;
  lastReadingAt?: string;
}

export interface Relay {
  id: number;
  relayId: number;
  deviceId?: number;
  name: string;
  type: 'light' | 'fan' | 'pump' | 'heater' | 'humidifier' | 'other';
  status: boolean;
  lastChanged?: string;
}

export interface IrrigationConfig {
  id: number;
  plantId: number;
  pumpId: number;
  enabled: boolean;
  moistureThreshold: number;
  pumpDurationSeconds: number;
  cooldownMinutes: number;
  lastTriggered?: string;
}

export interface IrrigationLog {
  id: number;
  plantId: number;
  pumpId: number;
  moistureLevel: number;
  durationSeconds: number;
  triggeredBy: 'manual' | 'automatic';
  timestamp: string;
}

export type AlertSeverity = 'warning' | 'critical';

export interface Alert {
  id: number;
  name: string;
  type: 'email' | 'webhook' | 'telegram' | 'discord' | 'sms';
  condition: 'tank_low' | 'nutrient_low' | 'nutrient_high' | 'moisture_low' | 'moisture_high' | 'temperature_high' | 'temperature_low' | 'humidity_high' | 'humidity_low';
  threshold: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  enabled: boolean;
  useEscalation: boolean;
  escalationMinutes: number;
  cooldownMinutes: number;
  lastTriggered?: string;
  lastWarningAt?: string;
  currentSeverity?: AlertSeverity;
  recipientEmail?: string;
  webhookUrl?: string;
  telegramChatId?: string;
  telegramBotToken?: string;
  discordWebhookUrl?: string;
}

export interface AlertHistory {
  id: number;
  alertId: number;
  severity: AlertSeverity;
  value: number;
  threshold: number;
  message: string;
  condition: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
  alert?: {
    id: number;
    name: string;
    condition: string;
  };
}

export interface AlertStats {
  totalAlerts: number;
  unacknowledgedCount: number;
  activeWarnings: number;
  activeCritical: number;
}

export interface Note {
  id: number;
  plantId?: number;
  title: string;
  content: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export type MilestoneType =
  | 'germination'
  | 'seedling'
  | 'vegetative'
  | 'flowering'
  | 'harvest'
  | 'topping'
  | 'training'
  | 'transplant'
  | 'problem'
  | 'achievement'
  | 'custom';

export interface Milestone {
  id: number;
  plantId: number;
  type: MilestoneType;
  title: string;
  description?: string;
  date: string;
  images?: string[];
  metadata?: any;
  importance?: number;
  createdAt: string;
  updatedAt: string;
  plant?: {
    id: number;
    name: string;
    phase: string;
  };
}

export interface TimelineItem {
  id: string;
  type: 'note' | 'event' | 'milestone' | 'harvest';
  title: string;
  content?: string;
  date: string;
  category?: string;
  eventType?: string;
  milestoneType?: string;
  completed?: boolean;
  importance?: number;
  images?: string[];
  wetWeight?: number;
  dryWeight?: number;
  quality?: string;
  data: any;
}

export interface JournalSummary {
  plant: {
    id: number;
    name: string;
    phase: string;
    plantedDate: string;
  };
  stats: {
    notes: number;
    events: number;
    milestones: number;
    harvests: number;
    total: number;
  };
}

export interface CalendarEvent {
  id: number;
  plantId?: number;
  title: string;
  description?: string;
  eventDate: string;
  eventType: 'feeding' | 'watering' | 'pruning' | 'harvest' | 'other';
  completed: boolean;
}

export interface SensorManagement {
  id: number;
  sensorId: number;
  name: string;
  type: 'moisture' | 'temperature' | 'humidity' | 'ph' | 'ec' | 'light' | 'water_level';
  unit: string;
  minValue: number;
  maxValue: number;
  calibrationOffset: number;
  isActive: boolean;
  location?: string;
  lastReading?: number;
  lastReadingAt?: string;
}

export interface AutomationRule {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
  triggerType: 'time' | 'sensor' | 'manual';
  triggerConfig: string;
  actionType: 'relay' | 'pump' | 'notification';
  actionConfig: string;
  conditions?: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface ActivityLog {
  id: number;
  userId?: number;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  user?: {
    id: number;
    username: string;
  };
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
}

export interface Schedule {
  id: number;
  name: string;
  type: 'light' | 'watering' | 'feeding' | 'ventilation' | 'custom';
  relayId?: number;
  startTime: string;
  endTime: string;
  daysOfWeek: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Harvest {
  id: number;
  plantId: number;
  harvestDate: string;
  wetWeight?: number;
  dryWeight?: number;
  quality: 'excellent' | 'good' | 'average' | 'poor';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  plant?: Plant;
}

// SMS Types
export interface SMSSettings {
  enabled: boolean;
  accountSid: string;
  authToken: string;
  fromNumber: string;
  toNumbers: string[];
  minIntervalMinutes: number;
  maxSMSPerDay: number;
}

export interface SMSStatus {
  enabled: boolean;
  configured: boolean;
  recipientCount: number;
  dailySMSCount: number;
  maxSMSPerDay: number;
}

export interface SMSStats {
  dailySMSCount: number;
  maxSMSPerDay: number;
  totalCostToday: number;
  successRate: number;
}

export interface SMSHistoryEntry {
  to: string;
  message: string;
  status: 'sent' | 'failed' | 'rate_limited';
  cost?: number;
  sid?: string;
  error?: string;
  timestamp: string;
}

// MQTT / Smart Home Types
export interface MQTTSettings {
  enabled: boolean;
  brokerUrl: string;
  username: string;
  password: string;
  baseTopic: string;
  homeAssistantDiscovery: boolean;
  discoveryPrefix: string;
}

export interface MQTTStatus {
  enabled: boolean;
  connected: boolean;
  brokerUrl: string;
  publishedEntities: number;
  homeAssistantDiscovery: boolean;
}
