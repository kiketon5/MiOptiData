import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Papa from 'papaparse';

const DataImport = ({ profileId, onClose, onImportComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [importType, setImportType] = useState('prescriptions');
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [step, setStep] = useState(1); // 1: select file, 2: preview, 3: results

  const importTypes = {
    prescriptions: {
      label: 'Prescriptions',
      description: 'Import eye prescription data',
      requiredColumns: ['prescription_date', 'od_sphere', 'os_sphere'],
      optionalColumns: ['od_cylinder', 'od_axis', 'od_add', 'os_cylinder', 'os_axis', 'os_add', 'doctor_name', 'notes'],
      sampleData: [
        { prescription_date: '2024-01-15', od_sphere: '-2.50', od_cylinder: '-0.75', od_axis: '90', os_sphere: '-2.25', os_cylinder: '-0.50', os_axis: '85', doctor_name: 'Dr. Smith' }
      ]
    },
    visualTests: {
      label: 'Visual Acuity Tests',
      description: 'Import vision test results',
      requiredColumns: ['test_date', 'test_type'],
      optionalColumns: ['od_result', 'os_result', 'binocular_result', 'with_correction', 'notes'],
      sampleData: [
        { test_date: '2024-01-15', test_type: 'snellen', od_result: '20/20', os_result: '20/25', with_correction: 'true' }
      ]
    },
    symptoms: {
      label: 'Symptoms',
      description: 'Import symptom tracking data',
      requiredColumns: ['symptom_date', 'symptom_type', 'severity'],
      optionalColumns: ['duration_minutes', 'trigger_activity', 'treatment_used', 'notes'],
      sampleData: [
        { symptom_date: '2024-01-15', symptom_type: 'dry_eyes', severity: '6', duration_minutes: '30', trigger_activity: 'Computer work' }
      ]
    },
    pressureMeasurements: {
      label: 'Eye Pressure',
      description: 'Import pressure measurement data',
      requiredColumns: ['measurement_date'],
      optionalColumns: ['od_pressure', 'os_pressure', 'measurement_method', 'measured_by', 'notes'],
      sampleData: [
        { measurement_date: '2024-01-15', od_pressure: '15.2', os_pressure: '14.8', measurement_method: 'tonometry', measured_by: 'Dr. Johnson' }
      ]
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        alert('Please select a CSV file.');
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          alert('Error parsing CSV file. Please check the format.');
          setLoading(false);
          return;
        }

        const data = results.data;
        if (data.length === 0) {
          alert('CSV file appears to be empty.');
          setLoading(false);
          return;
        }

        // Validate required columns
        const requiredColumns = importTypes[importType].requiredColumns;
        const fileColumns = Object.keys(data[0]);
        const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));

        if (missingColumns.length > 0) {
          alert(`Missing required columns: ${missingColumns.join(', ')}`);
          setLoading(false);
          return;
        }

        setPreviewData(data.slice(0, 10)); // Show first 10 rows for preview
        setStep(2);
        setLoading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error reading CSV file.');
        setLoading(false);
      }
    });
  };

  const handleImport = async () => {
    if (!previewData || !file) return;

    setLoading(true);
    try {
      // Parse the entire file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const data = results.data;
            const processedData = data.map(row => processRowData(row));
            
            // Import data to Supabase
            const tableName = getTableName(importType);
            const { data: insertedData, error } = await supabase
              .from(tableName)
              .insert(processedData);

            if (error) throw error;

            setImportResults({
              success: true,
              imported: processedData.length,
              failed: 0,
              errors: []
            });
            setStep(3);
            
            if (onImportComplete) {
              onImportComplete();
            }
          } catch (error) {
            console.error('Import error:', error);
            setImportResults({
              success: false,
              imported: 0,
              failed: data?.length || 0,
              errors: [error.message]
            });
            setStep(3);
          } finally {
            setLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('Import error:', error);
      setImportResults({
        success: false,
        imported: 0,
        failed: 0,
        errors: [error.message]
      });
      setStep(3);
      setLoading(false);
    }
  };

  const processRowData = (row) => {
    const processed = {
      user_id: user.id,
      profile_id: profileId,
      ...row
    };

    // Type-specific processing
    switch (importType) {
      case 'prescriptions':
        // Convert numeric strings to numbers
        ['od_sphere', 'od_cylinder', 'od_axis', 'od_add', 'od_prism', 
         'os_sphere', 'os_cylinder', 'os_axis', 'os_add', 'os_prism', 'pupillary_distance'].forEach(field => {
          if (processed[field] && processed[field] !== '') {
            const num = parseFloat(processed[field]);
            processed[field] = isNaN(num) ? null : num;
          } else {
            processed[field] = null;
          }
        });
        break;

      case 'symptoms':
        // Convert severity to number
        if (processed.severity) {
          processed.severity = parseInt(processed.severity);
        }
        if (processed.duration_minutes) {
          processed.duration_minutes = parseInt(processed.duration_minutes);
        }
        // Convert environmental_factors string to array if present
        if (processed.environmental_factors && typeof processed.environmental_factors === 'string') {
          processed.environmental_factors = processed.environmental_factors.split(',').map(s => s.trim());
        }
        break;

      case 'visualTests':
        // Convert boolean strings
        if (processed.with_correction) {
          processed.with_correction = processed.with_correction.toLowerCase() === 'true';
        }
        break;

      case 'pressureMeasurements':
        // Convert pressure values to numbers
        ['od_pressure', 'os_pressure'].forEach(field => {
          if (processed[field] && processed[field] !== '') {
            const num = parseFloat(processed[field]);
            processed[field] = isNaN(num) ? null : num;
          } else {
            processed[field] = null;
          }
        });
        break;
    }

    return processed;
  };

  const getTableName = (type) => {
    const tableMap = {
      prescriptions: 'app_061iy_prescriptions',
      visualTests: 'app_061iy_visual_tests',
      symptoms: 'app_061iy_symptoms',
      pressureMeasurements: 'app_061iy_pressure_measurements'
    };
    return tableMap[type];
  };

  const downloadSampleCSV = () => {
    const sampleData = importTypes[importType].sampleData;
    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sample-${importType}.csv`;
    link.click();
  };

  const resetImport = () => {
    setFile(null);
    setPreviewData(null);
    setImportResults(null);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Import Data - Step {step} of 3
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Import Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Data Type to Import
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(importTypes).map(([key, type]) => (
                  <label key={key} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="importType"
                      value={key}
                      checked={importType === key}
                      onChange={(e) => setImportType(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">CSV files only</p>
                  </div>
                </label>
                {file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700">Selected: {file.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Format Requirements */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
              <div className="text-sm text-blue-700 space-y-2">
                <div>
                  <span className="font-medium">Required columns:</span> {importTypes[importType].requiredColumns.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Optional columns:</span> {importTypes[importType].optionalColumns.join(', ')}
                </div>
                <button
                  onClick={downloadSampleCSV}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Download sample CSV template
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && previewData && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Showing first 10 rows. Total rows in file: {previewData.length}+
              </p>
              
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0]).map(column => (
                        <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {value || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Import Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This will import all data from the CSV file. Make sure the data is correct before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && importResults && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${importResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex">
                <svg className={`w-5 h-5 mt-0.5 ${importResults.success ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {importResults.success ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
                <div className="ml-3">
                  <h4 className={`text-sm font-medium ${importResults.success ? 'text-green-800' : 'text-red-800'}`}>
                    {importResults.success ? 'Import Successful' : 'Import Failed'}
                  </h4>
                  <div className={`text-sm mt-1 ${importResults.success ? 'text-green-700' : 'text-red-700'}`}>
                    <p>Imported: {importResults.imported} records</p>
                    {importResults.failed > 0 && <p>Failed: {importResults.failed} records</p>}
                  </div>
                </div>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {importResults.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => file && setStep(2)}
                disabled={!file || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Next'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Import Data</span>
                  </>
                )}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                onClick={resetImport}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Import More
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataImport;