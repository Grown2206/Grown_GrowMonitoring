// Sensor type configurations with default values and units
export const SENSOR_CONFIG = {
  moisture: {
    label: 'Bodenfeuchtigkeit',
    unit: '%',
    minValue: 0,
    maxValue: 100,
    icon: '💧',
    color: '#2196F3',
    optimalRange: [20, 80],
  },
  temperature: {
    label: 'Temperatur',
    unit: '°C',
    minValue: 0,
    maxValue: 50,
    icon: '🌡️',
    color: '#FF5722',
    optimalRange: [20, 28],
  },
  humidity: {
    label: 'Luftfeuchtigkeit',
    unit: '%',
    minValue: 0,
    maxValue: 100,
    icon: '💨',
    color: '#00BCD4',
    optimalRange: [40, 70],
  },
  ph: {
    label: 'pH-Wert',
    unit: 'pH',
    minValue: 0,
    maxValue: 14,
    icon: '⚗️',
    color: '#9C27B0',
    optimalRange: [5.5, 6.5],
  },
  ec: {
    label: 'EC (Leitfähigkeit)',
    unit: 'mS/cm',
    minValue: 0,
    maxValue: 5,
    icon: '⚡',
    color: '#FFC107',
    optimalRange: [1.2, 2.0],
  },
  light: {
    label: 'Lichtstärke',
    unit: 'lux',
    minValue: 0,
    maxValue: 100000,
    icon: '💡',
    color: '#FFEB3B',
    optimalRange: [15000, 50000],
  },
  water_level: {
    label: 'Wasserstand',
    unit: 'cm',
    minValue: 0,
    maxValue: 100,
    icon: '🌊',
    color: '#03A9F4',
    optimalRange: [30, 80],
  },
  co2: {
    label: 'CO₂',
    unit: 'ppm',
    minValue: 0,
    maxValue: 2000,
    icon: '🫧',
    color: '#607D8B',
    optimalRange: [800, 1500],
  },
  par: {
    label: 'PAR/PPFD',
    unit: 'µmol/m²/s',
    minValue: 0,
    maxValue: 2000,
    icon: '☀️',
    color: '#FF9800',
    optimalRange: [400, 800],
  },
  tds: {
    label: 'TDS (Gesamtsalze)',
    unit: 'ppm',
    minValue: 0,
    maxValue: 3000,
    icon: '🧪',
    color: '#795548',
    optimalRange: [500, 1500],
  },
  voc: {
    label: 'VOC (Luftqualität)',
    unit: 'ppb',
    minValue: 0,
    maxValue: 1000,
    icon: '🌬️',
    color: '#4CAF50',
    optimalRange: [0, 220],
  },
  pm25: {
    label: 'Feinstaub PM2.5',
    unit: 'µg/m³',
    minValue: 0,
    maxValue: 500,
    icon: '😷',
    color: '#E91E63',
    optimalRange: [0, 25],
  },
} as const;

export type SensorType = keyof typeof SENSOR_CONFIG;

export function getSensorConfig(type: SensorType) {
  return SENSOR_CONFIG[type];
}

export function getSensorLabel(type: SensorType): string {
  return SENSOR_CONFIG[type]?.label || type;
}

export function getSensorUnit(type: SensorType): string {
  return SENSOR_CONFIG[type]?.unit || '';
}

export function getSensorIcon(type: SensorType): string {
  return SENSOR_CONFIG[type]?.icon || '📊';
}

export function getSensorColor(type: SensorType): string {
  return SENSOR_CONFIG[type]?.color || '#9E9E9E';
}

export function isInOptimalRange(type: SensorType, value: number): boolean {
  const config = SENSOR_CONFIG[type];
  if (!config) return true;
  const [min, max] = config.optimalRange;
  return value >= min && value <= max;
}

export function getDefaultSensorValues(type: SensorType) {
  const config = SENSOR_CONFIG[type];
  return {
    minValue: config.minValue,
    maxValue: config.maxValue,
    unit: config.unit,
  };
}
