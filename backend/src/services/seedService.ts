import { Plant, Strain, SensorData, Harvest, Note, CalendarEvent, Alert, Device, Sensor as SensorModel } from '../models';
import { Op } from 'sequelize';

export class SeedService {
  /**
   * Generate complete test data for development
   */
  static async generateTestData(options: {
    strains?: number;
    plants?: number;
    completedGrows?: number;
    daysOfHistory?: number;
    clearExisting?: boolean;
  } = {}): Promise<{
    strains: number;
    plants: number;
    sensorData: number;
    harvests: number;
    events: number;
    notes: number;
    devices: number;
  }> {
    const {
      strains = 3,
      plants = 5,
      completedGrows = 3,
      daysOfHistory = 90,
      clearExisting = false,
    } = options;

    if (clearExisting) {
      await this.clearTestData();
    }

    const stats = {
      strains: 0,
      plants: 0,
      sensorData: 0,
      harvests: 0,
      events: 0,
      notes: 0,
      devices: 0,
    };

    // Create devices first
    const devices = await this.createDevices(2);
    stats.devices = devices.length;

    // Create strains
    const createdStrains = await this.createStrains(strains);
    stats.strains = createdStrains.length;

    // Create completed grows with full history
    for (let i = 0; i < completedGrows; i++) {
      const strain = createdStrains[i % createdStrains.length];
      const device = devices[i % devices.length];
      const result = await this.createCompletedGrow(strain, device, daysOfHistory);
      stats.plants++;
      stats.sensorData += result.sensorDataCount;
      stats.harvests += result.harvestCount;
      stats.events += result.eventCount;
      stats.notes += result.noteCount;
    }

    // Create active plants
    for (let i = 0; i < plants; i++) {
      const strain = createdStrains[i % createdStrains.length];
      const device = devices[i % devices.length];
      const result = await this.createActivePlant(strain, device);
      stats.plants++;
      stats.sensorData += result.sensorDataCount;
      stats.events += result.eventCount;
      stats.notes += result.noteCount;
    }

    return stats;
  }

  /**
   * Clear existing test data
   */
  static async clearTestData(): Promise<void> {
    await SensorData.destroy({ where: {} });
    await Harvest.destroy({ where: {} });
    await CalendarEvent.destroy({ where: {} });
    await Note.destroy({ where: {} });
    await Alert.destroy({ where: {} });
    await Plant.destroy({ where: {} });
    await SensorModel.destroy({ where: {} });
    await Device.destroy({ where: {} });
    await Strain.destroy({ where: {} });
  }

  /**
   * Create test strains
   */
  private static async createStrains(count: number): Promise<Strain[]> {
    const strainData = [
      {
        name: 'Northern Lights',
        type: 'indica' as const,
        thcContent: '18.5',
        cbdContent: '0.3',
        floweringWeeks: 8,
        description: 'Classic Indica strain, great for relaxation',
      },
      {
        name: 'Sour Diesel',
        type: 'sativa' as const,
        thcContent: '22.0',
        cbdContent: '0.2',
        floweringWeeks: 10,
        description: 'Energizing Sativa with diesel aroma',
      },
      {
        name: 'Blue Dream',
        type: 'hybrid' as const,
        thcContent: '20.0',
        cbdContent: '0.5',
        floweringWeeks: 9,
        description: 'Balanced hybrid, popular for medical use',
      },
      {
        name: 'OG Kush',
        type: 'hybrid' as const,
        thcContent: '24.0',
        cbdContent: '0.3',
        floweringWeeks: 8,
        description: 'Premium hybrid with earthy pine flavor',
      },
      {
        name: 'White Widow',
        type: 'hybrid' as const,
        thcContent: '19.0',
        cbdContent: '0.2',
        floweringWeeks: 9,
        description: 'Legendary Dutch strain, resin-covered buds',
      },
    ];

    const strains: Strain[] = [];
    for (let i = 0; i < count && i < strainData.length; i++) {
      const strain = await Strain.create(strainData[i]);
      strains.push(strain);
    }

    return strains;
  }

  /**
   * Create test devices
   */
  private static async createDevices(count: number): Promise<Device[]> {
    const devices: Device[] = [];

    for (let i = 0; i < count; i++) {
      const device = await Device.create({
        deviceId: `TEST-ESP32-${i + 1}`,
        name: `Test Device ${i + 1}`,
        type: i % 2 === 0 ? 'esp32' : 'esp8266',
        status: 'online',
        ipAddress: `192.168.1.${100 + i}`,
        location: i === 0 ? 'Growbox A' : 'Growbox B',
        lastSeen: new Date(),
      });

      // Create sensors for device
      await SensorModel.create({
        deviceId: device.id,
        sensorId: 1000 + i * 10,
        type: 'temperature',
        name: `Sensor ${i + 1}`,
        location: device.location,
        unit: '°C',
        minValue: 10,
        maxValue: 40,
        isActive: true,
      });

      devices.push(device);
    }

    return devices;
  }

