import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

const DataExport = ({ profileId, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    prescriptions: true,
    visualTests: true,
    symptoms: true,
    pressureMeasurements: true,
    profile: true
  });
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleExport = async () => {
    setLoading(true);
    try {
      const exportData = {};

      // Load profile data if selected
      if (exportOptions.profile) {
        const { data: profileData, error: profileError } = await supabase
          .from('app_061iy_profiles')
          .select('*')
          .eq('id', profileId)
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        exportData.profile = profileData;
      }

      // Load prescriptions if selected
      if (exportOptions.prescriptions) {
        const { data: prescriptionsData, error: prescriptionsError } = await supabase
          .from('app_061iy_prescriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('profile_id', profileId)
          .gte('prescription_date', dateRange.start)
          .lte('prescription_date', dateRange.end)
          .order('prescription_date', { ascending: true });

        if (prescriptionsError) throw prescriptionsError;
        exportData.prescriptions = prescriptionsData || [];
      }

      // Load visual tests if selected
      if (exportOptions.visualTests) {
        const { data: testsData, error: testsError } = await supabase
          .from('app_061iy_visual_tests')
          .select('*')
          .eq('user_id', user.id)
          .eq('profile_id', profileId)
          .gte('test_date', dateRange.start)
          .lte('test_date', dateRange.end)
          .order('test_date', { ascending: true });

        if (testsError) throw testsError;
        exportData.visualTests = testsData || [];
      }

      // Load symptoms if selected
      if (exportOptions.symptoms) {
        const { data: symptomsData, error: symptomsError } = await supabase
          .from('app_061iy_symptoms')
          .select('*')
          .eq('user_id', user.id)
          .eq('profile_id', profileId)
          .gte('symptom_date', dateRange.start)
          .lte('symptom_date', dateRange.end)
          .order('symptom_date', { ascending: true });

        if (symptomsError) throw symptomsError;
        exportData.symptoms = symptomsData || [];
      }

      // Load pressure measurements if selected
      if (exportOptions.pressureMeasurements) {
        const { data: pressureData, error: pressureError } = await supabase
          .from('app_061iy_pressure_measurements')
          .select('*')
          .eq('user_id', user.id)
          .eq('profile_id', profileId)
          .gte('measurement_date', dateRange.start)
          .lte('measurement_date', dateRange.end)
          .order('measurement_date', { ascending: true });

        if (pressureError) throw pressureError;
        exportData.pressureMeasurements = pressureData || [];
      }

      // Export based on format
      if (exportFormat === 'json') {
        exportAsJSON(exportData);
      } else {
        exportAsCSV(exportData);
      }

    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportAsJSON = (data) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = `eye-health-data-${data.profile?.name?.replace(/\s+/g, '-') || 'profile'}-${new Date().toISOString().split('T')[0]}.json`;
    saveAs(blob, fileName);
  };

  const exportAsCSV = (data) => {
    // Create a zip-like structure by exporting multiple CSV files
    const timestamp = new Date().toISOString().split('T')[0];
    const profileName = data.profile?.name?.replace(/\s+/g, '-') || 'profile';

    // Export each data type as separate CSV
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'profile' && value) {
        // Profile data as CSV
        const profileCSV = Papa.unparse([value]);
        const blob = new Blob([profileCSV], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${profileName}-profile-${timestamp}.csv`);
      } else if (Array.isArray(value) && value.length > 0) {
        // Array data as CSV
        const csv = Papa.unparse(value);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${profileName}-${key}-${timestamp}.csv`);
      }
    });
  };

  const handleOptionChange = (option) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const getDataCounts = () => {
    // This would ideally show actual counts, but for now we'll show estimated
    return {
      prescriptions: '~',
      visualTests: '~',
      symptoms: '~',
      pressureMeasurements: '~'
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">CSV (Excel compatible)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">JSON (Technical)</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Data Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Data to Export
            </label>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.profile}
                    onChange={() => handleOptionChange('profile')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Profile Information</span>
                    <p className="text-xs text-gray-500">Basic profile data and demographics</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">1 record</span>
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.prescriptions}
                    onChange={() => handleOptionChange('prescriptions')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Prescriptions</span>
                    <p className="text-xs text-gray-500">Eye prescription history with OD/OS values</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{getDataCounts().prescriptions} records</span>
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.visualTests}
                    onChange={() => handleOptionChange('visualTests')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Visual Acuity Tests</span>
                    <p className="text-xs text-gray-500">Snellen, LogMAR, and other vision test results</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{getDataCounts().visualTests} records</span>
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.symptoms}
                    onChange={() => handleOptionChange('symptoms')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Symptoms</span>
                    <p className="text-xs text-gray-500">Eye symptoms, severity, and triggers</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{getDataCounts().symptoms} records</span>
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.pressureMeasurements}
                    onChange={() => handleOptionChange('pressureMeasurements')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Eye Pressure</span>
                    <p className="text-xs text-gray-500">Intraocular pressure measurements</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{getDataCounts().pressureMeasurements} records</span>
              </label>
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Export Information:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {exportFormat === 'csv' ? (
                <>
                  <li>• Multiple CSV files will be downloaded (one per data type)</li>
                  <li>• Files are Excel compatible for easy analysis</li>
                  <li>• Each file contains headers for easy identification</li>
                </>
              ) : (
                <>
                  <li>• Single JSON file with all selected data</li>
                  <li>• Structured format for technical use</li>
                  <li>• Preserves all data relationships and metadata</li>
                </>
              )}
              <li>• All personal data is included - handle securely</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading || !Object.values(exportOptions).some(Boolean)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataExport;