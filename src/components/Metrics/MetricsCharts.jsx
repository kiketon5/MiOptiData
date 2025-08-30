import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const MetricsCharts = () => {
  const { user } = useAuth();
  const { profileId } = useParams();
  const [profile, setProfile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [visualTests, setVisualTests] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [pressureMeasurements, setPressureMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prescriptions');

  useEffect(() => {
    if (user && profileId) {
      loadAllData();
    }
  }, [user, profileId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('app_061iy_profiles')
        .select('*')
        .eq('id', profileId)
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load prescriptions
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('app_061iy_prescriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .order('prescription_date', { ascending: true });

      if (prescriptionsError) throw prescriptionsError;
      setPrescriptions(prescriptionsData || []);

      // Load visual tests
      const { data: testsData, error: testsError } = await supabase
        .from('app_061iy_visual_tests')
        .select('*')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .order('test_date', { ascending: true });

      if (testsError) throw testsError;
      setVisualTests(testsData || []);

      // Load symptoms
      const { data: symptomsData, error: symptomsError } = await supabase
        .from('app_061iy_symptoms')
        .select('*')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .order('symptom_date', { ascending: true });

      if (symptomsError) throw symptomsError;
      setSymptoms(symptomsData || []);

      // Load pressure measurements
      const { data: pressureData, error: pressureError } = await supabase
        .from('app_061iy_pressure_measurements')
        .select('*')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .order('measurement_date', { ascending: true });

      if (pressureError) throw pressureError;
      setPressureMeasurements(pressureData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculatePrescriptionStrength = (sphere, cylinder) => {
    return Math.abs(sphere || 0) + Math.abs(cylinder || 0);
  };

  const getSymptomTypeLabel = (type) => {
    const labels = {
      'dry_eyes': 'Dry Eyes',
      'eye_strain': 'Eye Strain',
      'headaches': 'Headaches',
      'blurred_vision': 'Blurred Vision',
      'double_vision': 'Double Vision',
      'light_sensitivity': 'Light Sensitivity',
      'eye_pain': 'Eye Pain',
      'redness': 'Redness',
      'tearing': 'Excessive Tearing',
      'itching': 'Itching',
      'burning': 'Burning Sensation',
      'foreign_body_sensation': 'Foreign Body Sensation'
    };
    return labels[type] || type;
  };

  const getSeverityColor = (severity) => {
    if (severity <= 3) return 'bg-green-500';
    if (severity <= 6) return 'bg-yellow-500';
    if (severity <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const convertVisualAcuityToDecimal = (acuity) => {
    if (!acuity || acuity === 'Unable to read') return 0;
    const match = acuity.match(/(\d+)\/(\d+)/);
    if (match) {
      return parseInt(match[2]) / parseInt(match[1]);
    }
    return 1;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Eye Health Analytics
          </h1>
          {profile && (
            <p className="text-gray-600 mt-1">
              {profile.name} ({profile.relationship}) - Health trends and patterns
            </p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'prescriptions', label: 'Prescription Trends', icon: '👓' },
              { id: 'vision', label: 'Visual Acuity', icon: '👁️' },
              { id: 'symptoms', label: 'Symptoms Pattern', icon: '📊' },
              { id: 'pressure', label: 'Eye Pressure', icon: '🔴' }
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
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Prescription Trends */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Prescription Changes Over Time</h3>
            
            {prescriptions.length > 0 ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{prescriptions.length}</div>
                    <div className="text-sm text-gray-600">Total Prescriptions</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {prescriptions[prescriptions.length - 1] ? 
                        calculatePrescriptionStrength(
                          prescriptions[prescriptions.length - 1].od_sphere,
                          prescriptions[prescriptions.length - 1].od_cylinder
                        ).toFixed(2) : '-'}
                    </div>
                    <div className="text-sm text-gray-600">Current OD Strength</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {prescriptions[prescriptions.length - 1] ? 
                        calculatePrescriptionStrength(
                          prescriptions[prescriptions.length - 1].os_sphere,
                          prescriptions[prescriptions.length - 1].os_cylinder
                        ).toFixed(2) : '-'}
                    </div>
                    <div className="text-sm text-gray-600">Current OS Strength</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {prescriptions.length > 1 ? 
                        Math.abs(
                          calculatePrescriptionStrength(
                            prescriptions[prescriptions.length - 1].od_sphere,
                            prescriptions[prescriptions.length - 1].od_cylinder
                          ) - 
                          calculatePrescriptionStrength(
                            prescriptions[prescriptions.length - 2].od_sphere,
                            prescriptions[prescriptions.length - 2].od_cylinder
                          )
                        ).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Last Change (OD)</div>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OD Sphere</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OD Cylinder</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS Sphere</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS Cylinder</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {prescriptions.map((prescription) => (
                        <tr key={prescription.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(prescription.prescription_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prescription.od_sphere?.toFixed(2) || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prescription.od_cylinder?.toFixed(2) || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prescription.os_sphere?.toFixed(2) || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prescription.os_cylinder?.toFixed(2) || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prescription.doctor_name || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No prescription data available</p>
              </div>
            )}
          </div>
        )}

        {/* Visual Acuity Tests */}
        {activeTab === 'vision' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Visual Acuity Test Results</h3>
            
            {visualTests.length > 0 ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{visualTests.length}</div>
                    <div className="text-sm text-gray-600">Total Tests</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {visualTests[visualTests.length - 1]?.od_result || '-'}
                    </div>
                    <div className="text-sm text-gray-600">Latest OD Result</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {visualTests[visualTests.length - 1]?.os_result || '-'}
                    </div>
                    <div className="text-sm text-gray-600">Latest OS Result</div>
                  </div>
                </div>

                {/* Test Results Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OD Result</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS Result</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Both Eyes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">With Correction</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {visualTests.map((test) => (
                        <tr key={test.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(test.test_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {test.test_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {test.od_result || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {test.os_result || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {test.binocular_result || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {test.with_correction ? 'Yes' : 'No'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No visual acuity test data available</p>
              </div>
            )}
          </div>
        )}

        {/* Symptoms Pattern */}
        {activeTab === 'symptoms' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Symptoms Pattern Analysis</h3>
            
            {symptoms.length > 0 ? (
              <div className="space-y-6">
                {/* Symptom Type Distribution */}
                <div>
                  <h4 className="text-md font-medium mb-3">Symptom Types</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(
                      symptoms.reduce((acc, symptom) => {
                        acc[symptom.symptom_type] = (acc[symptom.symptom_type] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([type, count]) => (
                      <div key={type} className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-gray-700">{count}</div>
                        <div className="text-xs text-gray-600">{getSymptomTypeLabel(type)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Severity Timeline */}
                <div>
                  <h4 className="text-md font-medium mb-3">Severity Over Time</h4>
                  <div className="space-y-2">
                    {symptoms.slice(-10).map((symptom) => (
                      <div key={symptom.id} className="flex items-center space-x-4">
                        <div className="w-24 text-sm text-gray-600">
                          {formatDate(symptom.symptom_date)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-32 text-sm text-gray-700">
                              {getSymptomTypeLabel(symptom.symptom_type)}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getSeverityColor(symptom.severity)}`}
                                style={{ width: `${(symptom.severity / 10) * 100}%` }}
                              ></div>
                            </div>
                            <div className="w-8 text-sm text-gray-600">
                              {symptom.severity}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Symptoms Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symptom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {symptoms.slice(-10).reverse().map((symptom) => (
                        <tr key={symptom.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(symptom.symptom_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getSymptomTypeLabel(symptom.symptom_type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              symptom.severity <= 3 ? 'bg-green-100 text-green-800' :
                              symptom.severity <= 6 ? 'bg-yellow-100 text-yellow-800' :
                              symptom.severity <= 8 ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {symptom.severity}/10
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {symptom.duration_minutes ? `${symptom.duration_minutes} min` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {symptom.trigger_activity || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No symptom data available</p>
              </div>
            )}
          </div>
        )}

        {/* Eye Pressure */}
        {activeTab === 'pressure' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Eye Pressure Measurements</h3>
            
            {pressureMeasurements.length > 0 ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{pressureMeasurements.length}</div>
                    <div className="text-sm text-gray-600">Total Measurements</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {pressureMeasurements[pressureMeasurements.length - 1]?.od_pressure || '-'}
                    </div>
                    <div className="text-sm text-gray-600">Latest OD (mmHg)</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {pressureMeasurements[pressureMeasurements.length - 1]?.os_pressure || '-'}
                    </div>
                    <div className="text-sm text-gray-600">Latest OS (mmHg)</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {pressureMeasurements.length > 0 ? 
                        (pressureMeasurements.reduce((sum, m) => sum + (m.od_pressure || 0) + (m.os_pressure || 0), 0) / (pressureMeasurements.length * 2)).toFixed(1) 
                        : '-'}
                    </div>
                    <div className="text-sm text-gray-600">Average (mmHg)</div>
                  </div>
                </div>

                {/* Measurements Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OD Pressure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS Pressure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Measured By</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pressureMeasurements.map((measurement) => (
                        <tr key={measurement.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(measurement.measurement_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {measurement.measurement_time || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`${
                              measurement.od_pressure > 21 ? 'text-red-600 font-semibold' :
                              measurement.od_pressure > 18 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {measurement.od_pressure ? `${measurement.od_pressure} mmHg` : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`${
                              measurement.os_pressure > 21 ? 'text-red-600 font-semibold' :
                              measurement.os_pressure > 18 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {measurement.os_pressure ? `${measurement.os_pressure} mmHg` : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {measurement.measurement_method || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {measurement.measured_by || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No eye pressure measurement data available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCharts;