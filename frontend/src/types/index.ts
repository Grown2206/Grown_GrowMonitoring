export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Plant {
  id: number;
  name: string;
  strainId?: number;
  phase: 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'harvested';
  plantedDate?: string;
  harvestDate?: string;
  sensorId: number;
  notes?: string;
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
  type: 'email' | 'webhook';
  condition: 'tank_low' | 'nutrient_low' | 'nutrient_high' | 'moisture_low' | 'moisture_high';
  threshold: number;
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: string;
  recipientEmail?: string;
  webhookUrl?: string;
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
