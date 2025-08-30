import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { saveAs } from 'file-saver';

const BackupRestore = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('backup');
  const [backupOptions, setBackupOptions] = useState({
    profiles: true,
    prescriptions: true,
    visualTests: true,
    symptoms: true,
    pressureMeasurements: true,
    reminders: true,
    medications: true
  });
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreResults, setRestoreResults] = useState(null);

  const createFullBackup = async () => {
    setLoading(true);
    try {
      const backupData = {
        metadata: {
          version: '1.0',
          created_at: new Date().toISOString(),
          user_id: user.id,
          user_email: user.email
        },
        data: {}
      };

      // Load all selected data types
      const promises = [];
      
      if (backupOptions.profiles) {
        promises.push(loadTableData('app_061iy_profiles', 'profiles'));
      }
      if (backupOptions.prescriptions) {
        promises.push(loadTableData('app_061iy_prescriptions', 'prescriptions'));
      }
      if (backupOptions.visualTests) {
        promises.push(loadTableData('app_061iy_visual_tests', 'visualTests'));
      }
      if (backupOptions.symptoms) {
        promises.push(loadTableData('app_061iy_symptoms', 'symptoms'));
      }
      if (backupOptions.pressureMeasurements) {
        promises.push(loadTableData('app_061iy_pressure_measurements', 'pressureMeasurements'));
      }
      if (backupOptions.reminders) {
        promises.push(loadTableData('app_061iy_reminders', 'reminders'));
      }
      if (backupOptions.medications) {
        promises.push(loadTableData('app_061iy_medications', 'medications'));
      }

      const results = await Promise.all(promises);
      
      // Combine all data
      results.forEach(({ key, data }) => {
        backupData.data[key] = data;
      });

      // Create and download backup file
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const fileName = `MiOptiData-backup-${new Date().toISOString().split('T')[0]}.json`;
      saveAs(blob, fileName);

      alert('Backup created successfully!');
    } catch (error) {
      console.error('Backup error:', error);
      alert('Failed to create backup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName, key) => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { key, data: data || [] };
  };

  const handleRestoreFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        alert('Please select a JSON backup file.');
        return;
      }
      setRestoreFile(file);
    }
  };

  const restoreFromBackup = async () => {
    if (!restoreFile) return;

    setLoading(true);
    try {
      const fileContent = await readFileAsText(restoreFile);
      const backupData = JSON.parse(fileContent);

      // Validate backup format
      if (!backupData.metadata || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      // Confirm restoration
      const confirmRestore = window.confirm(
        `This will restore data from backup created on ${new Date(backupData.metadata.created_at).toLocaleDateString()}. ` +
        'This may overwrite existing data. Are you sure you want to continue?'
      );

      if (!confirmRestore) {
        setLoading(false);
        return;
      }

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      // Restore each data type
      for (const [dataType, records] of Object.entries(backupData.data)) {
        if (Array.isArray(records) && records.length > 0) {
          try {
            const tableName = getTableNameForDataType(dataType);
            if (tableName) {
              // Add user_id to all records and remove id to avoid conflicts
              const processedRecords = records.map(record => ({
                ...record,
                user_id: user.id,
                id: undefined // Remove original ID to let Supabase generate new ones
              }));

              const { error } = await supabase
                .from(tableName)
                .insert(processedRecords);

              if (error) throw error;
              results.success += processedRecords.length;
            }
          } catch (error) {
            console.error(`Error restoring ${dataType}:`, error);
            results.failed += records.length;
            results.errors.push(`${dataType}: ${error.message}`);
          }
        }
      }

      setRestoreResults(results);
      alert(`Restore completed! Success: ${results.success}, Failed: ${results.failed}`);
    } catch (error) {
      console.error('Restore error:', error);
      alert('Failed to restore from backup. Please check the file format.');
    } finally {
      setLoading(false);
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const getTableNameForDataType = (dataType) => {
    const tableMap = {
      profiles: 'app_061iy_profiles',
      prescriptions: 'app_061iy_prescriptions',
      visualTests: 'app_061iy_visual_tests',
      symptoms: 'app_061iy_symptoms',
      pressureMeasurements: 'app_061iy_pressure_measurements',
      reminders: 'app_061iy_reminders',
      medications: 'app_061iy_medications'
    };
    return tableMap[dataType];
  };

  const handleBackupOptionChange = (option) => {
    setBackupOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const deleteAllData = async () => {
    const confirmDelete = window.confirm(
      'WARNING: This will permanently delete ALL your data. This action cannot be undone. ' +
      'Are you absolutely sure you want to continue?'
    );

    if (!confirmDelete) return;

    const doubleConfirm = window.prompt(
      'Type "DELETE ALL MY DATA" to confirm this action:'
    );

    if (doubleConfirm !== 'DELETE ALL MY DATA') {
      alert('Deletion cancelled - confirmation text did not match.');
      return;
    }

    setLoading(true);
    try {
      // Delete from all tables
      const tables = [
        'app_061iy_prescriptions',
        'app_061iy_visual_tests',
        'app_061iy_symptoms',
        'app_061iy_pressure_measurements',
        'app_061iy_reminders',
        'app_061iy_medications',
        'app_061iy_profiles'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        }
      }

      alert('All data has been deleted successfully.');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete all data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Backup & Restore</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'backup', label: 'Create Backup', icon: '💾' },
              { id: 'restore', label: 'Restore Data', icon: '📥' },
              { id: 'delete', label: 'Delete All', icon: '🗑️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Full Backup</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a complete backup of all your eye health data. This includes profiles, prescriptions, test results, and more.
              </p>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Select data to backup:</h4>
                {[
                  { key: 'profiles', label: 'Profiles', description: 'Personal profiles and demographics' },
                  { key: 'prescriptions', label: 'Prescriptions', description: 'Eye prescription history' },
                  { key: 'visualTests', label: 'Visual Tests', description: 'Visual acuity test results' },
                  { key: 'symptoms', label: 'Symptoms', description: 'Symptom tracking records' },
                  { key: 'pressureMeasurements', label: 'Eye Pressure', description: 'Pressure measurements' },
                  { key: 'reminders', label: 'Reminders', description: 'Reminder settings and history' },
                  { key: 'medications', label: 'Medications', description: 'Medication tracking' }
                ].map(({ key, label, description }) => (
                  <label key={key} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={backupOptions[key]}
                      onChange={() => handleBackupOptionChange(key)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-blue-900 mb-2">Backup Information:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Backup file will be downloaded as JSON format</li>
                  <li>• All selected data will be included with timestamps</li>
                  <li>• Store backup files securely - they contain sensitive health data</li>
                  <li>• Backups can be restored on any MiOptiData account</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Restore Tab */}
        {activeTab === 'restore' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Restore from Backup</h3>
              <p className="text-sm text-gray-600 mb-4">
                Restore your data from a previously created backup file. This will add the backup data to your current account.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Backup File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFile}
                    className="hidden"
                    id="restore-upload"
                  />
                  <label htmlFor="restore-upload" className="cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Click to select backup file</span>
                      </p>
                      <p className="text-xs text-gray-500">JSON backup files only</p>
                    </div>
                  </label>
                  {restoreFile && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700">Selected: {restoreFile.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {restoreResults && (
                <div className={`p-4 rounded-lg ${restoreResults.success > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h4 className={`font-medium ${restoreResults.success > 0 ? 'text-green-800' : 'text-red-800'}`}>
                    Restore Results
                  </h4>
                  <div className={`text-sm mt-1 ${restoreResults.success > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    <p>Successfully restored: {restoreResults.success} records</p>
                    {restoreResults.failed > 0 && <p>Failed: {restoreResults.failed} records</p>}
                    {restoreResults.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Errors:</p>
                        <ul className="list-disc list-inside">
                          {restoreResults.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Restore Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Restoring will add backup data to your current account. Existing data will not be deleted, but duplicates may be created.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Tab */}
        {activeTab === 'delete' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete All Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete all your eye health data from this account. This action cannot be undone.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">Danger Zone</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This will permanently delete ALL your data including profiles, prescriptions, test results, symptoms, and reminders. 
                      Make sure you have a backup before proceeding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">What will be deleted:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All profiles and personal information</li>
                  <li>• All prescription records</li>
                  <li>• All visual acuity test results</li>
                  <li>• All symptom tracking data</li>
                  <li>• All eye pressure measurements</li>
                  <li>• All reminders and medications</li>
                  <li>• All shared links and exports</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>

          {activeTab === 'backup' && (
            <button
              onClick={createFullBackup}
              disabled={loading || !Object.values(backupOptions).some(Boolean)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Create Backup</span>
                </>
              )}
            </button>
          )}

          {activeTab === 'restore' && (
            <button
              onClick={restoreFromBackup}
              disabled={loading || !restoreFile}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Restore Data</span>
                </>
              )}
            </button>
          )}

          {activeTab === 'delete' && (
            <button
              onClick={deleteAllData}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete All Data</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;