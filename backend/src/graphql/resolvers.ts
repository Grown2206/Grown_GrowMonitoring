import { GraphQLError } from 'graphql';
import { GraphQLScalarType, Kind } from 'graphql';
import { User } from '../models/User';
import { Plant } from '../models/Plant';
import { Strain } from '../models/Strain';
import { Sensor } from '../models/Sensor';
import { SensorData } from '../models/SensorData';
import { Device } from '../models/Device';
import { Relay } from '../models/Relay';
import { IrrigationLog } from '../models/IrrigationLog';
import { AutomationRule } from '../models/AutomationRule';
import { Schedule } from '../models/Schedule';
import { Harvest } from '../models/Harvest';
import { Alert } from '../models/Alert';
import { Note } from '../models/Note';
import { CalendarEvent } from '../models/CalendarEvent';
import { generateToken } from '../middleware/auth';
import { Op } from 'sequelize';

// Custom Date scalar
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Custom JSON scalar
const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      return ast;
    }
    return null;
  },
});

// Auth helper
const requireAuth = (context: any) => {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
};

export const resolvers = {
  Date: dateScalar,
  JSON: jsonScalar,

  // ==================== FIELD RESOLVERS ====================

  Plant: {
    strain: async (parent: any) => {
      if (parent.strainId) {
        return await Strain.findByPk(parent.strainId);
      }
      return null;
    },
    sensor: async (parent: any) => {
      if (parent.sensorId) {
        return await Sensor.findByPk(parent.sensorId);
      }
      return null;
    },
    harvests: async (parent: any) => {
      return await Harvest.findAll({ where: { plantId: parent.id } });
    },
  },

  Sensor: {
    device: async (parent: any) => {
      if (parent.deviceId) {
        return await Device.findByPk(parent.deviceId);
      }
      return null;
    },
    latestData: async (parent: any) => {
      return await SensorData.findOne({
        where: { sensorId: parent.id },
        order: [['timestamp', 'DESC']],
      });
    },
  },

  Device: {
    sensors: async (parent: any) => {
      return await Sensor.findAll({ where: { deviceId: parent.id } });
    },
    relays: async (parent: any) => {
      return await Relay.findAll({ where: { deviceId: parent.id } });
    },
  },

  IrrigationLog: {
    plant: async (parent: any) => {
      return await Plant.findByPk(parent.plantId);
    },
  },

  Harvest: {
    plant: async (parent: any) => {
      return await Plant.findByPk(parent.plantId);
    },
  },

  Note: {
    plant: async (parent: any) => {
      if (parent.plantId) {
        return await Plant.findByPk(parent.plantId);
      }
      return null;
    },
  },

  CalendarEvent: {
    plant: async (parent: any) => {
      if (parent.plantId) {
        return await Plant.findByPk(parent.plantId);
      }
      return null;
    },
  },

  // ==================== QUERIES ====================

  Query: {
    // User & Auth
    me: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return await User.findByPk(user.id, {
        attributes: ['id', 'username', 'email', 'role', 'isActive', 'createdAt'],
      });
    },

    // Plants
    plants: async (_: any, { phase }: any, context: any) => {
      requireAuth(context);
      const where: any = {};
      if (phase) where.phase = phase;
      return await Plant.findAll({ where, order: [['createdAt', 'DESC']] });
    },
    plant: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      return await Plant.findByPk(id);
    },

    // Strains
    strains: async (_: any, __: any, context: any) => {
      requireAuth(context);
      return await Strain.findAll({ order: [['name', 'ASC']] });
    },
    strain: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      return await Strain.findByPk(id);
    },

    // Sensors
    sensors: async (_: any, { type, isActive }: any, context: any) => {
      requireAuth(context);
      const where: any = {};
      if (type) where.type = type;
      if (isActive !== undefined) where.isActive = isActive;
      return await Sensor.findAll({ where, order: [['name', 'ASC']] });
    },
    sensor: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      return await Sensor.findByPk(id);
    },
    sensorData: async (_: any, { sensorId, limit = 100, hours }: any, context: any) => {
      requireAuth(context);
      const where: any = { sensorId };
      if (hours) {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        where.timestamp = { [Op.gte]: since };
      }
      return await SensorData.findAll({
        where,
        order: [['timestamp', 'DESC']],
        limit,
      });
    },
    latestSensorData: async (_: any, { sensorId }: any, context: any) => {
      requireAuth(context);
      return await SensorData.findOne({
        where: { sensorId },
        order: [['timestamp', 'DESC']],
      });
    },

    // Devices
    devices: async (_: any, { status }: any, context: any) => {
      requireAuth(context);
      const where: any = {};
      if (status) where.status = status;
      return await Device.findAll({ where, order: [['name', 'ASC']] });
    },
    device: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      return await Device.findByPk(id);
    },

    // Relays
    relays: async (_: any, __: any, context: any) => {
      requireAuth(context);
      return await Relay.findAll({ order: [['name', 'ASC']] });
    },
    relay: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      return await Relay.findByPk(id);
    },

    // Irrigation
    irrigationLogs: async (_: any, { plantId, limit = 50 }: any, context: any) => {
      requireAuth(context);
      const where: any = {};
      if (plantId) where.plantId = plantId;
      return await IrrigationLog.findAll({
        where,
        order: [['timestamp', 'DESC']],
        limit,
      });
    },

    // Automation
    automationRules: async (_: any, { enabled }: any, context: any) => {
      requireAuth(context);
      const where: any = {};
      if (enabled !== undefined) where.enabled = enabled;
      return await AutomationRule.findAll({ where, order: [['createdAt', 'DESC']] });
    },
    automationRule: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      return await AutomationRule.findByPk(id);
    },

    // Schedules
    schedules: async (_: any, { enabled, type }: any, context: any) => {
      requireAuth(context);
      const where: any = {};
      if (enabled !== undefined) where.enabled = enabled;
      if (type) where.type = type;
      return await Schedule.findAll({ where, order: [['startTime', 'ASC']] });
    },
    schedule: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      return await Schedule.findByPk(id);
    },

    // Harvests
    harvests: async (_: any, { plantId }: any, context: any) => {
      requireAuth(context);
      const where: any = {};
      if (plantId) where.plantId = plantId;
      return await Harvest.findAll({ where, order: [['harvestDate', 'DESC']] });
    },
    harvest: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      return await Harvest.findByPk(id);
    },

    // Alerts
    alerts: async (_: any, { enabled }: any, context: any) => {
      requireAuth(context);
      const where: any = {};
      if (enabled !== undefined) where.enabled = enabled;
      return await Alert.findAll({ where, order: [['createdAt', 'DESC']] });
    },
    alert: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      return await Alert.findByPk(id);
    },

    // Notes & Events
    notes: async (_: any, { plantId, category }: any, context: any) => {
      requireAuth(context);
      const where: any = {};
      if (plantId) where.plantId = plantId;
      if (category) where.category = category;
      return await Note.findAll({ where, order: [['createdAt', 'DESC']] });
    },
    note: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      return await Note.findByPk(id);
    },
    calendarEvents: async (_: any, { plantId, eventType }: any, context: any) => {
      requireAuth(context);
      const where: any = {};
      if (plantId) where.plantId = plantId;
      if (eventType) where.eventType = eventType;
      return await CalendarEvent.findAll({ where, order: [['eventDate', 'DESC']] });
    },
    calendarEvent: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      return await CalendarEvent.findByPk(id);
    },
  },

  // ==================== MUTATIONS ====================

  Mutation: {
    // Auth
    login: async (_: any, { username, password }: any) => {
      const user = await User.findOne({ where: { username } });
      if (!user || !user.isActive) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const token = generateToken(user.id);
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      };
    },

    register: async (_: any, { username, email, password }: any) => {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        throw new GraphQLError('Username already exists', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        throw new GraphQLError('Email already exists', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const user = await User.create({
        username,
        email,
        password,
        role: 'user',
      });

      const token = generateToken(user.id);
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      };
    },

    // Plants
    createPlant: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await Plant.create(args);
    },
    updatePlant: async (_: any, { id, ...updates }: any, context: any) => {
      requireAuth(context);
      const plant = await Plant.findByPk(id);
      if (!plant) {
        throw new GraphQLError('Plant not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await plant.update(updates);
      return plant;
    },
    deletePlant: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const plant = await Plant.findByPk(id);
      if (!plant) {
        throw new GraphQLError('Plant not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await plant.destroy();
      return true;
    },

    // Strains
    createStrain: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await Strain.create(args);
    },
    updateStrain: async (_: any, { id, ...updates }: any, context: any) => {
      requireAuth(context);
      const strain = await Strain.findByPk(id);
      if (!strain) {
        throw new GraphQLError('Strain not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await strain.update(updates);
      return strain;
    },
    deleteStrain: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const strain = await Strain.findByPk(id);
      if (!strain) {
        throw new GraphQLError('Strain not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await strain.destroy();
      return true;
    },

    // Sensors
    createSensor: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await Sensor.create(args);
    },
    updateSensor: async (_: any, { id, ...updates }: any, context: any) => {
      requireAuth(context);
      const sensor = await Sensor.findByPk(id);
      if (!sensor) {
        throw new GraphQLError('Sensor not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await sensor.update(updates);
      return sensor;
    },
    deleteSensor: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const sensor = await Sensor.findByPk(id);
      if (!sensor) {
        throw new GraphQLError('Sensor not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await sensor.destroy();
      return true;
    },

    // Devices
    createDevice: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await Device.create(args);
    },
    updateDevice: async (_: any, { id, ...updates }: any, context: any) => {
      requireAuth(context);
      const device = await Device.findByPk(id);
      if (!device) {
        throw new GraphQLError('Device not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await device.update(updates);
      return device;
    },
    deleteDevice: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const device = await Device.findByPk(id);
      if (!device) {
        throw new GraphQLError('Device not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await device.destroy();
      return true;
    },

    // Relays
    createRelay: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await Relay.create(args);
    },
    updateRelay: async (_: any, { id, ...updates }: any, context: any) => {
      requireAuth(context);
      const relay = await Relay.findByPk(id);
      if (!relay) {
        throw new GraphQLError('Relay not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await relay.update(updates);
      return relay;
    },
    deleteRelay: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const relay = await Relay.findByPk(id);
      if (!relay) {
        throw new GraphQLError('Relay not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await relay.destroy();
      return true;
    },
    toggleRelay: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const relay = await Relay.findByPk(id);
      if (!relay) {
        throw new GraphQLError('Relay not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await relay.update({ status: !relay.status });
      return relay;
    },

    // Irrigation
    createIrrigationLog: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await IrrigationLog.create({
        ...args,
        timestamp: new Date(),
      });
    },

    // Automation
    createAutomationRule: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await AutomationRule.create(args);
    },
    updateAutomationRule: async (_: any, { id, ...updates }: any, context: any) => {
      requireAuth(context);
      const rule = await AutomationRule.findByPk(id);
      if (!rule) {
        throw new GraphQLError('Automation rule not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await rule.update(updates);
      return rule;
    },
    deleteAutomationRule: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const rule = await AutomationRule.findByPk(id);
      if (!rule) {
        throw new GraphQLError('Automation rule not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await rule.destroy();
      return true;
    },
    triggerAutomationRule: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const rule = await AutomationRule.findByPk(id);
      if (!rule) {
        throw new GraphQLError('Automation rule not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      if (!rule.enabled) {
        throw new GraphQLError('Automation rule is disabled', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      // Trigger automation logic here
      await rule.update({ lastTriggered: new Date() });
      return true;
    },

    // Schedules
    createSchedule: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await Schedule.create(args);
    },
    updateSchedule: async (_: any, { id, ...updates }: any, context: any) => {
      requireAuth(context);
      const schedule = await Schedule.findByPk(id);
      if (!schedule) {
        throw new GraphQLError('Schedule not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await schedule.update(updates);
      return schedule;
    },
    deleteSchedule: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const schedule = await Schedule.findByPk(id);
      if (!schedule) {
        throw new GraphQLError('Schedule not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await schedule.destroy();
      return true;
    },

    // Harvests
    createHarvest: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await Harvest.create(args);
    },
    updateHarvest: async (_: any, { id, ...updates }: any, context: any) => {
      requireAuth(context);
      const harvest = await Harvest.findByPk(id);
      if (!harvest) {
        throw new GraphQLError('Harvest not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await harvest.update(updates);
      return harvest;
    },
    deleteHarvest: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const harvest = await Harvest.findByPk(id);
      if (!harvest) {
        throw new GraphQLError('Harvest not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await harvest.destroy();
      return true;
    },

    // Alerts
    createAlert: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await Alert.create(args);
    },
    updateAlert: async (_: any, { id, ...updates }: any, context: any) => {
      requireAuth(context);
      const alert = await Alert.findByPk(id);
      if (!alert) {
        throw new GraphQLError('Alert not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await alert.update(updates);
      return alert;
    },
    deleteAlert: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const alert = await Alert.findByPk(id);
      if (!alert) {
        throw new GraphQLError('Alert not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await alert.destroy();
      return true;
    },

    // Notes
    createNote: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await Note.create(args);
    },
    updateNote: async (_: any, { id, ...updates }: any, context: any) => {
      requireAuth(context);
      const note = await Note.findByPk(id);
      if (!note) {
        throw new GraphQLError('Note not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await note.update(updates);
      return note;
    },
    deleteNote: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const note = await Note.findByPk(id);
      if (!note) {
        throw new GraphQLError('Note not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await note.destroy();
      return true;
    },

    // Calendar Events
    createCalendarEvent: async (_: any, args: any, context: any) => {
      requireAuth(context);
      return await CalendarEvent.create(args);
    },
    updateCalendarEvent: async (_: any, { id, ...updates }: any, context: any) => {
      requireAuth(context);
      const event = await CalendarEvent.findByPk(id);
      if (!event) {
        throw new GraphQLError('Calendar event not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await event.update(updates);
      return event;
    },
    deleteCalendarEvent: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const event = await CalendarEvent.findByPk(id);
      if (!event) {
        throw new GraphQLError('Calendar event not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await event.destroy();
      return true;
    },
  },
};
