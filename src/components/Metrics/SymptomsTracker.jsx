import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const SymptomsTracker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profileId, symptomId } = useParams();
  const isEditing = !!symptomId;

  const [formData, setFormData] = useState({
    profile_id: profileId || '',
    symptom_date: new Date().toISOString().split('T')[0],
    symptom_type: 'dry_eyes',
    severity: 5,
    duration_minutes: '',
    trigger_activity: '',
    time_of_day: '',
    environmental_factors: [],
    treatment_used: '',
    relief_obtained: false,
    notes: ''
  });

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const symptomTypes = [
    { value: 'dry_eyes', label: 'Dry Eyes', icon: '💧' },
    { value: 'eye_strain', label: 'Eye Strain', icon: '😵' },
    { value: 'headaches', label: 'Headaches', icon: '🤕' },
    { value: 'blurred_vision', label: 'Blurred Vision', icon: '👁️' },
    { value: 'double_vision', label: 'Double Vision', icon: '👀' },
    { value: 'light_sensitivity', label: 'Light Sensitivity', icon: '☀️' },
    { value: 'eye_pain', label: 'Eye Pain', icon: '😣' },
    { value: 'redness', label: 'Redness', icon: '🔴' },
    { value: 'tearing', label: 'Excessive Tearing', icon: '😢' },
    { value: 'itching', label: 'Itching', icon: '🤏' },
    { value: 'burning', label: 'Burning Sensation', icon: '🔥' },
    { value: 'foreign_body_sensation', label: 'Foreign Body Sensation', icon: '👁️‍🗨️' }
  ];

  const environmentalFactors = [
    'Air conditioning', 'Wind', 'Dust', 'Smoke', 'Pollen', 'Bright lights',
    'Computer screen', 'Reading', 'Driving', 'Outdoor activities', 'Indoor heating',
    'Low humidity', 'High humidity', 'Chemical exposure', 'Makeup/cosmetics'
  ];

  const timeOptions = [
    'Early morning', 'Morning', 'Late morning', 'Noon', 'Afternoon',
    'Late afternoon', 'Evening', 'Night', 'Late night'
  ];

  useEffect(() => {
    if (user) {
      loadProfiles();
      if (isEditing && symptomId) {
        loadSymptom();
      }
    }
  }, [user, isEditing, symptomId]);

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

  const loadSymptom = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_061iy_symptoms')
        .select('*')
        .eq('id', symptomId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          ...data,
          symptom_date: data.symptom_date || '',
          environmental_factors: data.environmental_factors || []
        });
      }
    } catch (error) {
      console.error('Error loading symptom:', error);
      setError('Failed to load symptom data');
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

  const handleEnvironmentalFactorToggle = (factor) => {
    setFormData(prev => ({
      ...prev,
      environmental_factors: prev.environmental_factors.includes(factor)
        ? prev.environmental_factors.filter(f => f !== factor)
        : [...prev.environmental_factors, factor]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const symptomData = {
        ...formData,
        user_id: user.id,
        profile_id: formData.profile_id,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null
      };

      if (isEditing) {
        const { error } = await supabase
          .from('app_061iy_symptoms')
          .update(symptomData)
          .eq('id', symptomId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('app_061iy_symptoms')
          .insert([symptomData]);

        if (error) throw error;
      }

      navigate(`/profiles/${formData.profile_id}/metrics`);
    } catch (error) {
      console.error('Error saving symptom:', error);
      setError('Failed to save symptom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity <= 3) return 'text-green-600';
    if (severity <= 6) return 'text-yellow-600';
    if (severity <= 8) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSeverityLabel = (severity) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    if (severity <= 8) return 'Severe';
    return 'Very Severe';
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
            {isEditing ? 'Edit Symptom Record' : 'Track Eye Symptoms'}
          </h1>
          <p className="text-gray-600 mt-1">
            Record and track eye-related symptoms and discomfort
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
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
                  Date *
                </label>
                <input
                  type="date"
                  name="symptom_date"
                  value={formData.symptom_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Symptom Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Symptom Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Symptom Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {symptomTypes.map(type => (
                  <label key={type.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="symptom_type"
                      value={type.value}
                      checked={formData.symptom_type === type.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                      formData.symptom_type === type.value 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity * (1-10)
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  name="severity"
                  min="1"
                  max="10"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1 (Mild)</span>
                  <span className={`font-medium ${getSeverityColor(formData.severity)}`}>
                    {formData.severity} - {getSeverityLabel(formData.severity)}
                  </span>
                  <span>10 (Very Severe)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time of Day
                </label>
                <select
                  name="time_of_day"
                  value={formData.time_of_day}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select time</option>
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Context */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Context & Triggers</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trigger Activity
              </label>
              <input
                type="text"
                name="trigger_activity"
                value={formData.trigger_activity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Computer work, Reading, Driving"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Environmental Factors
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {environmentalFactors.map(factor => (
                  <label key={factor} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.environmental_factors.includes(factor)}
                      onChange={() => handleEnvironmentalFactorToggle(factor)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{factor}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Treatment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Treatment & Relief</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treatment Used
              </label>
              <input
                type="text"
                name="treatment_used"
                value={formData.treatment_used}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Eye drops, Rest, Cold compress"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="relief_obtained"
                checked={formData.relief_obtained}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Relief was obtained from treatment
              </label>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional observations, patterns, or details..."
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
              {loading ? 'Saving...' : (isEditing ? 'Update Symptom' : 'Save Symptom')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SymptomsTracker;