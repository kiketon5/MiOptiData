import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const PrescriptionHistory = () => {
  const { user } = useAuth();
  const { profileId } = useParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && profileId) {
      loadProfile();
      loadPrescriptions();
    }
  }, [user, profileId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('app_061iy_profiles')
        .select('*')
        .eq('id', profileId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile information');
    }
  };

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_061iy_prescriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .order('prescription_date', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setError('Failed to load prescription history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (prescriptionId) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        const { error } = await supabase
          .from('app_061iy_prescriptions')
          .delete()
          .eq('id', prescriptionId)
          .eq('user_id', user.id);

        if (error) throw error;
        setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
      } catch (error) {
        console.error('Error deleting prescription:', error);
        alert('Failed to delete prescription. Please try again.');
      }
    }
  };

  const formatPrescriptionValue = (value) => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculatePrescriptionStrength = (sphere, cylinder) => {
    const sph = sphere || 0;
    const cyl = cylinder || 0;
    return Math.abs(sph) + Math.abs(cyl);
  };

  const comparePrescriptions = (current, previous) => {
    if (!previous) return null;

    const changes = [];
    
    // Compare OD values
    if (current.od_sphere !== previous.od_sphere) {
      const diff = (current.od_sphere || 0) - (previous.od_sphere || 0);
      changes.push(`OD Sphere: ${diff > 0 ? '+' : ''}${diff.toFixed(2)}`);
    }
    
    if (current.od_cylinder !== previous.od_cylinder) {
      const diff = (current.od_cylinder || 0) - (previous.od_cylinder || 0);
      changes.push(`OD Cylinder: ${diff > 0 ? '+' : ''}${diff.toFixed(2)}`);
    }

    // Compare OS values
    if (current.os_sphere !== previous.os_sphere) {
      const diff = (current.os_sphere || 0) - (previous.os_sphere || 0);
      changes.push(`OS Sphere: ${diff > 0 ? '+' : ''}${diff.toFixed(2)}`);
    }
    
    if (current.os_cylinder !== previous.os_cylinder) {
      const diff = (current.os_cylinder || 0) - (previous.os_cylinder || 0);
      changes.push(`OS Cylinder: ${diff > 0 ? '+' : ''}${diff.toFixed(2)}`);
    }

    return changes;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Prescription History
              </h1>
              {profile && (
                <p className="text-gray-600 mt-1">
                  {profile.name} ({profile.relationship})
                </p>
              )}
            </div>
            <Link
              to={`/profiles/${profileId}/prescriptions/new`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Add New Prescription
            </Link>
          </div>
        </div>

        {/* Summary Stats */}
        {prescriptions.length > 0 && (
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{prescriptions.length}</div>
                <div className="text-sm text-gray-600">Total Prescriptions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {prescriptions[0] ? formatDate(prescriptions[0].prescription_date) : '-'}
                </div>
                <div className="text-sm text-gray-600">Latest Prescription</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {prescriptions[0] ? calculatePrescriptionStrength(prescriptions[0].od_sphere, prescriptions[0].od_cylinder).toFixed(2) : '-'}
                </div>
                <div className="text-sm text-gray-600">OD Strength</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {prescriptions[0] ? calculatePrescriptionStrength(prescriptions[0].os_sphere, prescriptions[0].os_cylinder).toFixed(2) : '-'}
                </div>
                <div className="text-sm text-gray-600">OS Strength</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions yet</h3>
          <p className="text-gray-500 mb-4">Add your first prescription to start tracking changes over time</p>
          <Link
            to={`/profiles/${profileId}/prescriptions/new`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Add First Prescription
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((prescription, index) => {
            const previousPrescription = prescriptions[index + 1];
            const changes = comparePrescriptions(prescription, previousPrescription);

            return (
              <div key={prescription.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Prescription Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatDate(prescription.prescription_date)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {prescription.doctor_name && `Dr. ${prescription.doctor_name}`}
                          {prescription.doctor_practice && ` - ${prescription.doctor_practice}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        prescription.prescription_type === 'glasses' ? 'bg-blue-100 text-blue-800' :
                        prescription.prescription_type === 'contacts' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {prescription.prescription_type.charAt(0).toUpperCase() + prescription.prescription_type.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/profiles/${profileId}/prescriptions/${prescription.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(prescription.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Changes from previous prescription */}
                  {changes && changes.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm font-medium text-yellow-800 mb-1">Changes from previous:</p>
                      <div className="flex flex-wrap gap-2">
                        {changes.map((change, idx) => (
                          <span key={idx} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            {change}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Prescription Values */}
                <div className="px-6 py-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-700"></th>
                          <th className="text-center py-2 font-medium text-gray-700">Sphere</th>
                          <th className="text-center py-2 font-medium text-gray-700">Cylinder</th>
                          <th className="text-center py-2 font-medium text-gray-700">Axis</th>
                          <th className="text-center py-2 font-medium text-gray-700">Add</th>
                          <th className="text-center py-2 font-medium text-gray-700">Prism</th>
                          <th className="text-center py-2 font-medium text-gray-700">Base</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 font-medium text-gray-700">Right Eye (OD)</td>
                          <td className="text-center py-3">{formatPrescriptionValue(prescription.od_sphere)}</td>
                          <td className="text-center py-3">{formatPrescriptionValue(prescription.od_cylinder)}</td>
                          <td className="text-center py-3">{prescription.od_axis || '-'}</td>
                          <td className="text-center py-3">{formatPrescriptionValue(prescription.od_add)}</td>
                          <td className="text-center py-3">{formatPrescriptionValue(prescription.od_prism)}</td>
                          <td className="text-center py-3">{prescription.od_base || '-'}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 font-medium text-gray-700">Left Eye (OS)</td>
                          <td className="text-center py-3">{formatPrescriptionValue(prescription.os_sphere)}</td>
                          <td className="text-center py-3">{formatPrescriptionValue(prescription.os_cylinder)}</td>
                          <td className="text-center py-3">{prescription.os_axis || '-'}</td>
                          <td className="text-center py-3">{formatPrescriptionValue(prescription.os_add)}</td>
                          <td className="text-center py-3">{formatPrescriptionValue(prescription.os_prism)}</td>
                          <td className="text-center py-3">{prescription.os_base || '-'}</td>
                        </tr>
                        {prescription.pupillary_distance && (
                          <tr>
                            <td className="py-3 font-medium text-gray-700">Pupillary Distance</td>
                            <td className="text-center py-3">{prescription.pupillary_distance} mm</td>
                            <td className="text-center py-3 text-gray-400" colSpan="5">-</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Additional Information */}
                  {(prescription.doctor_phone || prescription.notes) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {prescription.doctor_phone && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Doctor Phone:</span> {prescription.doctor_phone}
                        </p>
                      )}
                      {prescription.notes && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Notes:</span>
                          <p className="text-sm text-gray-600 mt-1">{prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PrescriptionHistory;