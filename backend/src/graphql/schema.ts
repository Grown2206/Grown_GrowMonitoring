import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar Date
  scalar JSON

  # ==================== USER & AUTH ====================

  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    isActive: Boolean!
    createdAt: Date!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # ==================== PLANT & STRAIN ====================

  type Plant {
    id: ID!
    name: String!
    strainId: Int
    phase: String!
    plantedDate: Date!
    harvestDate: Date
    notes: String
    sensorId: Int
    createdAt: Date!
    updatedAt: Date!
    strain: Strain
    sensor: Sensor
    harvests: [Harvest!]
  }

  type Strain {
    id: ID!
    name: String!
    type: String!
    thcContent: Float
    cbdContent: Float
    floweringWeeks: Int
    description: String
    createdAt: Date!
    updatedAt: Date!
  }

  # ==================== SENSOR & DEVICE ====================

  type Sensor {
    id: ID!
    deviceId: Int
    name: String!
    type: String!
    pin: String
    calibrationOffset: Float
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
    device: Device
    latestData: SensorData
  }

  type SensorData {
    id: ID!
    sensorId: Int!
    temperature: Float
    humidity: Float
    moisture: Float
    light: Float
    ph: Float
    ec: Float
    co2: Float
    par: Float
    tds: Float
    voc: Float
    pm25: Float
    timestamp: Date!
  }

  type Device {
    id: ID!
    name: String!
    type: String!
    ipAddress: String
    macAddress: String
    firmwareVersion: String
    status: String!
    lastSeen: Date
    createdAt: Date!
    updatedAt: Date!
    sensors: [Sensor!]
    relays: [Relay!]
  }

  # ==================== RELAY & IRRIGATION ====================

  type Relay {
    id: ID!
    relayId: Int!
    deviceId: Int
    name: String!
    type: String!
    status: Boolean!
    lastChanged: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type IrrigationLog {
    id: ID!
    plantId: Int!
    pumpId: Int!
    moistureLevel: Float!
    durationSeconds: Int!
    triggeredBy: String!
    timestamp: Date!
    plant: Plant
  }

  # ==================== AUTOMATION ====================

  type AutomationRule {
    id: ID!
    name: String!
    description: String
    triggerType: String!
    conditions: JSON
    actionType: String!
    actionConfig: JSON!
    enabled: Boolean!
    lastTriggered: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type Schedule {
    id: ID!
    name: String!
    type: String!
    targetId: Int!
    startTime: String!
    endTime: String
    duration: Int
    daysOfWeek: String
    enabled: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  # ==================== ANALYTICS ====================

  type Harvest {
    id: ID!
    plantId: Int!
    harvestDate: Date!
    wetWeight: Float
    dryWeight: Float
    quality: String
    notes: String
    createdAt: Date!
    updatedAt: Date!
    plant: Plant
  }

  type Alert {
    id: ID!
    type: String!
    severity: String!
    title: String!
    message: String!
    config: JSON
    enabled: Boolean!
    warningThreshold: Float
    criticalThreshold: Float
    escalationMinutes: Int
    createdAt: Date!
    updatedAt: Date!
  }

  type Note {
    id: ID!
    plantId: Int
    category: String!
    title: String!
    content: String!
    importance: Int
    createdAt: Date!
    updatedAt: Date!
    plant: Plant
  }

  type CalendarEvent {
    id: ID!
    plantId: Int
    title: String!
    description: String
    eventDate: Date!
    eventType: String!
    completed: Boolean!
    createdAt: Date!
    updatedAt: Date!
    plant: Plant
  }

  # ==================== QUERIES ====================

  type Query {
    # User & Auth
    me: User

    # Plants
    plants(phase: String): [Plant!]!
    plant(id: ID!): Plant

    # Strains
    strains: [Strain!]!
    strain(id: ID!): Strain

    # Sensors
    sensors(type: String, isActive: Boolean): [Sensor!]!
    sensor(id: ID!): Sensor
    sensorData(sensorId: ID!, limit: Int, hours: Int): [SensorData!]!
    latestSensorData(sensorId: ID!): SensorData

    # Devices
    devices(status: String): [Device!]!
    device(id: ID!): Device

    # Relays
    relays: [Relay!]!
    relay(id: ID!): Relay

    # Irrigation
    irrigationLogs(plantId: ID, limit: Int): [IrrigationLog!]!

    # Automation
    automationRules(enabled: Boolean): [AutomationRule!]!
    automationRule(id: ID!): AutomationRule

    # Schedules
    schedules(enabled: Boolean, type: String): [Schedule!]!
    schedule(id: ID!): Schedule

    # Analytics
    harvests(plantId: ID): [Harvest!]!
    harvest(id: ID!): Harvest

    # Alerts
    alerts(enabled: Boolean): [Alert!]!
    alert(id: ID!): Alert

    # Notes & Calendar Events
    notes(plantId: ID, category: String): [Note!]!
    note(id: ID!): Note
    calendarEvents(plantId: ID, eventType: String): [CalendarEvent!]!
    calendarEvent(id: ID!): CalendarEvent
  }

  # ==================== MUTATIONS ====================

  type Mutation {
    # Auth
    login(username: String!, password: String!): AuthPayload!
    register(username: String!, email: String!, password: String!): AuthPayload!

    # Plants
    createPlant(name: String!, strainId: Int, phase: String!, plantedDate: Date!, sensorId: Int): Plant!
    updatePlant(id: ID!, name: String, phase: String, harvestDate: Date, notes: String, sensorId: Int): Plant!
    deletePlant(id: ID!): Boolean!

    # Strains
    createStrain(name: String!, type: String!, thcContent: Float, cbdContent: Float, floweringWeeks: Int, description: String): Strain!
    updateStrain(id: ID!, name: String, type: String, thcContent: Float, cbdContent: Float, floweringWeeks: Int, description: String): Strain!
    deleteStrain(id: ID!): Boolean!

    # Sensors
    createSensor(deviceId: Int, name: String!, type: String!, pin: String, calibrationOffset: Float): Sensor!
    updateSensor(id: ID!, name: String, type: String, pin: String, calibrationOffset: Float, isActive: Boolean): Sensor!
    deleteSensor(id: ID!): Boolean!

    # Devices
    createDevice(name: String!, type: String!, ipAddress: String, macAddress: String, firmwareVersion: String): Device!
    updateDevice(id: ID!, name: String, type: String, ipAddress: String, status: String): Device!
    deleteDevice(id: ID!): Boolean!

    # Relays
    createRelay(deviceId: Int, relayId: Int!, name: String!, type: String!): Relay!
    updateRelay(id: ID!, name: String, relayId: Int, type: String, status: Boolean): Relay!
    deleteRelay(id: ID!): Boolean!
    toggleRelay(id: ID!): Relay!

    # Irrigation
    createIrrigationLog(plantId: Int!, pumpId: Int!, moistureLevel: Float!, durationSeconds: Int!, triggeredBy: String!): IrrigationLog!

    # Automation
    createAutomationRule(name: String!, description: String, triggerType: String!, conditions: JSON, actionType: String!, actionConfig: JSON!, enabled: Boolean): AutomationRule!
    updateAutomationRule(id: ID!, name: String, description: String, enabled: Boolean, conditions: JSON, actionConfig: JSON): AutomationRule!
    deleteAutomationRule(id: ID!): Boolean!
    triggerAutomationRule(id: ID!): Boolean!

    # Schedules
    createSchedule(name: String!, type: String!, targetId: Int!, startTime: String!, endTime: String, duration: Int, daysOfWeek: String, enabled: Boolean): Schedule!
    updateSchedule(id: ID!, name: String, enabled: Boolean, startTime: String, endTime: String): Schedule!
    deleteSchedule(id: ID!): Boolean!

    # Harvests
    createHarvest(plantId: Int!, harvestDate: Date!, wetWeight: Float, dryWeight: Float, quality: String, notes: String): Harvest!
    updateHarvest(id: ID!, wetWeight: Float, dryWeight: Float, quality: String, notes: String): Harvest!
    deleteHarvest(id: ID!): Boolean!

    # Alerts
    createAlert(type: String!, severity: String!, title: String!, message: String!, config: JSON, enabled: Boolean, warningThreshold: Float, criticalThreshold: Float): Alert!
    updateAlert(id: ID!, title: String, message: String, enabled: Boolean, config: JSON): Alert!
    deleteAlert(id: ID!): Boolean!

    # Notes
    createNote(plantId: Int, category: String!, title: String!, content: String!, importance: Int): Note!
    updateNote(id: ID!, title: String, content: String, importance: Int): Note!
    deleteNote(id: ID!): Boolean!

    # Calendar Events
    createCalendarEvent(plantId: Int, title: String!, description: String, eventDate: Date!, eventType: String!, completed: Boolean): CalendarEvent!
    updateCalendarEvent(id: ID!, title: String, description: String, eventDate: Date, eventType: String, completed: Boolean): CalendarEvent!
    deleteCalendarEvent(id: ID!): Boolean!
  }
`;
