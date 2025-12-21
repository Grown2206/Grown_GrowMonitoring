import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { SensorData } from '../models/SensorData';
import { Relay } from '../models/Relay';
import { alertService } from '../services/AlertService';
import { irrigationService } from '../services/IrrigationService';

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private esp32Client: WebSocket | null = null;

  init(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log('✓ WebSocket client connected:', req.socket.remoteAddress);
      this.clients.add(ws);

      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        console.log('✓ WebSocket client disconnected');
        this.clients.delete(ws);
        if (ws === this.esp32Client) {
          this.esp32Client = null;
          console.log('ESP32 disconnected');
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({ type: 'connected', message: 'Connected to Grow Monitoring System' }));
    });

    console.log('✓ WebSocket server initialized');
  }

  private async handleMessage(ws: WebSocket, message: any) {
    const { type, data } = message;

    switch (type) {
      case 'esp32_identify':
        this.esp32Client = ws;
        console.log('✓ ESP32 client identified');
        ws.send(JSON.stringify({ type: 'identified', role: 'esp32' }));
        break;

      case 'sensor_data':
        await this.handleSensorData(data);
        break;

      case 'relay_status':
        await this.handleRelayStatus(data);
        break;

      case 'get_current_data':
        await this.sendCurrentData(ws);
        break;

      case 'control_relay':
        this.sendToESP32({ type: 'relay_control', data });
        break;

      case 'control_pump':
        this.sendToESP32({ type: 'pump_control', data });
        break;

      default:
        console.log('Unknown message type:', type);
    }
  }

  private async handleSensorData(data: any) {
    try {
      const { sensorId, moistureLevel, tankLevel, nutrientLevel, temperature, humidity } = data;

      // Store sensor data
      const sensorData = await SensorData.create({
        sensorId,
        moistureLevel,
        tankLevel,
        nutrientLevel,
        temperature,
        humidity,
        timestamp: new Date(),
      });

      // Check alerts
      await alertService.checkAndTriggerAlerts(data);

      // Check automatic irrigation
      if (moistureLevel !== undefined) {
        await irrigationService.checkAutomaticIrrigation(sensorId, moistureLevel);
      }

      // Broadcast to all clients
      this.broadcast({
        type: 'sensor_update',
        data: sensorData,
      });
    } catch (error) {
      console.error('Error handling sensor data:', error);
    }
  }

  private async handleRelayStatus(data: any) {
    try {
      const { relayId, status } = data;

      const relay = await Relay.findOne({ where: { relayId } });
      if (relay) {
        await relay.update({ status, lastChanged: new Date() });

        this.broadcast({
          type: 'relay_update',
          data: { relayId, status },
        });
      }
    } catch (error) {
      console.error('Error handling relay status:', error);
    }
  }

  private async sendCurrentData(ws: WebSocket) {
    try {
      // Get latest sensor data for each sensor
      const latestData = await SensorData.findAll({
        attributes: [
          'sensorId',
          [SensorData.sequelize!.fn('MAX', SensorData.sequelize!.col('timestamp')), 'latestTimestamp'],
        ],
        group: ['sensorId'],
      });

      const sensorIds = latestData.map((d: any) => d.sensorId);
      const currentSensorData = await SensorData.findAll({
        where: {
          sensorId: sensorIds,
        },
        order: [['timestamp', 'DESC']],
        limit: sensorIds.length,
      });

      // Get relay statuses
      const relays = await Relay.findAll();

      ws.send(
        JSON.stringify({
          type: 'current_data',
          data: {
            sensors: currentSensorData,
            relays,
          },
        })
      );
    } catch (error) {
      console.error('Error sending current data:', error);
    }
  }

  broadcast(message: any) {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  sendToESP32(message: any) {
    if (this.esp32Client && this.esp32Client.readyState === WebSocket.OPEN) {
      this.esp32Client.send(JSON.stringify(message));
      return true;
    }
    console.warn('ESP32 client not connected');
    return false;
  }
}

export const wsManager = new WebSocketManager();
