import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProfile, getMetrics, deleteMetric } from '../../utils/api';
import { formatDate, formatDateTime, calculateAge } from '../../utils/dateUtils';

const MetricsHistory = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [metricToDelete, setMetricToDelete] = useState(null);
  
  // Fetch profile and metrics data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile data
        const profileData = await getProfile(profileId);
        setProfile(profileData);
        
        // Fetch metrics data
        const metricsData = await getMetrics(profileId);
        
        // Sort metrics by date (newest first)
        const sortedMetrics = metricsData.sort((a, b) => 
          new Date(b.recordDate) - new Date(a.recordDate)
        );
        
        setMetrics(sortedMetrics);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [profileId]);
  
  // Filter metrics based on active tab
  const filteredMetrics = metrics.filter(metric => {
    if (activeTab === 'all') return true;
    return metric.recordType === activeTab;
  });
  
  // Handler for showing metric details
  const showMetricDetails = (metric) => {
    setSelectedMetric(metric);
  };
  
  // Handler for delete confirmation
  const openDeleteModal = (metric, e) => {
    e.stopPropagation(); // Prevent triggering the row click
    setMetricToDelete(metric);
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setMetricToDelete(null);
  };
  
  const confirmDelete = async () => {
    if (!metricToDelete) return;
    
    try {
      await deleteMetric(metricToDelete.id);
      
      // Update metrics list after deletion
      setMetrics(prevMetrics => 
        prevMetrics.filter(metric => metric.id !== metricToDelete.id)
      );
      
      // Close modal and clear selected metric if it was deleted
      closeDeleteModal();
      if (selectedMetric && selectedMetric.id === metricToDelete.id) {
        setSelectedMetric(null);
      }
    } catch (err) {
      console.error('Error deleting metric:', err);
      setError('Failed to delete record. Please try again later.');
      closeDeleteModal();
    }
  };
  
  // Render prescription details
  const renderPrescriptionDetails = (data) => {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Right Eye (OD)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Sphere (SPH)</p>
              <p className="font-medium">{data.rightSphere}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cylinder (CYL)</p>
              <p className="font-medium">{data.rightCylinder}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Axis</p>
              <p className="font-medium">{data.rightAxis}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Add</p>
              <p className="font-medium">{data.rightAdd || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Left Eye (OS)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Sphere (SPH)</p>
              <p className="font-medium">{data.leftSphere}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cylinder (CYL)</p>
              <p className="font-medium">{data.leftCylinder}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Axis</p>
              <p className="font-medium">{data.leftAxis}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Add</p>
              <p className="font-medium">{data.leftAdd || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Pupillary Distance (PD)</p>
              <p className="font-medium">{data.pupillaryDistance} mm</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prescription Type</p>
              <p className="font-medium">{data.prescriptionType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Doctor's Name</p>
              <p className="font-medium">{data.doctorName || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expiration Date</p>
              <p className="font-medium">{data.expirationDate ? formatDate(data.expirationDate) : 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        {data.notes && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p>{data.notes}</p>
          </div>
        )}
      </div>
    );
  };
  
  // Render visual acuity details
  const renderVisualAcuityDetails = (data) => {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Visual Acuity Measurements</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Right Eye (OD)</p>
              <p className="font-medium">{data.rightEyeAcuity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Left Eye (OS)</p>
              <p className="font-medium">{data.leftEyeAcuity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Both Eyes (OU)</p>
              <p className="font-medium">{data.bothEyesAcuity}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Test Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Testing Method</p>
              <p className="font-medium">{data.testingMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Testing Distance</p>
              <p className="font-medium">{data.testingDistance}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vision Correction</p>
              <p className="font-medium">{data.corrected ? 'Corrected (with glasses/contacts)' : 'Uncorrected'}</p>
            </div>
          </div>
        </div>
        
        {data.notes && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p>{data.notes}</p>
          </div>
        )}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4" role="alert">
        <span className="block sm:inline">Profile not found. It may have been deleted or you don't have access.</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile.name}'s Eye Health Records</h1>
          <p className="text-gray-600">
            {profile.relationship} • 
            {profile.dateOfBirth && calculateAge(profile.dateOfBirth) ? 
              ` ${calculateAge(profile.dateOfBirth)} years old` : 
              ' Age not specified'}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 space-x-2">
          <Link 
            to={`/profiles/${profileId}/prescription/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Prescription
          </Link>
          <Link 
            to={`/profiles/${profileId}/acuity/new`}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Visual Acuity
          </Link>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Records
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'prescription'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('prescription')}
          >
            Prescriptions
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'visualAcuity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('visualAcuity')}
          >
            Visual Acuity
          </button>
        </nav>
      </div>
      
      {/* Two-column layout for desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Metrics list */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {activeTab === 'all' ? 'All Records' : 
               activeTab === 'prescription' ? 'Prescriptions' : 'Visual Acuity Tests'}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {filteredMetrics.length} record{filteredMetrics.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {filteredMetrics.length === 0 ? (
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No records</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add a new {activeTab === 'prescription' ? 'prescription' : 
                           activeTab === 'visualAcuity' ? 'visual acuity test' : 'record'} to get started.
              </p>
              <div className="mt-6">
                <Link 
                  to={activeTab === 'visualAcuity' ? 
                      `/profiles/${profileId}/acuity/new` : 
                      `/profiles/${profileId}/prescription/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Record
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredMetrics.map((metric) => (
                <li 
                  key={metric.id}
                  onClick={() => showMetricDetails(metric)}
                  className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${selectedMetric?.id === metric.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {metric.recordType === 'prescription' ? 'Prescription' : 'Visual Acuity Test'}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(metric.recordDate)}</p>
                      
                      {metric.recordType === 'prescription' && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {metric.data.prescriptionType}
                          </span>
                          {metric.data.doctorName && (
                            <span className="ml-2 text-xs text-gray-500">
                              Dr. {metric.data.doctorName}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {metric.recordType === 'visualAcuity' && (
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            metric.data.corrected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {metric.data.corrected ? 'Corrected' : 'Uncorrected'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => openDeleteModal(metric, e)}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Delete record"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Details panel */}
        <div className="lg:col-span-2">
          {selectedMetric ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedMetric.recordType === 'prescription' ? 'Prescription Details' : 'Visual Acuity Details'}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Recorded on {formatDateTime(selectedMetric.recordDate)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openDeleteModal(selectedMetric, { stopPropagation: () => {} })}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {selectedMetric.recordType === 'prescription' ? 
                  renderPrescriptionDetails(selectedMetric.data) :
                  renderVisualAcuityDetails(selectedMetric.data)
                }
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No record selected</h3>
              <p className="mt-2 text-gray-500">
                Select a record from the list to view its details
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && metricToDelete && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 md:mx-auto">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Record</h3>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to delete this 
                {metricToDelete.recordType === 'prescription' ? ' prescription' : ' visual acuity'} 
                record? This action cannot be undone.
              </p>
            </div>
            <div className="mt-5 sm:mt-6 flex justify-center space-x-2">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsHistory;