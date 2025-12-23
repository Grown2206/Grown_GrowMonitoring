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
  timestamp: string;
}

export interface Relay {
  id: number;
  relayId: number;
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

export interface Alert {
  id: number;
  name: string;
  type: 'email' | 'webhook' | 'telegram' | 'discord';
  condition: 'tank_low' | 'nutrient_low' | 'nutrient_high' | 'moisture_low' | 'moisture_high' | 'temperature_high' | 'temperature_low' | 'humidity_high' | 'humidity_low';
  threshold: number;
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: string;
  recipientEmail?: string;
  webhookUrl?: string;
  telegramChatId?: string;
  telegramBotToken?: string;
  discordWebhookUrl?: string;
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
