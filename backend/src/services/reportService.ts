import { ReportSchedule, Plant, SensorData, Harvest, Alert, Strain } from '../models';
import { Op } from 'sequelize';
import nodemailer from 'nodemailer';

export class ReportService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  static async generateAndSendReport(schedule: ReportSchedule): Promise<boolean> {
    try {
      const reportData = await this.collectReportData(schedule);
      const reportContent = await this.formatReport(reportData, schedule);

      await this.sendReportEmail(
        schedule.recipientEmail,
        `${schedule.name} - ${new Date().toLocaleDateString('de-DE')}`,
        reportContent,
        schedule.reportFormat
      );

      // Update last run
      await schedule.update({
        lastRun: new Date(),
        nextRun: this.calculateNextRun(schedule),
      });

      return true;
    } catch (error) {
      console.error('Failed to generate and send report:', error);
      return false;
    }
  }

  private static async collectReportData(schedule: ReportSchedule) {
    const now = new Date();
    const period = this.getReportPeriod(schedule.type);
    const since = new Date(now.getTime() - period);

    const data: any = {};

    // Collect plant status
    if (schedule.includePlantStatus) {
      data.plants = await Plant.findAll({
        where: { isActive: true },
        include: [{ model: Strain, as: 'strain' }],
      });
    }

    // Collect sensor data
    if (schedule.includeSensorData) {
      data.sensorData = await SensorData.findAll({
        where: {
          timestamp: { [Op.gte]: since },
        },
        order: [['timestamp', 'DESC']],
        limit: 1000,
      });

      // Calculate statistics
      data.sensorStats = this.calculateSensorStatistics(data.sensorData);
    }

    // Collect harvests
    if (schedule.includeHarvests) {
      data.harvests = await Harvest.findAll({
        where: {
          harvestDate: { [Op.gte]: since },
        },
        include: [{ model: Plant, as: 'plant' }],
      });
    }

    // Collect alerts
    if (schedule.includeAlerts) {
      data.alerts = await Alert.findAll({
        where: {
          enabled: true,
          lastTriggered: { [Op.gte]: since },
        },
      });
    }

    return data;
  }

  private static getReportPeriod(type: string): number {
    switch (type) {
      case 'daily':
        return 24 * 60 * 60 * 1000; // 1 day
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  private static calculateSensorStatistics(sensorData: any[]) {
    const fields = ['moistureLevel', 'temperature', 'humidity', 'co2', 'par', 'ph', 'ec', 'tds', 'voc', 'pm25', 'light'];
    const stats: any = {};

    fields.forEach((field) => {
      const values = sensorData.map((d) => d[field]).filter((v) => v != null && !isNaN(v));

      if (values.length > 0) {
        const sorted = values.sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);

        stats[field] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: sum / values.length,
          median: sorted[Math.floor(sorted.length / 2)],
          count: values.length,
        };
      }
    });

    return stats;
  }

  private static async formatReport(data: any, schedule: ReportSchedule): Promise<string> {
    if (schedule.reportFormat === 'html') {
      return this.formatHtmlReport(data, schedule);
    } else {
      // For PDF, we'll just return HTML for now
      // In a real implementation, you'd use a library like puppeteer or pdfkit
      return this.formatHtmlReport(data, schedule);
    }
  }

  private static formatHtmlReport(data: any, schedule: ReportSchedule): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    h1 { color: #2e7d32; border-bottom: 3px solid #66bb6a; padding-bottom: 10px; }
    h2 { color: #424242; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #4caf50; color: white; }
    tr:hover { background-color: #f5f5f5; }
    .stat-card { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .stat-label { color: #666; font-size: 14px; }
    .stat-value { color: #2e7d32; font-size: 24px; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌱 ${schedule.name}</h1>
    <p><strong>Zeitraum:</strong> ${schedule.type === 'daily' ? 'Letzten 24 Stunden' : schedule.type === 'weekly' ? 'Letzte 7 Tage' : 'Letzten 30 Tage'}</p>
    <p><strong>Generiert:</strong> ${new Date().toLocaleString('de-DE')}</p>
`;

    // Plant Status
    if (schedule.includePlantStatus && data.plants && data.plants.length > 0) {
      html += `
    <h2>🌿 Pflanzen-Status</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Strain</th>
          <th>Phase</th>
          <th>Gepflanzt am</th>
        </tr>
      </thead>
      <tbody>
`;
      data.plants.forEach((plant: any) => {
        html += `
        <tr>
          <td>${plant.name}</td>
          <td>${plant.strain?.name || 'Unbekannt'}</td>
          <td>${plant.phase}</td>
          <td>${plant.plantedDate ? new Date(plant.plantedDate).toLocaleDateString('de-DE') : '-'}</td>
        </tr>
`;
      });
      html += `
      </tbody>
    </table>
`;
    }

    // Sensor Statistics
    if (schedule.includeSensorData && data.sensorStats) {
      html += `
    <h2>📊 Sensor-Statistiken</h2>
`;
      Object.entries(data.sensorStats).forEach(([key, stats]: [string, any]) => {
        const labels: Record<string, string> = {
          moistureLevel: 'Feuchtigkeit',
          temperature: 'Temperatur',
          humidity: 'Luftfeuchtigkeit',
          co2: 'CO₂',
          par: 'PAR',
          ph: 'pH',
          ec: 'EC',
          tds: 'TDS',
          voc: 'VOC',
          pm25: 'PM2.5',
          light: 'Licht',
        };

        html += `
    <div class="stat-card">
      <div class="stat-label">${labels[key] || key}</div>
      <div class="stat-value">${stats.avg.toFixed(2)}</div>
      <small>Min: ${stats.min.toFixed(1)} | Max: ${stats.max.toFixed(1)} | Median: ${stats.median.toFixed(1)}</small>
    </div>
`;
      });
    }

    // Harvests
    if (schedule.includeHarvests && data.harvests && data.harvests.length > 0) {
      html += `
    <h2>🌾 Ernten</h2>
    <table>
      <thead>
        <tr>
          <th>Pflanze</th>
          <th>Datum</th>
          <th>Nass-Gewicht</th>
          <th>Trocken-Gewicht</th>
        </tr>
      </thead>
      <tbody>
`;
      data.harvests.forEach((harvest: any) => {
        html += `
        <tr>
          <td>${harvest.plant?.name || 'Unbekannt'}</td>
          <td>${new Date(harvest.harvestDate).toLocaleDateString('de-DE')}</td>
          <td>${harvest.wetWeight ? harvest.wetWeight.toFixed(1) + 'g' : '-'}</td>
          <td>${harvest.dryWeight ? harvest.dryWeight.toFixed(1) + 'g' : '-'}</td>
        </tr>
`;
      });
      html += `
      </tbody>
    </table>
`;
    }

    // Alerts
    if (schedule.includeAlerts && data.alerts && data.alerts.length > 0) {
      html += `
    <h2>⚠️ Aktive Alarme</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Bedingung</th>
          <th>Zuletzt ausgelöst</th>
        </tr>
      </thead>
      <tbody>
`;
      data.alerts.forEach((alert: any) => {
        html += `
        <tr>
          <td>${alert.name}</td>
          <td>${alert.condition} (${alert.threshold})</td>
          <td>${alert.lastTriggered ? new Date(alert.lastTriggered).toLocaleString('de-DE') : '-'}</td>
        </tr>
`;
      });
      html += `
      </tbody>
    </table>
`;
    }

    html += `
    <div class="footer">
      <p>Dieser Report wurde automatisch generiert durch Ihr Grow Monitoring System</p>
    </div>
  </div>
</body>
</html>
`;

    return html;
  }

  private static async sendReportEmail(
    to: string,
    subject: string,
    content: string,
    format: string
  ): Promise<void> {
    const transporter = this.getTransporter();

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: content,
    });
  }

  static calculateNextRun(schedule: ReportSchedule): Date {
    const now = new Date();
    const [hours, minutes] = schedule.timeOfDay.split(':').map(Number);

    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    switch (schedule.type) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly':
        if (schedule.dayOfWeek !== undefined) {
          nextRun.setDate(nextRun.getDate() + ((7 + schedule.dayOfWeek - nextRun.getDay()) % 7));
          if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 7);
          }
        }
        break;

      case 'monthly':
        if (schedule.dayOfMonth !== undefined) {
          nextRun.setDate(schedule.dayOfMonth);
          if (nextRun <= now) {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
        }
        break;
    }

    return nextRun;
  }

  static async processDueReports(): Promise<void> {
    try {
      const now = new Date();

      const dueReports = await ReportSchedule.findAll({
        where: {
          enabled: true,
          nextRun: { [Op.lte]: now },
        },
      });

      for (const report of dueReports) {
        await this.generateAndSendReport(report);
      }
    } catch (error) {
      console.error('Failed to process due reports:', error);
    }
  }
}
