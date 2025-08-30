import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const VisualAcuityTest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profileId, testId } = useParams();
  const isEditing = !!testId;

  const [formData, setFormData] = useState({
    profile_id: profileId || '',
    test_date: new Date().toISOString().split('T')[0],
    test_type: 'snellen',
    test_distance: '20ft',
    od_result: '',
    os_result: '',
    binocular_result: '',
    with_correction: false,
    lighting_conditions: '',
    notes: ''
  });

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentEye, setCurrentEye] = useState('od'); // od, os, binocular
  const [testInProgress, setTestInProgress] = useState(false);

  // Snellen chart lines (20/400 to 20/10)
  const snellenChart = [
    { line: '20/400', size: '4rem', letters: ['E'] },
    { line: '20/200', size: '3rem', letters: ['F', 'P'] },
    { line: '20/100', size: '2.5rem', letters: ['T', 'O', 'Z'] },
    { line: '20/70', size: '2rem', letters: ['L', 'P', 'E', 'D'] },
    { line: '20/50', size: '1.5rem', letters: ['P', 'E', 'C', 'F', 'D'] },
    { line: '20/40', size: '1.25rem', letters: ['E', 'D', 'F', 'C', 'Z', 'P'] },
    { line: '20/30', size: '1rem', letters: ['F', 'E', 'L', 'O', 'P', 'Z', 'D'] },
    { line: '20/25', size: '0.875rem', letters: ['D', 'E', 'P', 'O', 'T', 'E', 'C'] },
    { line: '20/20', size: '0.75rem', letters: ['L', 'E', 'F', 'P', 'O', 'T', 'E', 'C'] },
    { line: '20/15', size: '0.625rem', letters: ['P', 'E', 'Z', 'O', 'L', 'C', 'F', 'T', 'D'] },
    { line: '20/10', size: '0.5rem', letters: ['P', 'E', 'C', 'L', 'O', 'F', 'D', 'Z', 'T'] }
  ];

  useEffect(() => {
    if (user) {
      loadProfiles();
      if (isEditing && testId) {
        loadTest();
      }
    }
  }, [user, isEditing, testId]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('app_061iy_profiles')
        .select('id, name, relationship')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const loadTest = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_061iy_visual_tests')
        .select('*')
        .eq('id', testId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          ...data,
          test_date: data.test_date || '',
          profile_id: data.profile_id || ''
        });
      }
    } catch (error) {
      console.error('Error loading test:', error);
      setError('Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleResultSelect = (result) => {
    const fieldName = currentEye === 'od' ? 'od_result' : 
                     currentEye === 'os' ? 'os_result' : 'binocular_result';
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: result
    }));
    
    setTestInProgress(false);
  };

  const startTest = (eye) => {
    setCurrentEye(eye);
    setTestInProgress(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const testData = {
        ...formData,
        user_id: user.id,
        profile_id: formData.profile_id
      };

      if (isEditing) {
        const { error } = await supabase
          .from('app_061iy_visual_tests')
          .update(testData)
          .eq('id', testId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('app_061iy_visual_tests')
          .insert([testData]);

        if (error) throw error;
      }

      navigate(`/profiles/${formData.profile_id}/metrics`);
    } catch (error) {
      console.error('Error saving test:', error);
      setError('Failed to save test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Visual Acuity Test' : 'Visual Acuity Test'}
          </h1>
          <p className="text-gray-600 mt-1">
            Test and record visual acuity measurements
          </p>
        </div>

        {/* Test Interface */}
        {testInProgress ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Testing {currentEye === 'od' ? 'Right Eye (OD)' : 
                        currentEye === 'os' ? 'Left Eye (OS)' : 'Both Eyes'}
              </h2>
              <p className="text-gray-600">
                {currentEye !== 'binocular' ? 
                  `Cover the ${currentEye === 'od' ? 'left' : 'right'} eye and read the smallest line you can see clearly` :
                  'Use both eyes to read the smallest line you can see clearly'
                }
              </p>
            </div>

            {/* Snellen Chart */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-8 mb-6" style={{ minHeight: '400px' }}>
              <div className="text-center space-y-4">
                {snellenChart.map((line, index) => (
                  <div key={index} className="cursor-pointer hover:bg-gray-50 p-2 rounded" 
                       onClick={() => handleResultSelect(line.line)}>
                    <div className="mb-1">
                      <span className="text-xs text-gray-500">{line.line}</span>
                    </div>
                    <div style={{ fontSize: line.size, fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {line.letters.join(' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Result Buttons */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {['20/400', '20/200', '20/100', '20/70', '20/50', '20/40', '20/30', '20/25', '20/20', '20/15', '20/10'].map(result => (
                <button
                  key={result}
                  onClick={() => handleResultSelect(result)}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm transition-colors"
                >
                  {result}
                </button>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setTestInProgress(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel Test
              </button>
              <button
                onClick={() => handleResultSelect('Unable to read')}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Unable to Read
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Test Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile *
                  </label>
                  <select
                    name="profile_id"
                    value={formData.profile_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a profile</option>
                    {profiles.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} ({profile.relationship})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Date *
                  </label>
                  <input
                    type="date"
                    name="test_date"
                    value={formData.test_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Type
                  </label>
                  <select
                    name="test_type"
                    value={formData.test_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="snellen">Snellen Chart</option>
                    <option value="logmar">LogMAR</option>
                    <option value="jaeger">Jaeger</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Distance
                  </label>
                  <select
                    name="test_distance"
                    value={formData.test_distance}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="20ft">20 feet</option>
                    <option value="6m">6 meters</option>
                    <option value="14in">14 inches (near)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="with_correction"
                  checked={formData.with_correction}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  With correction (glasses/contacts)
                </label>
              </div>
            </div>

            {/* Test Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Right Eye (OD)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="od_result"
                      value={formData.od_result}
                      onChange={handleInputChange}
                      placeholder="e.g., 20/20"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => startTest('od')}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Test
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Left Eye (OS)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="os_result"
                      value={formData.os_result}
                      onChange={handleInputChange}
                      placeholder="e.g., 20/20"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => startTest('os')}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Test
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Both Eyes
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="binocular_result"
                      value={formData.binocular_result}
                      onChange={handleInputChange}
                      placeholder="e.g., 20/20"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => startTest('binocular')}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Test
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lighting Conditions
                </label>
                <input
                  type="text"
                  name="lighting_conditions"
                  value={formData.lighting_conditions}
                  onChange={handleInputChange}
                  placeholder="e.g., Normal room lighting, Bright, Dim"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional observations or notes..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Test' : 'Save Test')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VisualAcuityTest;