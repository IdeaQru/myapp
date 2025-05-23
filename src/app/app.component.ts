import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { AppConfigService } from './appConfigServer';
import { AISData } from './aisdata.model'; // Pastikan path sesuai
import { environment } from '../environments/environment';  // Import environment

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  apiUrl: string = '';
  polygonPoints: { lat: number; lng: number }[] = [];
  aisData: AISData[] = [];
  startDate: string = '';
  endDate: string = '';
  loading: boolean = false;

  constructor(private appConfig: AppConfigService) {}

  ngOnInit() {
    this.apiUrl = this.appConfig.apiUrl;
  }

  getUniqueVessels(): number {
    const uniqueMMSIs = new Set(this.aisData.map(data => data.mmsi));
    return uniqueMMSIs.size;
  }

  getDateRangeText(): string {
    if (!this.startDate || !this.endDate) return 'Not specified';
    const start = new Date(this.startDate).toLocaleDateString();
    const end = new Date(this.endDate).toLocaleDateString();
    return `${start} - ${end}`;
  }

  formatDate(timestamp: string | number | Date): string {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  addPoint(lat: string, lng: string) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      this.polygonPoints.push({ lat: latNum, lng: lngNum });
    }
  }

  fetchData() {
    if (this.polygonPoints.length === 0 || !this.startDate || !this.endDate) {
      alert('Please provide a polygon and date range');
      return;
    }

    this.loading = true;
    axios.get(`${this.apiUrl}/api/v2/all-data`, {
      params: {
        polygon: JSON.stringify(this.polygonPoints),
        startDate: this.startDate,
        endDate: this.endDate
      }
    }).then(response => {
      // Pastikan response.data memiliki properti data sesuai backend
      this.aisData = response.data.data || [];
      this.loading = false;
    }).catch(error => {
      console.error('Error fetching data:', error);
      this.loading = false;
    });
  }

  exportToJson() {
    const blob = new Blob([JSON.stringify(this.aisData, null, 2)], { type: 'application/json' });
    saveAs(blob, 'aisData.json');
  }

  exportToCsv() {
    if (!this.aisData.length) {
      alert('No data to export');
      return;
    }
    const csvData = this.convertToCsv(this.aisData);
    const blob = new Blob([csvData], { type: 'text/csv' });
    saveAs(blob, 'aisData.csv');
  }

  convertToCsv(data: AISData[]): string {
    // Header kolom CSV
    const header = [
      'Ship Name', 'MMSI', 'Latitude', 'Longitude',
      'Speed (SOG)', 'Course (COG)', 'Heading',
      'Timestamp',
      'IMO', 'Built', 'Flag', 'Flag Name',
      'Type', 'Type Name', 'Gross Tonnage', 'Deadweight',
      'Length Overall', 'Beam', 'Draught', 'Class', 'Class Code'
    ];

    const rows = data.map(d => [
      d.static?.NAME || 'N/A',
      d.mmsi,
      d.position.latitude,
      d.position.longitude,
      d.movement.sog,
      d.movement.cog,
      d.movement.heading !== null ? d.movement.heading : 'N/A',
      this.formatDate(d.timestamp),
      d.static?.IMO || 'N/A',
      d.static?.BUILT || 'N/A',
      d.static?.FLAG || 'N/A',
      d.static?.FLAGNAME || 'N/A',
      d.static?.TYPE || 'N/A',
      d.static?.TYPENAME || 'N/A',
      d.static?.GT || 'N/A',
      d.static?.DWT || 'N/A',
      d.static?.LOA || 'N/A',
      d.static?.BEAM || 'N/A',
      d.static?.DRAUGHT || 'N/A',
      d.static?.CLASS || 'N/A',
      d.static?.CLASSCODE || 'N/A'
    ]);

    // Escape koma dan kutip jika perlu (simple version)
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = val.toString();
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      header.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ];

    return csvRows.join('\n');
  }
}
