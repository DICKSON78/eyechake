import React from 'react';
import ReactApexChart from 'react-apexcharts';

const ChartWrapper = ({ 
  options = {}, 
  series = [], 
  type = 'bar', 
  height = 300,
  ...props 
}) => {
  // Ensure series is always an array
  const safeSeries = Array.isArray(series) ? series : [];
  
  // For pie/donut charts, series might be a simple array of numbers
  // For other charts, series is an array of objects with data arrays
  let validatedSeries;
  let validatedOptions = options || {};
  
  if (type === 'pie' || type === 'donut') {
    // For pie/donut charts, series can be:
    // 1. Array of numbers: [10, 20, 30]
    // 2. Array of objects with data property: [{ data: 10 }, { data: 20 }]
    // 3. Array of objects with data array: [{ data: [10, 20, 30] }]
    
    if (safeSeries.length === 0) {
      validatedSeries = [];
    } else if (typeof safeSeries[0] === 'number') {
      // Simple array of numbers
      validatedSeries = safeSeries;
    } else if (safeSeries[0].data !== undefined) {
      if (Array.isArray(safeSeries[0].data)) {
        // Array of objects with data arrays
        validatedSeries = safeSeries.map(seriesItem => ({
          ...seriesItem,
          data: Array.isArray(seriesItem.data) ? seriesItem.data : []
        }));
      } else {
        // Array of objects with data numbers - convert to simple array
        validatedSeries = safeSeries.map(item => item.data || 0);
      }
    } else {
      validatedSeries = safeSeries;
    }

    // Ensure labels/series length consistency to avoid chart lib crashes
    const labels = Array.isArray(validatedOptions.labels) ? validatedOptions.labels : null;
    if (labels && Array.isArray(validatedSeries)) {
      const minLen = Math.min(labels.length, validatedSeries.length);
      if (minLen === 0) {
        validatedSeries = [];
      } else if (validatedSeries.length !== labels.length) {
        // Trim both to the shortest length
        validatedOptions = {
          ...validatedOptions,
          labels: labels.slice(0, minLen),
        };
        validatedSeries = validatedSeries.slice(0, minLen);
      }
      // Coerce any non-number entries to 0
      validatedSeries = validatedSeries.map(v => (typeof v === 'number' && isFinite(v) ? v : (parseFloat(v) || 0)));
    }
  } else {
    // For other chart types, ensure each series has a data array
    validatedSeries = safeSeries.map(seriesItem => ({
      ...seriesItem,
      data: Array.isArray(seriesItem.data) ? seriesItem.data : []
    }));
  }

  // Check if we have valid data
  let hasData = false;
  
  if (type === 'pie' || type === 'donut') {
    if (Array.isArray(validatedSeries)) {
      if (typeof validatedSeries[0] === 'number') {
        hasData = validatedSeries.some(val => val > 0);
      } else {
        hasData = validatedSeries.some(s => s.data && s.data.length > 0);
      }
    }
  } else {
    hasData = validatedSeries.length > 0 && validatedSeries.some(s => s.data && s.data.length > 0);
  }

  // If no data, show a placeholder
  if (!hasData) {
    return (
      <div 
        style={{ 
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '12.6px',
          fontStyle: 'italic'
        }}
      >
        No data available for this chart
      </div>
    );
  }

  return (
    <ReactApexChart
      options={validatedOptions}
      series={validatedSeries}
      type={type}
      height={height}
      {...props}
    />
  );
};

export default ChartWrapper;
