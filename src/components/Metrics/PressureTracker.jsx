import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const EyePressureForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profileId, recordId } = useParams();
  const isEditing = !!recordId;

  const [formData, setFormData] = useState({
    profile_id: profileId || '',
    measurement_date: new Date().toISOString().split('T')[0],
    measurement_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    od_pressure: '',
    os_pressure: '',
    measurement_method: '',
    measured_by: '',
    location: '',
    notes: ''
  });

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadProfiles();
      if (isEditing && recordId) {
        loadRecord();
      }
    }
  }, [user, isEditing, recordId]);

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

  const loadRecord = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_061iy_eye_pressure')
        .select('*')
        .eq('id', recordId)
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      if (data) {
        setFormData({
          ...data,
          measurement_date: data.measurement_date || '',
          measurement_time: data.measurement_time || ''
        });
      }
    } catch (error) {
      console.error('Error loading record:', error);
      setError('Failed to load eye pressure record');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const recordData = {
        ...formData,
        user_id: user.id,
        profile_id: formData.profile_id,
        od_pressure: formData.od_pressure ? parseFloat(formData.od_pressure) : null,
        os_pressure: formData.os_pressure ? parseFloat(formData.os_pressure) : null
      };

      if (isEditing) {
        const { error } = await supabase
          .from('app_061iy_eye_pressure')
          .update(recordData)
          .eq('id', recordId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('app_061iy_eye_pressure')
          .insert([recordData]);
        if (error) throw error;
      }

      navigate(`/profiles/${formData.profile_id}/metrics`);
    } catch (error) {
      console.error('Error saving eye pressure record:', error);
      setError('Failed to save record. Please try again.');
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Eye Pressure Record' : 'Add Eye Pressure Measurement'}
          </h1>
          <p className="text-gray-600 mt-1">Track intraocular pressure for your profile</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  name="measurement_date"
                  value={formData.measurement_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                <input
                  type="time"
                  name="measurement_time"
                  value={formData.measurement_time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Clinic, Home, etc."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Pressure Measurements (mmHg)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Right Eye (OD) *</label>
                <input
                  type="number"
                  name="od_pressure"
                  value={formData.od_pressure}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Left Eye (OS) *</label>
                <input
                  type="number"
                  name="os_pressure"
                  value={formData.os_pressure}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Measurement Method</label>
                <input
                  type="text"
                  name="measurement_method"
                  value={formData.measurement_method}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Tonometry, Non-contact"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Measured By</label>
                <input
                  type="text"
                  name="measured_by"
                  value={formData.measured_by}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name of clinician or self"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any observations, comments, or details..."
              />
            </div>
          </div>

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
              {loading ? 'Saving...' : isEditing ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EyePressureForm;