  /**
   * Create a completed grow with full history
   */
  private static async createCompletedGrow(
    strain: Strain,
    device: Device,
    daysOfHistory: number
  ): Promise<{
    sensorDataCount: number;
    harvestCount: number;
    eventCount: number;
    noteCount: number;
  }> {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysOfHistory);

    const sensorId = 1000 + device.id;

    const plant = await Plant.create({
      name: `${strain.name} #${Math.floor(Math.random() * 100)}`,
      strainId: strain.id,
      phase: 'harvested',
      plantedDate: startDate,
      harvestDate: endDate,
      sensorId: sensorId,
      description: `Test grow of ${strain.name}`,
      isActive: false,
    });

    let sensorDataCount = 0;
    let eventCount = 0;
    let noteCount = 0;

    // Generate sensor data for entire grow cycle
    const phases = [
      { name: 'germination', days: 7, temp: [20, 25] as [number, number], humidity: [70, 80] as [number, number] },
      { name: 'seedling', days: 14, temp: [22, 26] as [number, number], humidity: [60, 70] as [number, number] },
      { name: 'vegetative', days: 28, temp: [24, 28] as [number, number], humidity: [50, 70] as [number, number] },
      { name: 'flowering', days: strain.floweringWeeks * 7, temp: [20, 26] as [number, number], humidity: [40, 50] as [number, number] },
    ];

    let currentDate = new Date(startDate);
    let phaseIndex = 0;
    let dayInPhase = 0;

    while (currentDate <= endDate) {
      const phase = phases[phaseIndex];

      // Generate 24 sensor readings per day (hourly)
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(currentDate);
        timestamp.setHours(hour);

        const sensorData = await this.generateSensorReading(
          sensorId,
          timestamp,
          phase.temp,
          phase.humidity,
          phase.name
        );
        sensorDataCount++;
      }

      // Phase transition events
      if (dayInPhase === 0 && phaseIndex > 0) {
        await CalendarEvent.create({
          plantId: plant.id,
          title: 'Phase Change',
          description: `Entered ${phase.name} phase`,
          eventDate: currentDate,
          eventType: 'other',
          completed: true,
        });
        eventCount++;
      }

      // Random events and notes
      if (Math.random() < 0.1) { // 10% chance per day
        await Note.create({
          plantId: plant.id,
          title: `${phase.name} update`,
          content: this.getRandomNote(phase.name),
          createdAt: currentDate,
        });
        noteCount++;
      }

      dayInPhase++;
      if (dayInPhase >= phase.days && phaseIndex < phases.length - 1) {
        phaseIndex++;
        dayInPhase = 0;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create harvest
    const wetWeight = 80 + Math.random() * 120; // 80-200g
    const dryWeight = wetWeight * (0.2 + Math.random() * 0.05); // 20-25% of wet weight

    await Harvest.create({
      plantId: plant.id,
      harvestDate: endDate,
      wetWeight: parseFloat(wetWeight.toFixed(1)),
      dryWeight: parseFloat(dryWeight.toFixed(1)),
      quality: ['excellent', 'good', 'average'][Math.floor(Math.random() * 3)] as 'excellent' | 'good' | 'average',
      notes: `Completed grow of ${strain.name}. Good yield and quality.`,
    });

    return {
      sensorDataCount,
      harvestCount: 1,
      eventCount,
      noteCount,
    };
  }

  /**
   * Create an active plant with recent history
   */
  private static async createActivePlant(
    strain: Strain,
    device: Device
  ): Promise<{
    sensorDataCount: number;
    eventCount: number;
    noteCount: number;
  }> {
    const phases = ['germination', 'seedling', 'vegetative', 'flowering'];
    const phase = phases[Math.floor(Math.random() * phases.length)] as any;

    const daysOld = Math.floor(Math.random() * 60) + 7; // 7-67 days old
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysOld);

    const sensorId = 2000 + device.id + Math.floor(Math.random() * 100);

    const plant = await Plant.create({
      name: `${strain.name} #${Math.floor(Math.random() * 100)}`,
      strainId: strain.id,
      phase: phase,
      plantedDate: startDate,
      sensorId: sensorId,
      description: `Active grow of ${strain.name}`,
      isActive: true,
    });

    let sensorDataCount = 0;
    let eventCount = 0;
    let noteCount = 0;

    // Generate sensor data for the last 30 days
    const dataStartDate = new Date();
    dataStartDate.setDate(dataStartDate.getDate() - Math.min(daysOld, 30));

    let currentDate = new Date(dataStartDate);
    const now = new Date();

