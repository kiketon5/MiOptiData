import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getAllProfiles } from '../../utils/api';

const MedicationTracker = () => {
  const { user } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    profileId: '',
    name: '',
    type: '',
    dosage: '',
    frequency: '',
    duration: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    purpose: '',
    instructions: '',
    sideEffects: '',
    refillReminder: true,
    reminderDays: 7
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const profilesData = await getAllProfiles();
      setProfiles(profilesData);
      
      // Load medications from localStorage
      const stored = localStorage.getItem('MiOptiDataMedications');
      const medicationsData = stored ? JSON.parse(stored) : [];
      
      // Mock some medications for demo
      const mockMedications = [
        {
          id: '1',
          profileId: '1',
          name: 'Artificial Tears',
          type: 'eye-drops',
          dosage: '1-2 drops',
          frequency: '4 times daily',
          duration: 'ongoing',
          startDate: '2024-01-15',
          endDate: '',
          prescribedBy: 'Dr. Sarah Johnson',
          purpose: 'Dry eye relief',
          instructions: 'Apply to both eyes as needed',
          sideEffects: 'None reported',
          refillReminder: true,
          reminderDays: 7,
          lastTaken: '2024-08-27T08:00:00Z',
          adherenceScore: 85
        },
        {
          id: '2',
          profileId: '2',
          name: 'Omega-3 Supplements',
          type: 'supplement',
          dosage: '1000mg',
          frequency: 'Once daily',
          duration: '6 months',
          startDate: '2024-02-01',
          endDate: '2024-08-01',
          prescribedBy: 'Dr. Michael Chen',
          purpose: 'Eye health support',
          instructions: 'Take with food',
          sideEffects: 'Mild stomach upset',
          refillReminder: true,
          reminderDays: 14,
          lastTaken: '2024-08-26T20:00:00Z',
          adherenceScore: 92
        }
      ];

      const allMedications = [...mockMedications, ...medicationsData];
      setMedications(allMedications);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const medicationData = {
        ...formData,
        id: editingMedication ? editingMedication.id : Date.now().toString(),
        createdAt: editingMedication ? editingMedication.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        adherenceScore: editingMedication ? editingMedication.adherenceScore : 100
      };

      let updatedMedications;
      if (editingMedication) {
        updatedMedications = medications.map(med => 
          med.id === editingMedication.id ? medicationData : med
        );
      } else {
        updatedMedications = [...medications, medicationData];
      }

      setMedications(updatedMedications);
      
      // Save to localStorage (exclude mock medications)
      const userMedications = updatedMedications.filter(med => !['1', '2'].includes(med.id));
      localStorage.setItem('MiOptiDataMedications', JSON.stringify(userMedications));

      resetForm();
    } catch (error) {
      console.error('Error saving medication:', error);
    }
  };

  const handleEdit = (medication) => {
    setEditingMedication(medication);
    setFormData({
      profileId: medication.profileId,
      name: medication.name,
      type: medication.type,
      dosage: medication.dosage,
      frequency: medication.frequency,
      duration: medication.duration,
      startDate: medication.startDate,
      endDate: medication.endDate || '',
      prescribedBy: medication.prescribedBy || '',
      purpose: medication.purpose || '',
      instructions: medication.instructions || '',
      sideEffects: medication.sideEffects || '',
      refillReminder: medication.refillReminder,
      reminderDays: medication.reminderDays || 7
    });
    setShowAddForm(true);
  };

  const handleDelete = (medicationId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      const updatedMedications = medications.filter(med => med.id !== medicationId);
      setMedications(updatedMedications);
      
      // Update localStorage
      const userMedications = updatedMedications.filter(med => !['1', '2'].includes(med.id));
      localStorage.setItem('MiOptiDataMedications', JSON.stringify(userMedications));
    }
  };

  const markAsTaken = (medicationId) => {
    const updatedMedications = medications.map(med => {
      if (med.id === medicationId) {
        return {
          ...med,
          lastTaken: new Date().toISOString(),
          adherenceScore: Math.min(100, (med.adherenceScore || 0) + 2)
        };
      }
      return med;
    });
    
    setMedications(updatedMedications);
    
    // Update localStorage
    const userMedications = updatedMedications.filter(med => !['1', '2'].includes(med.id));
    localStorage.setItem('MiOptiDataMedications', JSON.stringify(userMedications));
  };

  const resetForm = () => {
    setFormData({
      profileId: '',
      name: '',
      type: '',
      dosage: '',
      frequency: '',
      duration: '',
      startDate: '',
      endDate: '',
      prescribedBy: '',
      purpose: '',
      instructions: '',
      sideEffects: '',
      refillReminder: true,
      reminderDays: 7
    });
    setEditingMedication(null);
    setShowAddForm(false);
  };

  const getMedicationIcon = (type) => {
    const icons = {
      'eye-drops': '💧',
      'tablet': '💊',
      'capsule': '💊',
      'supplement': '🌿',
      'injection': '💉',
      'ointment': '🧴',
      'other': '⚕️'
    };
    return icons[type] || '💊';
  };

  const getAdherenceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfileName = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile ? profile.name : 'Unknown';
  };

  const isRefillDue = (medication) => {
    if (!medication.endDate || !medication.refillReminder) return false;
    
    const endDate = new Date(medication.endDate);
    const reminderDate = new Date(endDate);
    reminderDate.setDate(reminderDate.getDate() - (medication.reminderDays || 7));
    
    return new Date() >= reminderDate;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Medication Tracker</h2>
          <p className="text-gray-600">Track medications, supplements, and eye drops</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + Add Medication
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">
                {medications.filter(m => !m.endDate || new Date(m.endDate) > new Date()).length}
              </p>
            </div>
            <div className="text-blue-500">💊</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Adherence</p>
              <p className="text-2xl font-bold text-gray-900">
                {medications.length > 0 
                  ? Math.round(medications.reduce((acc, m) => acc + (m.adherenceScore || 0), 0) / medications.length)
                  : 0}%
              </p>
            </div>
            <div className="text-green-500">📈</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Refills Due</p>
              <p className="text-2xl font-bold text-gray-900">
                {medications.filter(isRefillDue).length}
              </p>
            </div>
            <div className="text-yellow-500">🔔</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Eye Drops</p>
              <p className="text-2xl font-bold text-gray-900">
                {medications.filter(m => m.type === 'eye-drops').length}
              </p>
            </div>
            <div className="text-purple-500">💧</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingMedication ? 'Edit Medication' : 'Add Medication'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Profile *
                  </label>
                  <select
                    required
                    value={formData.profileId}
                    onChange={(e) => setFormData({...formData, profileId: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select profile</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} ({profile.relationship})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Artificial Tears, Vitamins"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="eye-drops">Eye Drops</option>
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="supplement">Supplement</option>
                    <option value="injection">Injection</option>
                    <option value="ointment">Ointment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1-2 drops, 500mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency *
                  </label>
                  <select
                    required
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select frequency</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="3 times daily">3 times daily</option>
                    <option value="4 times daily">4 times daily</option>
                    <option value="As needed">As needed</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescribed By
                  </label>
                  <input
                    type="text"
                    value={formData.prescribedBy}
                    onChange={(e) => setFormData({...formData, prescribedBy: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Doctor's name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose/Condition
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Dry eye relief, Glaucoma treatment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Special instructions for taking this medication..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Side Effects
                </label>
                <textarea
                  value={formData.sideEffects}
                  onChange={(e) => setFormData({...formData, sideEffects: e.target.value})}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Any side effects experienced..."
                />
              </div>

              {/* Refill Reminder Settings */}
              <div className="border-t pt-4">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="refillReminder"
                    checked={formData.refillReminder}
                    onChange={(e) => setFormData({...formData, refillReminder: e.target.checked})}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="refillReminder" className="ml-2 text-sm font-medium text-gray-700">
                    Enable refill reminders
                  </label>
                </div>

                {formData.refillReminder && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remind me (days before end date)
                    </label>
                    <select
                      value={formData.reminderDays}
                      onChange={(e) => setFormData({...formData, reminderDays: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={3}>3 days</option>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingMedication ? 'Update Medication' : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medications List */}
      {medications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medications tracked</h3>
          <p className="text-gray-600 mb-6">Start by adding your first medication or supplement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((medication) => (
            <div
              key={medication.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getMedicationIcon(medication.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{medication.type.replace('-', ' ')}</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(medication)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(medication.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span className="font-medium">Patient:</span>
                  <span>{getProfileName(medication.profileId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Dosage:</span>
                  <span>{medication.dosage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Frequency:</span>
                  <span>{medication.frequency}</span>
                </div>
                {medication.adherenceScore !== undefined && (
                  <div className="flex justify-between">
                    <span className="font-medium">Adherence:</span>
                    <span className={getAdherenceColor(medication.adherenceScore)}>
                      {medication.adherenceScore}%
                    </span>
                  </div>
                )}
              </div>

              {/* Refill Alert */}
              {isRefillDue(medication) && (
                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Refill due soon
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => markAsTaken(medication.id)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark as Taken
                </button>
                {medication.lastTaken && (
                  <div className="text-xs text-gray-500 flex items-center">
                    Last: {new Date(medication.lastTaken).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationTracker;