import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { InfoTooltip } from '../Utils/InfoTooltip';

const PrescriptionForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { prescriptionId, profileId } = useParams();
  const isEditing = !!prescriptionId;

  const [formData, setFormData] = useState({
    profile_id: profileId || '',
    prescription_date: new Date().toISOString().split('T')[0],
    doctor_name: '',
    doctor_practice: '',
    doctor_phone: '',
    
    // Right Eye (OD)
    od_sphere: '',
    od_cylinder: '',
    od_axis: '',
    od_add: '',
    od_prism: '',
    od_base: '',
    
    // Left Eye (OS)
    os_sphere: '',
    os_cylinder: '',
    os_axis: '',
    os_add: '',
    os_prism: '',
    os_base: '',
    
    pupillary_distance: '',
    prescription_type: 'glasses',
    notes: '',
    prescription_image_url: ''
  });

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadProfiles();
      if (isEditing && prescriptionId) {
        loadPrescription();
      }
    }
  }, [user, isEditing, prescriptionId]);

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

  const loadPrescription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_061iy_prescriptions')
        .select('*')
        .eq('id', prescriptionId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          ...data,
          prescription_date: data.prescription_date || '',
          od_sphere: data.od_sphere || '',
          od_cylinder: data.od_cylinder || '',
          od_axis: data.od_axis || '',
          od_add: data.od_add || '',
          od_prism: data.od_prism || '',
          od_base: data.od_base || '',
          os_sphere: data.os_sphere || '',
          os_cylinder: data.os_cylinder || '',
          os_axis: data.os_axis || '',
          os_add: data.os_add || '',
          os_prism: data.os_prism || '',
          os_base: data.os_base || '',
          pupillary_distance: data.pupillary_distance || ''
        });
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      setError('Failed to load prescription data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert empty strings to null for numeric fields
      const prescriptionData = {
        ...formData,
        user_id: user.id,
        profile_id: formData.profile_id, // Keep as UUID string
        od_sphere: formData.od_sphere ? parseFloat(formData.od_sphere) : null,
        od_cylinder: formData.od_cylinder ? parseFloat(formData.od_cylinder) : null,
        od_axis: formData.od_axis ? parseInt(formData.od_axis) : null,
        od_add: formData.od_add ? parseFloat(formData.od_add) : null,
        od_prism: formData.od_prism ? parseFloat(formData.od_prism) : null,
        os_sphere: formData.os_sphere ? parseFloat(formData.os_sphere) : null,
        os_cylinder: formData.os_cylinder ? parseFloat(formData.os_cylinder) : null,
        os_axis: formData.os_axis ? parseInt(formData.os_axis) : null,
        os_add: formData.os_add ? parseFloat(formData.os_add) : null,
        os_prism: formData.os_prism ? parseFloat(formData.os_prism) : null,
        pupillary_distance: formData.pupillary_distance ? parseFloat(formData.pupillary_distance) : null
      };

      if (isEditing) {
        const { error } = await supabase
          .from('app_061iy_prescriptions')
          .update(prescriptionData)
          .eq('id', prescriptionId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('app_061iy_prescriptions')
          .insert([prescriptionData]);

        if (error) throw error;
      }

      navigate(`/profiles/${formData.profile_id}/metrics`);
    } catch (error) {
      console.error('Error saving prescription:', error);
      setError('Failed to save prescription. Please try again.');
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
            {isEditing ? 'Edit Prescription' : 'Add New Prescription'}
          </h1>
          <p className="text-gray-600 mt-1">
            Enter prescription details from your eye exam
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
                  Prescription Date *
                </label>
                <input
                  type="date"
                  name="prescription_date"
                  value={formData.prescription_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Name
                </label>
                <input
                  type="text"
                  name="doctor_name"
                  value={formData.doctor_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practice/Clinic
                </label>
                <input
                  type="text"
                  name="doctor_practice"
                  value={formData.doctor_practice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Eye Care Center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Phone
                </label>
                <input
                  type="tel"
                  name="doctor_phone"
                  value={formData.doctor_phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescription Type
                </label>
                <select
                  name="prescription_type"
                  value={formData.prescription_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="glasses">Glasses</option>
                  <option value="contacts">Contact Lenses</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>

          {/* Eye Prescription Values */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Prescription Values</h3>
            
            {/* Headers */}
            <div className="grid grid-cols-7 gap-2 text-sm font-medium text-gray-700">
              <div></div>
              <div className="text-center">Sphere (SPH) <InfoTooltip text="Lens power for nearsightedness or farsightedness." /></div>
              <div className="text-center">Cylinder (CYL) <InfoTooltip text="Lens power for astigmatism correction." /></div>
              <div className="text-center">Axis <InfoTooltip text="Orientation of astigmatism correction (degrees 0–180)." /></div>
              <div className="text-center">Add <InfoTooltip text="Additional lens power for reading (presbyopia)." /></div>
              <div className="text-center">Prism <InfoTooltip text="Lens power to correct eye alignment issues." /></div>
              <div className="text-center">Base <InfoTooltip text="Direction of prism (up, down, in, out)." /></div>
            </div>

            {/* Right Eye (OD) */}
            <div className="grid grid-cols-7 gap-2 items-center">
              <div className="font-medium text-gray-700">Right Eye (OD)</div>
              <input
                type="number"
                name="od_sphere"
                value={formData.od_sphere}
                onChange={handleInputChange}
                step="0.25"
                min="-20"
                max="20"
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <input
                type="number"
                name="od_cylinder"
                value={formData.od_cylinder}
                onChange={handleInputChange}
                step="0.25"
                min="-10"
                max="10"
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <input
                type="number"
                name="od_axis"
                value={formData.od_axis}
                onChange={handleInputChange}
                min="0"
                max="180"
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <input
                type="number"
                name="od_add"
                value={formData.od_add}
                onChange={handleInputChange}
                step="0.25"
                min="0"
                max="5"
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <input
                type="number"
                name="od_prism"
                value={formData.od_prism}
                onChange={handleInputChange}
                step="0.25"
                min="0"
                max="10"
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <select
                name="od_base"
                value={formData.od_base}
                onChange={handleInputChange}
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
                <option value="UP">UP</option>
                <option value="DOWN">DOWN</option>
              </select>
            </div>

            {/* Left Eye (OS) */}
            <div className="grid grid-cols-7 gap-2 items-center">
              <div className="font-medium text-gray-700">Left Eye (OS)</div>
              <input
                type="number"
                name="os_sphere"
                value={formData.os_sphere}
                onChange={handleInputChange}
                step="0.25"
                min="-20"
                max="20"
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <input
                type="number"
                name="os_cylinder"
                value={formData.os_cylinder}
                onChange={handleInputChange}
                step="0.25"
                min="-10"
                max="10"
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <input
                type="number"
                name="os_axis"
                value={formData.os_axis}
                onChange={handleInputChange}
                min="0"
                max="180"
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <input
                type="number"
                name="os_add"
                value={formData.os_add}
                onChange={handleInputChange}
                step="0.25"
                min="0"
                max="5"
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <input
                type="number"
                name="os_prism"
                value={formData.os_prism}
                onChange={handleInputChange}
                step="0.25"
                min="0"
                max="10"
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <select
                name="os_base"
                value={formData.os_base}
                onChange={handleInputChange}
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
                <option value="UP">UP</option>
                <option value="DOWN">DOWN</option>
              </select>
            </div>

            {/* Pupillary Distance */}
            <div className="grid grid-cols-7 gap-2 items-center">
              <div className="font-medium text-gray-700">Pupillary Distance (PD)</div>
              <input
                type="number"
                name="pupillary_distance"
                value={formData.pupillary_distance}
                onChange={handleInputChange}
                step="0.5"
                min="50"
                max="80"
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="63.0"
              />
              <div className="col-span-5 text-sm text-gray-500 pl-2">
                mm (distance between pupils)
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Additional Notes</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes about this prescription..."
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
              {loading ? 'Saving...' : (isEditing ? 'Update Prescription' : 'Save Prescription')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;