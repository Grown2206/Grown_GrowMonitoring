import mqtt, { MqttClient } from 'mqtt';
import { Settings } from '../models/Settings';
import { SensorData, Relay, Plant, Alert } from '../models';

interface MQTTSettings {
  enabled: boolean;
  brokerUrl: string;
  username: string;
  password: string;
  baseTopic: string;
  homeAssistantDiscovery: boolean;
  discoveryPrefix: string;
}

interface HomeAssistantDevice {
  identifiers: string[];
  name: string;
  model: string;
  manufacturer: string;
  sw_version: string;
}

interface HomeAssistantDiscoveryConfig {
  name: string;
  unique_id: string;
  state_topic: string;
  command_topic?: string;
  device: HomeAssistantDevice;
  unit_of_measurement?: string;
  device_class?: string;
  state_class?: string;
  icon?: string;
  value_template?: string;
  payload_on?: string;
  payload_off?: string;
  optimistic?: boolean;
}

class MQTTService {
  private client: MqttClient | null = null;
  private enabled: boolean = false;
  private settings: MQTTSettings = {
    enabled: false,
    brokerUrl: 'mqtt://localhost:1883',
    username: '',
    password: '',
    baseTopic: 'grow_monitoring',
    homeAssistantDiscovery: true,
    discoveryPrefix: 'homeassistant',
  };
  private reconnectInterval: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;
  private publishedEntities: Set<string> = new Set();

  async initialize(): Promise<void> {
    try {
      const settingsRecord = await Settings.findOne({ where: { key: 'mqtt_settings' } });
      if (settingsRecord) {
        this.settings = { ...this.settings, ...(settingsRecord.value as object) };
        this.enabled = this.settings.enabled;
      }

      if (this.enabled) {
        await this.connect();
      }

      console.log(`MQTT Service initialized (${this.enabled ? 'enabled' : 'disabled'})`);
    } catch (error) {
      console.error('Failed to initialize MQTT service:', error);
    }
  }

