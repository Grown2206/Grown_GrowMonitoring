import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SensorData, Plant, Relay } from '../types';

export class ExportService {
  /**
   * Export sensor data to CSV
   */
  static exportSensorDataToCSV(data: SensorData[], filename: string = 'sensor-data.csv') {
    const headers = [
      'Timestamp',
      'Sensor ID',
      'Feuchtigkeit (%)',
      'Temperatur (°C)',
      'Luftfeuchtigkeit (%)',
      'Tankfüllstand (%)',
      'Nährstoffe (%)',
    ];

    const rows = data.map((d) => [
      new Date(d.timestamp).toLocaleString('de-DE'),
      d.sensorId,
      d.moistureLevel.toFixed(1),
      d.temperature?.toFixed(1) || '-',
      d.humidity?.toFixed(1) || '-',
      d.tankLevel?.toFixed(1) || '-',
      d.nutrientLevel?.toFixed(1) || '-',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  /**
   * Export sensor data to Excel (XLSX)
   */
  static exportSensorDataToExcel(data: SensorData[], filename: string = 'sensor-data.xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((d) => ({
        Zeitstempel: new Date(d.timestamp).toLocaleString('de-DE'),
        'Sensor ID': d.sensorId,
        'Feuchtigkeit (%)': d.moistureLevel.toFixed(1),
        'Temperatur (°C)': d.temperature?.toFixed(1) || '-',
        'Luftfeuchtigkeit (%)': d.humidity?.toFixed(1) || '-',
        'Tankfüllstand (%)': d.tankLevel?.toFixed(1) || '-',
        'Nährstoffe (%)': d.nutrientLevel?.toFixed(1) || '-',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sensor Daten');
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Export sensor data to JSON
   */
  static exportSensorDataToJSON(data: SensorData[], filename: string = 'sensor-data.json') {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    saveAs(blob, filename);
  }

  /**
   * Export sensor data to PDF with charts
   */
  static exportSensorDataToPDF(
    data: SensorData[],
    options?: {
      title?: string;
      includeChart?: boolean;
      filename?: string;
    }
  ) {
    const { title = 'Sensor Daten Bericht', filename = 'sensor-data.pdf' } = options || {};

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 20);

    // Metadata
    doc.setFontSize(10);
    doc.text(`Erstellt am: ${new Date().toLocaleString('de-DE')}`, 14, 30);
    doc.text(`Anzahl Datensätze: ${data.length}`, 14, 36);

    // Table data
    const tableData = data.map((d) => [
      new Date(d.timestamp).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      d.sensorId.toString(),
      d.moistureLevel.toFixed(1),
      d.temperature?.toFixed(1) || '-',
      d.humidity?.toFixed(1) || '-',
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Zeitstempel', 'Sensor', 'Feucht.', 'Temp.', 'Luftf.']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    doc.save(filename);
  }

  /**
   * Export plant data to CSV
   */
  static exportPlantDataToCSV(plants: Plant[], filename: string = 'plants.csv') {
    const headers = [
      'Name',
      'Sorte',
      'Phase',
      'Gepflanzt am',
      'Erwartete Ernte',
      'Sensor ID',
      'Status',
    ];

    const rows = plants.map((p) => [
      p.name,
      p.strainName || '-',
      p.phase,
      new Date(p.plantedDate).toLocaleDateString('de-DE'),
      p.expectedHarvestDate ? new Date(p.expectedHarvestDate).toLocaleDateString('de-DE') : '-',
      p.sensorId?.toString() || '-',
      p.isActive ? 'Aktiv' : 'Inaktiv',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  /**
   * Export plant data to Excel
   */
  static exportPlantDataToExcel(plants: Plant[], filename: string = 'plants.xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(
      plants.map((p) => ({
        Name: p.name,
        Sorte: p.strainName || '-',
        Phase: p.phase,
        'Gepflanzt am': new Date(p.plantedDate).toLocaleDateString('de-DE'),
        'Erwartete Ernte': p.expectedHarvestDate
          ? new Date(p.expectedHarvestDate).toLocaleDateString('de-DE')
          : '-',
        'Sensor ID': p.sensorId?.toString() || '-',
        Status: p.isActive ? 'Aktiv' : 'Inaktiv',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pflanzen');
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Export comprehensive report with all data
   */
  static exportComprehensiveReport(
    sensorData: SensorData[],
    plants: Plant[],
    relays: Relay[],
    filename: string = 'comprehensive-report.xlsx'
  ) {
    const workbook = XLSX.utils.book_new();

    // Sensor Data Sheet
    const sensorSheet = XLSX.utils.json_to_sheet(
      sensorData.map((d) => ({
        Zeitstempel: new Date(d.timestamp).toLocaleString('de-DE'),
        'Sensor ID': d.sensorId,
        'Feuchtigkeit (%)': d.moistureLevel.toFixed(1),
        'Temperatur (°C)': d.temperature?.toFixed(1) || '-',
        'Luftfeuchtigkeit (%)': d.humidity?.toFixed(1) || '-',
      }))
    );
    XLSX.utils.book_append_sheet(workbook, sensorSheet, 'Sensor Daten');

    // Plants Sheet
    const plantsSheet = XLSX.utils.json_to_sheet(
      plants.map((p) => ({
        Name: p.name,
        Sorte: p.strainName || '-',
        Phase: p.phase,
        'Gepflanzt am': new Date(p.plantedDate).toLocaleDateString('de-DE'),
        Status: p.isActive ? 'Aktiv' : 'Inaktiv',
      }))
    );
    XLSX.utils.book_append_sheet(workbook, plantsSheet, 'Pflanzen');

    // Relays Sheet
    const relaysSheet = XLSX.utils.json_to_sheet(
      relays.map((r) => ({
        Name: r.name,
        'Relay ID': r.relayId,
        Status: r.status ? 'EIN' : 'AUS',
        'Letzte Änderung': r.lastChanged
          ? new Date(r.lastChanged).toLocaleString('de-DE')
          : '-',
      }))
    );
    XLSX.utils.book_append_sheet(workbook, relaysSheet, 'Geräte');

    XLSX.writeFile(workbook, filename);
  }

  /**
   * Export analytics data to PDF report
   */
  static exportAnalyticsReport(
    sensorData: SensorData[],
    plants: Plant[],
    options?: {
      title?: string;
      dateRange?: { start: Date; end: Date };
    }
  ) {
    const { title = 'Grow Monitoring Bericht', dateRange } = options || {};
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text(title, 14, 20);

    doc.setFontSize(10);
    doc.text(`Erstellt am: ${new Date().toLocaleString('de-DE')}`, 14, 30);

    if (dateRange) {
      doc.text(
        `Zeitraum: ${dateRange.start.toLocaleDateString('de-DE')} - ${dateRange.end.toLocaleDateString('de-DE')}`,
        14,
        36
      );
    }

    // Statistics
    doc.setFontSize(14);
    doc.text('Statistiken', 14, 50);

    doc.setFontSize(10);
    const avgMoisture = sensorData.reduce((sum, d) => sum + d.moistureLevel, 0) / sensorData.length;
    const avgTemp =
      sensorData.filter((d) => d.temperature).reduce((sum, d) => sum + (d.temperature || 0), 0) /
      sensorData.filter((d) => d.temperature).length;
    const avgHumidity =
      sensorData.filter((d) => d.humidity).reduce((sum, d) => sum + (d.humidity || 0), 0) /
      sensorData.filter((d) => d.humidity).length;

    doc.text(`Durchschnittliche Bodenfeuchtigkeit: ${avgMoisture.toFixed(1)}%`, 14, 60);
    doc.text(`Durchschnittliche Temperatur: ${avgTemp.toFixed(1)}°C`, 14, 66);
    doc.text(`Durchschnittliche Luftfeuchtigkeit: ${avgHumidity.toFixed(1)}%`, 14, 72);

    // Plants Summary
    doc.setFontSize(14);
    doc.text('Pflanzen Übersicht', 14, 90);

    const activePlants = plants.filter((p) => p.isActive);
    doc.setFontSize(10);
    doc.text(`Anzahl aktiver Pflanzen: ${activePlants.length}`, 14, 100);

    // Plants Table
    const plantsTableData = activePlants.slice(0, 15).map((p) => [
      p.name,
      p.strainName || '-',
      p.phase,
      new Date(p.plantedDate).toLocaleDateString('de-DE'),
    ]);

    autoTable(doc, {
      startY: 110,
      head: [['Name', 'Sorte', 'Phase', 'Gepflanzt am']],
      body: plantsTableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [76, 175, 80] },
    });

    doc.save('analytics-report.pdf');
  }
}