    while (currentDate <= now) {
      // Generate 4 readings per day (every 6 hours)
      for (let i = 0; i < 4; i++) {
        const timestamp = new Date(currentDate);
        timestamp.setHours(i * 6);

        await this.generateSensorReading(
          sensorId,
          timestamp,
          [22, 27],
          [50, 70],
          phase
        );
        sensorDataCount++;
      }

      // Random notes
      if (Math.random() < 0.05) {
        await Note.create({
          plantId: plant.id,
          title: `${phase} update`,
          content: this.getRandomNote(phase),
          createdAt: currentDate,
        });
        noteCount++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create phase change event
    await CalendarEvent.create({
      plantId: plant.id,
      title: 'Phase Change',
      description: `Plant entered ${phase} phase`,
      eventDate: new Date(startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime())),
      eventType: 'other',
      completed: true,
    });
    eventCount++;

    return {
      sensorDataCount,
      eventCount,
      noteCount,
    };
  }

  /**
   * Generate a single sensor reading
   */
  private static async generateSensorReading(
    sensorId: number,
    timestamp: Date,
    tempRange: [number, number],
    humidityRange: [number, number],
    phase: string
  ): Promise<SensorData> {
    // Add realistic variations
    const temp = tempRange[0] + Math.random() * (tempRange[1] - tempRange[0]);
    const humidity = humidityRange[0] + Math.random() * (humidityRange[1] - humidityRange[0]);

    // Soil moisture varies by watering cycle
    const hourOfDay = timestamp.getHours();
    const baseMoisture = 60 + Math.sin(hourOfDay / 24 * Math.PI * 2) * 20; // Daily cycle
    const moisture = baseMoisture + (Math.random() - 0.5) * 10;

    // Extended sensors with realistic values
    const co2 = 400 + Math.random() * 800; // 400-1200 ppm
    const par = hourOfDay >= 6 && hourOfDay <= 20 ? 300 + Math.random() * 500 : 0; // Light hours
    const ph = 6.0 + Math.random() * 1.5; // 6.0-7.5
    const ec = 1.0 + Math.random() * 1.5; // 1.0-2.5 mS/cm
    const tds = ec * 640; // Approximate conversion
    const voc = 100 + Math.random() * 300; // 100-400 ppb
    const pm25 = 5 + Math.random() * 15; // 5-20 µg/m³
    const light = par > 0 ? 50 + Math.random() * 50 : 0; // 0-100%

    return await SensorData.create({
      sensorId,
      moistureLevel: parseFloat(moisture.toFixed(1)),
      temperature: parseFloat(temp.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1)),
      co2: parseFloat(co2.toFixed(0)),
      par: parseFloat(par.toFixed(0)),
      ph: parseFloat(ph.toFixed(2)),
      ec: parseFloat(ec.toFixed(2)),
      tds: parseFloat(tds.toFixed(0)),
      voc: parseFloat(voc.toFixed(0)),
      pm25: parseFloat(pm25.toFixed(1)),
      light: parseFloat(light.toFixed(1)),
      timestamp,
    });
  }

  /**
   * Get random note content based on phase
   */
  private static getRandomNote(phase: string): string {
    const notes: { [key: string]: string[] } = {
      germination: [
        'Seeds showing first signs of sprouting',
        'Keeping humidity high for germination',
        'Taproot visible, looking healthy',
      ],
      seedling: [
        'First true leaves developing nicely',
        'Maintaining optimal light distance',
        'Seedling showing strong growth',
        'Starting light nutrients',
      ],
      vegetative: [
        'Strong vegetative growth this week',
        'Topped plant to encourage bushier growth',
        'LST applied to main branches',
        'Increased nutrient strength',
        'Defoliated lower leaves for better airflow',
      ],
      flowering: [
        'First pistils visible - flowering started!',
        'Buds developing nicely',
        'Trichome production increasing',
        'Switched to bloom nutrients',
        'Checking for hermaphrodites',
        'Heavy bud development this week',
        'Trichomes mostly cloudy, getting close to harvest',
      ],
    };

    const phaseNotes = notes[phase] || notes.vegetative;
    return phaseNotes[Math.floor(Math.random() * phaseNotes.length)];
  }

  /**
   * Generate quick demo data (less comprehensive, faster)
   */
  static async generateQuickDemo(): Promise<any> {
    return await this.generateTestData({
      strains: 2,
      plants: 3,
      completedGrows: 2,
      daysOfHistory: 30,
      clearExisting: false,
    });
  }

  /**
   * Generate full test data set
   */
  static async generateFullTestData(): Promise<any> {
    return await this.generateTestData({
      strains: 5,
      plants: 8,
      completedGrows: 5,
      daysOfHistory: 120,
      clearExisting: true,
    });
  }
}