  private async connect(): Promise<void> {
    if (this.isConnecting || this.client?.connected) {
      return;
    }

    this.isConnecting = true;

    try {
      const options: mqtt.IClientOptions = {
        clientId: `grow_monitoring_${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
        reconnectPeriod: 5000,
      };

      if (this.settings.username && this.settings.password) {
        options.username = this.settings.username;
        options.password = this.settings.password;
      }

      this.client = mqtt.connect(this.settings.brokerUrl, options);

      this.client.on('connect', () => {
        console.log('✓ MQTT connected to broker');
        this.isConnecting = false;
        this.setupSubscriptions();
        if (this.settings.homeAssistantDiscovery) {
          this.publishAllDiscoveryConfigs();
        }
      });

      this.client.on('error', (error) => {
        console.error('MQTT connection error:', error);
        this.isConnecting = false;
      });

      this.client.on('offline', () => {
        console.log('MQTT client offline');
      });

      this.client.on('reconnect', () => {
        console.log('MQTT attempting to reconnect...');
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });
    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error);
      this.isConnecting = false;
    }
  }

  private setupSubscriptions(): void {
    if (!this.client?.connected) return;

    // Subscribe to relay commands
    const relayCommandTopic = `${this.settings.baseTopic}/relay/+/set`;
    this.client.subscribe(relayCommandTopic, (error) => {
      if (error) {
        console.error('Failed to subscribe to relay commands:', error);
      } else {
        console.log(`✓ Subscribed to ${relayCommandTopic}`);
      }
    });
  }

  private async handleMessage(topic: string, message: Buffer): Promise<void> {
    try {
      const payload = message.toString();

      // Handle relay commands: grow_monitoring/relay/{id}/set
      const relayMatch = topic.match(new RegExp(`${this.settings.baseTopic}/relay/(\\d+)/set`));
      if (relayMatch) {
        const relayId = parseInt(relayMatch[1]);
        const state = payload.toLowerCase() === 'on';
        await this.handleRelayCommand(relayId, state);
      }
    } catch (error) {
      console.error('Error handling MQTT message:', error);
    }
  }

  private async handleRelayCommand(relayId: number, state: boolean): Promise<void> {
    try {
      const relay = await Relay.findOne({ where: { relayId } });
      if (relay) {
        relay.status = state;
        await relay.save();
        console.log(`✓ Relay ${relayId} set to ${state ? 'ON' : 'OFF'} via MQTT`);

        // Publish state update
        this.publishRelayState(relay);
      }
    } catch (error) {
      console.error(`Failed to handle relay command for relay ${relayId}:`, error);
    }
  }

  // Home Assistant Discovery
  private async publishAllDiscoveryConfigs(): Promise<void> {
    if (!this.settings.homeAssistantDiscovery || !this.client?.connected) {
      return;
    }

    try {
      // Publish sensor discovery configs for all standard sensor types
      const standardSensorTypes = [
        'temperature',
        'humidity',
        'soil_moisture',
        'light',
        'ph',
        'ec',
        'co2',
        'par',
      ];

      standardSensorTypes.forEach((sensorType) => {
        this.publishSensorDiscovery(sensorType);
      });

      // Publish relay discovery configs
      const relays = await Relay.findAll();
      relays.forEach((relay) => {
        this.publishRelayDiscovery(relay);
      });

      console.log('✓ Published all Home Assistant discovery configs');
    } catch (error) {
      console.error('Failed to publish discovery configs:', error);
    }
  }

  private publishSensorDiscovery(sensorType: string): void {
    if (!this.client?.connected) return;

    const device: HomeAssistantDevice = {
      identifiers: ['grow_monitoring_system'],
      name: 'Grow Monitoring System',
      model: 'v1.1.0',
      manufacturer: 'Grown',
      sw_version: '1.1.0',
    };

    const sensorConfig = this.getSensorConfig(sensorType);
    const uniqueId = `grow_monitoring_${sensorType}`;

    const config: HomeAssistantDiscoveryConfig = {
      name: `Grow ${sensorConfig.name}`,
      unique_id: uniqueId,
      state_topic: `${this.settings.baseTopic}/sensor/${sensorType}`,
      device,
      unit_of_measurement: sensorConfig.unit,
      device_class: sensorConfig.deviceClass,
      state_class: 'measurement',
      icon: sensorConfig.icon,
      value_template: '{{ value_json.value }}',
    };

    const discoveryTopic = `${this.settings.discoveryPrefix}/sensor/${uniqueId}/config`;
    this.client.publish(discoveryTopic, JSON.stringify(config), { retain: true });
    this.publishedEntities.add(uniqueId);
  }

  private publishRelayDiscovery(relay: Relay): void {
    if (!this.client?.connected) return;

    const device: HomeAssistantDevice = {
      identifiers: ['grow_monitoring_system'],
      name: 'Grow Monitoring System',
      model: 'v1.1.0',
      manufacturer: 'Grown',
      sw_version: '1.1.0',
    };

    const uniqueId = `grow_monitoring_relay_${relay.relayId}`;

    const config: HomeAssistantDiscoveryConfig = {
      name: `Grow Relay ${relay.name}`,
      unique_id: uniqueId,
      state_topic: `${this.settings.baseTopic}/relay/${relay.relayId}/state`,
      command_topic: `${this.settings.baseTopic}/relay/${relay.relayId}/set`,
      device,
      payload_on: 'ON',
      payload_off: 'OFF',
      optimistic: false,
      icon: this.getRelayIcon(relay.type),
    };

    const discoveryTopic = `${this.settings.discoveryPrefix}/switch/${uniqueId}/config`;
    this.client.publish(discoveryTopic, JSON.stringify(config), { retain: true });
    this.publishedEntities.add(uniqueId);

    // Publish initial state
    this.publishRelayState(relay);
  }

  private getSensorConfig(sensorType: string): { name: string; unit: string; deviceClass?: string; icon: string } {
    const configs: Record<string, { name: string; unit: string; deviceClass?: string; icon: string }> = {
      temperature: { name: 'Temperature', unit: '°C', deviceClass: 'temperature', icon: 'mdi:thermometer' },
      humidity: { name: 'Humidity', unit: '%', deviceClass: 'humidity', icon: 'mdi:water-percent' },
      soil_moisture: { name: 'Soil Moisture', unit: '%', deviceClass: 'moisture', icon: 'mdi:water' },
      light: { name: 'Light Level', unit: 'lux', deviceClass: 'illuminance', icon: 'mdi:lightbulb' },
      ph: { name: 'pH Level', unit: 'pH', icon: 'mdi:flask' },
      ec: { name: 'EC Level', unit: 'mS/cm', icon: 'mdi:flash' },
      co2: { name: 'CO2 Level', unit: 'ppm', deviceClass: 'carbon_dioxide', icon: 'mdi:molecule-co2' },
      vpd: { name: 'VPD', unit: 'kPa', icon: 'mdi:air-filter' },
    };

    return configs[sensorType] || { name: sensorType, unit: '', icon: 'mdi:gauge' };
  }

  private getRelayIcon(type: string): string {
    const icons: Record<string, string> = {
      light: 'mdi:lightbulb',
      fan: 'mdi:fan',
      pump: 'mdi:water-pump',
      heater: 'mdi:radiator',
      humidifier: 'mdi:air-humidifier',
      dehumidifier: 'mdi:air-humidifier-off',
    };
    return icons[type] || 'mdi:toggle-switch';
  }

  // Publish sensor data
  async publishSensorData(data: {
    type: string;
    value: number;
    unit: string;
    timestamp: Date;
    sensorId: number;
  }): Promise<void> {
    if (!this.enabled || !this.client?.connected) {
      return;
    }

    try {
      const topic = `${this.settings.baseTopic}/sensor/${data.type}`;
      const payload = {
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp,
        sensorId: data.sensorId,
      };

      this.client.publish(topic, JSON.stringify(payload), { retain: false });
    } catch (error) {
      console.error('Failed to publish sensor data:', error);
    }
  }

  // Publish relay state
  async publishRelayState(relay: Relay): Promise<void> {
    if (!this.enabled || !this.client?.connected) {
      return;
    }

    try {
      const topic = `${this.settings.baseTopic}/relay/${relay.relayId}/state`;
      const payload = relay.status ? 'ON' : 'OFF';

      this.client.publish(topic, payload, { retain: true });
    } catch (error) {
      console.error('Failed to publish relay state:', error);
    }
  }

  // Publish alert
  async publishAlert(alert: Alert, payload: any): Promise<void> {
    if (!this.enabled || !this.client?.connected) {
      return;
    }

    try {
      const topic = `${this.settings.baseTopic}/alert/${alert.id}`;
      const message = {
        id: alert.id,
        name: alert.name,
        type: alert.type,
        severity: payload.severity || 'info',
        message: payload.message,
        timestamp: new Date().toISOString(),
      };

      this.client.publish(topic, JSON.stringify(message), { retain: false });
    } catch (error) {
      console.error('Failed to publish alert:', error);
    }
  }

  // Update settings
  async updateSettings(newSettings: Partial<MQTTSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };

    await Settings.upsert({
      key: 'mqtt_settings',
      value: this.settings as any,
    });

    const wasEnabled = this.enabled;
    this.enabled = this.settings.enabled;

    if (this.enabled && !wasEnabled) {
      await this.connect();
    } else if (!this.enabled && wasEnabled) {
      this.disconnect();
    } else if (this.enabled && wasEnabled) {
      // Reconnect with new settings
      this.disconnect();
      await this.connect();
    }
  }

  // Disconnect
  disconnect(): void {
    if (this.client) {
      this.client.end(true);
      this.client = null;
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    console.log('MQTT client disconnected');
  }

  // Get status
  getStatus(): {
    enabled: boolean;
    connected: boolean;
    brokerUrl: string;
    publishedEntities: number;
    homeAssistantDiscovery: boolean;
  } {
    return {
      enabled: this.enabled,
      connected: this.client?.connected || false,
      brokerUrl: this.settings.brokerUrl,
      publishedEntities: this.publishedEntities.size,
      homeAssistantDiscovery: this.settings.homeAssistantDiscovery,
    };
  }

  // Get settings
  getSettings(): MQTTSettings {
    return { ...this.settings, password: this.settings.password ? '***' : '' };
  }
}

export const mqttService = new MQTTService();
