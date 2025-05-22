/**
 * Utility functions for exporting health metrics data
 */

/**
 * Format array data for CSV export and download it
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 * @param {Array} headers - Array of column headers in format {key, label}
 */
export const exportToCsv = (data, filename, headers) => {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }

  // Create header row
  const headerRow = headers.map(h => `"${h.label}"`).join(',');

  // Create data rows
  const rows = data.map(item =>
    headers.map(header => {
      // Ensure values are properly formatted for CSV
      const value = item[header.key];
      // If value contains commas or quotes, wrap it in quotes
      if (value === null || value === undefined) {
        return '""';
      }
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      if (typeof value === 'string') {
        return `"${value}"`;
      }
      return value;
    }).join(',')
  ).join('\n');

  // Combine headers and rows
  const csvContent = `${headerRow}\n${rows}`;

  // Create a blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  // Setup and trigger download
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format blood pressure readings for CSV export
 * @param {Array} readings - Array of blood pressure reading objects
 */
export const exportBloodPressureReadings = (readings) => {
  if (!readings || !readings.length) return;

  // Define headers for blood pressure CSV
  const headers = [
    { key: 'date', label: 'Fecha' },
    { key: 'systolic', label: 'Sistólica (mmHg)' },
    { key: 'diastolic', label: 'Diastólica (mmHg)' },
    { key: 'heartRate', label: 'Pulso (lpm)' }
  ];

  exportToCsv(readings, 'presion-arterial', headers);
};

/**
 * Format glucose readings for CSV export
 * @param {Array} readings - Array of glucose reading objects
 */
export const exportGlucoseReadings = (readings) => {
  if (!readings || !readings.length) return;

  // Define headers for glucose CSV
  const headers = [
    { key: 'date', label: 'Fecha' },
    { key: 'value', label: 'Valor (mg/dL)' },
    { key: 'state', label: 'Estado' }
  ];

  // Transform state values to be more readable
  const formattedReadings = readings.map(reading => ({
    ...reading,
    state: reading.state === 'fasting' ? 'En ayunas' :
      reading.state === 'postMeal' ? 'Después de comer' :
        reading.state === 'beforeMeal' ? 'Antes de comer' :
          reading.state === 'bedtime' ? 'Antes de dormir' : 'Normal'
  }));

  exportToCsv(formattedReadings, 'glucosa', headers);
};

/**
 * Format lipid profile readings for CSV export
 * @param {Array} readings - Array of lipid profile objects
 */
export const exportLipidProfiles = (readings) => {
  if (!readings || !readings.length) return;

  // Define headers for lipid profile CSV
  const headers = [
    { key: 'date', label: 'Fecha' },
    { key: 'total', label: 'Colesterol Total (mg/dL)' },
    { key: 'hdl', label: 'HDL (mg/dL)' },
    { key: 'ldl', label: 'LDL (mg/dL)' },
    { key: 'triglycerides', label: 'Triglicéridos (mg/dL)' }
  ];

  exportToCsv(readings, 'perfil-lipidico', headers);
};
