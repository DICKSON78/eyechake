import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DepartmentPerformanceReport = ({ department }) => {
  const [report, setReport] = useState(null);
  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showEditTargets, setShowEditTargets] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [reportDate, setReportDate] = useState(
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  );

  useEffect(() => {
    loadReport();
    checkEditAccess();
  }, [department]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/department-performance/${department}`);
      setReport(response.data.data);
      if (response.data.data?.report_date) {
        setReportDate(new Date(response.data.data.report_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load report');
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    
    try {
      const response = await axios.post(`/api/department-performance/${department}/generate`);
      setReport(response.data.data);
      if (response.data.data?.report_date) {
        setReportDate(new Date(response.data.data.report_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate report');
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEditAccess = async () => {
    try {
      const response = await axios.get(`/api/department-performance/departments`);
      setCanEdit(response.data.data.includes(department));
    } catch (error) {
      console.error('Error checking access:', error);
    }
  };

  const loadTargets = async () => {
    try {
      const response = await axios.get(`/api/department-performance/${department}/targets`);
      setTargets(response.data.data);
    } catch (error) {
      console.error('Error loading targets:', error);
    }
  };

  const saveTargets = async () => {
    setSaving(true);
    
    try {
      await axios.patch(`/api/department-performance/${department}`, {
        targets: targets.map(target => ({
          kpi_name: target.kpi_name,
          target_value: target.target_value,
          target_unit: target.target_unit
        }))
      });
      
      setShowEditTargets(false);
      loadReport();
    } catch (error) {
      console.error('Error saving targets:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatValue = (value, unit) => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    } else if (unit === 'percentage') {
      return `${value}%`;
    } else if (typeof value === 'object' && value !== null) {
      return `Called: ${value.called || 0} | Not Called: ${value.not_called || 0} | Unreachable: ${value.unreachable || 0}`;
    }
    return value?.toLocaleString?.() || value;
  };

  const getPercentage = (actual, target) => {
    if (target === 0) return 0;
    return Math.min(Math.round((actual / target) * 100), 200);
  };

  const getBorderColor = (color) => {
    const colors = {
      green: 'border-green-500',
      yellow: 'border-yellow-500',
      blue: 'border-blue-500',
      gray: 'border-gray-500'
    };
    return colors[color] || 'border-gray-500';
  };

  const getBackgroundColor = (color) => {
    const colors = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      gray: 'bg-gray-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  const getTextColor = (color) => {
    const colors = {
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      blue: 'text-blue-600',
      gray: 'text-gray-600'
    };
    return colors[color] || 'text-gray-600';
  };

  const getIcon = (color) => {
    const icons = {
      green: 'fas fa-check',
      yellow: 'fas fa-exclamation',
      blue: 'fas fa-arrow-up',
      gray: 'fas fa-minus'
    };
    return icons[color] || 'fas fa-minus';
  };

  useEffect(() => {
    if (showEditTargets) {
      loadTargets();
    }
  }, [showEditTargets]);

  return (
    <div className="department-performance-report max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="report-header bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{department} Performance Report</h2>
            <p className="text-gray-600 mt-1">Last updated: {reportDate || 'No data'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh Data
            </button>
            {canEdit && (
              <button
                onClick={() => setShowEditTargets(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit Targets
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
          <p className="mt-4 text-gray-600">Calculating performance data...</p>
        </div>
      )}

      {/* Report Content */}
      {!loading && report?.kpi_data && Object.keys(report.kpi_data).length > 0 && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(report.kpi_data).map(([key, kpi]) => (
              <div
                key={key}
                className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${getBorderColor(kpi.color)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{kpi.name}</h3>
                    <div className="mt-2">
                      <p className={`text-3xl font-bold ${getTextColor(kpi.color)}`}>
                        {formatValue(kpi.value, kpi.unit)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Target: {formatValue(kpi.target?.value || 0, kpi.target?.unit)}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${getBackgroundColor(kpi.color)}`}
                    >
                      <i className={`${getIcon(kpi.color)} text-white`}></i>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getBackgroundColor(kpi.color)}`}
                      style={{ width: `${getPercentage(kpi.value, kpi.target?.value || 0)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {getPercentage(kpi.value, kpi.target?.value || 0)}% of target
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-chart-line mr-2 text-blue-600"></i>
              Report Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">{report.summary || 'Summary is being calculated...'}</p>
          </div>

          {/* Recommendations Section */}
          {report.recommendations?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-lightbulb mr-2 text-yellow-500"></i>
                Report Recommendations
              </h3>
              <ul className="space-y-3">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && (!report?.kpi_data || Object.keys(report.kpi_data).length === 0) && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <i className="fas fa-chart-bar text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-900">No Performance Data Available</h3>
          <p className="text-gray-500 mt-2">Click refresh to calculate performance metrics for today.</p>
          <button
            onClick={generateReport}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Calculate Now
          </button>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Report</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Targets Modal */}
      {showEditTargets && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit KPI Targets</h3>
            {targets && (
              <div className="space-y-4">
                {targets.map((target) => (
                  <div key={target.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{target.kpi_name}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={target.target_value}
                        onChange={(e) => {
                          const updated = [...targets];
                          const idx = updated.findIndex(t => t.id === target.id);
                          updated[idx].target_value = e.target.value;
                          setTargets(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={target.target_unit}
                        onChange={(e) => {
                          const updated = [...targets];
                          const idx = updated.findIndex(t => t.id === target.id);
                          updated[idx].target_unit = e.target.value;
                          setTargets(updated);
                        }}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditTargets(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveTargets}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving && <i className="fas fa-spinner fa-spin mr-2"></i>}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentPerformanceReport;