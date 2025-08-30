import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, createMetric, getMetrics, updateMetric } from '../../utils/api';
import { formatDate, formatDateForInput } from '../../utils/dateUtils';
import { validateVisualAcuity, validateDate } from '../../utils/validation';

const VisualAcuityForm = () => {
  const { profileId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingMetricId, setExistingMetricId] = useState(null);
  
  const [formData, setFormData] = useState({
    rightEyeAcuity: '',
    leftEyeAcuity: '',
    bothEyesAcuity: '',
    corrected: true,
    testingMethod: 'Snellen',
    testingDistance: '20 feet',
    examDate: formatDateForInput(new Date()),
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Acuity scale options
  const snellenOptions = [
    '20/10', '20/12', '20/15', '20/20', '20/25', '20/30', 
    '20/40', '20/50', '20/60', '20/70', '20/80', '20/100', 
    '20/200', '20/400', '20/800'
  ];
  
  const metricOptions = [
    '6/3', '6/3.6', '6/4.5', '6/6', '6/7.5', '6/9', 
    '6/12', '6/15', '6/18', '6/21', '6/24', '6/30', 
    '6/60', '6/120', '6/240'
  ];
  
  const logMarOptions = [
    '-0.3', '-0.2', '-0.1', '0.0', '0.1', '0.2', 
    '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', 
    '1.0', '1.3', '1.6'
  ];
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile data
        const profileData = await getProfile(profileId);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setSubmitError('Failed to load profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (profileId) {
      fetchProfileData();
    }
  }, [profileId]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate acuity values
    if (!formData.rightEyeAcuity) {
      newErrors.rightEyeAcuity = 'Right eye acuity is required';
    }
    
    if (!formData.leftEyeAcuity) {
      newErrors.leftEyeAcuity = 'Left eye acuity is required';
    }
    
    if (!formData.bothEyesAcuity) {
      newErrors.bothEyesAcuity = 'Both eyes acuity is required';
    }
    
    // Validate custom acuity values if not selecting from dropdown
    if (formData.rightEyeAcuity && !isStandardAcuity(formData.rightEyeAcuity)) {
      if (!validateVisualAcuity(formData.rightEyeAcuity)) {
        newErrors.rightEyeAcuity = 'Must be in format 20/X or 6/X';
      }
    }
    
    if (formData.leftEyeAcuity && !isStandardAcuity(formData.leftEyeAcuity)) {
      if (!validateVisualAcuity(formData.leftEyeAcuity)) {
        newErrors.leftEyeAcuity = 'Must be in format 20/X or 6/X';
      }
    }
    
    if (formData.bothEyesAcuity && !isStandardAcuity(formData.bothEyesAcuity)) {
      if (!validateVisualAcuity(formData.bothEyesAcuity)) {
        newErrors.bothEyesAcuity = 'Must be in format 20/X or 6/X';
      }
    }
    
    // Validate testing method
    if (!formData.testingMethod) {
      newErrors.testingMethod = 'Testing method is required';
    }
    
    // Validate testing distance
    if (!formData.testingDistance) {
      newErrors.testingDistance = 'Testing distance is required';
    }
    
    // Validate date
    if (!formData.examDate) {
      newErrors.examDate = 'Examination date is required';
    } else if (!validateDate(formData.examDate)) {
      newErrors.examDate = 'Please enter a valid date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Helper to check if acuity value is from standard options
  const isStandardAcuity = (value) => {
    return snellenOptions.includes(value) || 
           metricOptions.includes(value) || 
           logMarOptions.includes(value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const metricData = {
        rightEyeAcuity: formData.rightEyeAcuity,
        leftEyeAcuity: formData.leftEyeAcuity,
        bothEyesAcuity: formData.bothEyesAcuity,
        corrected: formData.corrected,
        testingMethod: formData.testingMethod,
        testingDistance: formData.testingDistance,
        examDate: formData.examDate,
        notes: formData.notes
      };
      
      if (isEditMode && existingMetricId) {
        await updateMetric(existingMetricId, metricData);
      } else {
        await createMetric(profileId, 'visualAcuity', metricData);
      }
      
      navigate(`/profiles/${profileId}/metrics`);
    } catch (error) {
      console.error('Error saving visual acuity data:', error);
      setSubmitError(`Failed to ${isEditMode ? 'update' : 'save'} visual acuity data. Please try again later.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper to get acuity options based on testing method
  const getAcuityOptions = () => {
    switch (formData.testingMethod) {
      case 'Snellen':
        return snellenOptions;
      case 'Metric':
        return metricOptions;
      case 'LogMAR':
        return logMarOptions;
      default:
        return snellenOptions;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4" role="alert">
        <p>Could not load profile information. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6">
      <h1 className="text-2xl font-bold mb-2">
        {isEditMode ? 'Edit' : 'Add'} Visual Acuity Test
      </h1>
      <p className="text-gray-600 mb-6">
        For {profile.name} ({profile.relationship})
      </p>
      
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{submitError}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Test Information Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Test Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="examDate" className="block text-sm font-medium text-gray-700">Examination Date</label>
              <input
                type="date"
                id="examDate"
                name="examDate"
                value={formData.examDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${errors.examDate ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.examDate && <p className="mt-1 text-sm text-red-600">{errors.examDate}</p>}
            </div>
            
            <div>
              <label htmlFor="testingMethod" className="block text-sm font-medium text-gray-700">Testing Method</label>
              <select
                id="testingMethod"
                name="testingMethod"
                value={formData.testingMethod}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${errors.testingMethod ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="Snellen">Snellen Chart</option>
                <option value="Metric">Metric Chart</option>
                <option value="LogMAR">LogMAR Chart</option>
                <option value="Electronic">Electronic Chart</option>
                <option value="Other">Other</option>
              </select>
              {errors.testingMethod && <p className="mt-1 text-sm text-red-600">{errors.testingMethod}</p>}
            </div>
            
            <div>
              <label htmlFor="testingDistance" className="block text-sm font-medium text-gray-700">Testing Distance</label>
              <select
                id="testingDistance"
                name="testingDistance"
                value={formData.testingDistance}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${errors.testingDistance ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="20 feet">20 feet (6 meters)</option>
                <option value="10 feet">10 feet (3 meters)</option>
                <option value="14 inches">14 inches (35 cm) - Near vision</option>
                <option value="40 cm">40 cm - Near vision</option>
                <option value="Other">Other</option>
              </select>
              {errors.testingDistance && <p className="mt-1 text-sm text-red-600">{errors.testingDistance}</p>}
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="corrected"
              name="corrected"
              checked={formData.corrected}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="corrected" className="ml-2 block text-sm text-gray-700">
              Corrected vision (wearing glasses/contacts during test)
            </label>
          </div>
        </div>
        
        {/* Visual Acuity Results */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Visual Acuity Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="rightEyeAcuity" className="block text-sm font-medium text-gray-700">Right Eye (OD)</label>
              <select
                id="rightEyeAcuity"
                name="rightEyeAcuity"
                value={getAcuityOptions().includes(formData.rightEyeAcuity) ? formData.rightEyeAcuity : ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${errors.rightEyeAcuity ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">Select acuity</option>
                {getAcuityOptions().map(option => (
                  <option key={`right-${option}`} value={option}>{option}</option>
                ))}
                <option value="custom">Custom value...</option>
              </select>
              
              {formData.rightEyeAcuity === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter acuity (e.g., 20/40)"
                  value={formData.rightEyeAcuity === 'custom' ? '' : formData.rightEyeAcuity}
                  onChange={(e) => setFormData(prev => ({ ...prev, rightEyeAcuity: e.target.value }))}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"
                />
              )}
              {errors.rightEyeAcuity && <p className="mt-1 text-sm text-red-600">{errors.rightEyeAcuity}</p>}
            </div>
            
            <div>
              <label htmlFor="leftEyeAcuity" className="block text-sm font-medium text-gray-700">Left Eye (OS)</label>
              <select
                id="leftEyeAcuity"
                name="leftEyeAcuity"
                value={getAcuityOptions().includes(formData.leftEyeAcuity) ? formData.leftEyeAcuity : ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${errors.leftEyeAcuity ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">Select acuity</option>
                {getAcuityOptions().map(option => (
                  <option key={`left-${option}`} value={option}>{option}</option>
                ))}
                <option value="custom">Custom value...</option>
              </select>
              
              {formData.leftEyeAcuity === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter acuity (e.g., 20/40)"
                  value={formData.leftEyeAcuity === 'custom' ? '' : formData.leftEyeAcuity}
                  onChange={(e) => setFormData(prev => ({ ...prev, leftEyeAcuity: e.target.value }))}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"
                />
              )}
              {errors.leftEyeAcuity && <p className="mt-1 text-sm text-red-600">{errors.leftEyeAcuity}</p>}
            </div>
            
            <div>
              <label htmlFor="bothEyesAcuity" className="block text-sm font-medium text-gray-700">Both Eyes (OU)</label>
              <select
                id="bothEyesAcuity"
                name="bothEyesAcuity"
                value={getAcuityOptions().includes(formData.bothEyesAcuity) ? formData.bothEyesAcuity : ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${errors.bothEyesAcuity ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">Select acuity</option>
                {getAcuityOptions().map(option => (
                  <option key={`both-${option}`} value={option}>{option}</option>
                ))}
                <option value="custom">Custom value...</option>
              </select>
              
              {formData.bothEyesAcuity === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter acuity (e.g., 20/40)"
                  value={formData.bothEyesAcuity === 'custom' ? '' : formData.bothEyesAcuity}
                  onChange={(e) => setFormData(prev => ({ ...prev, bothEyesAcuity: e.target.value }))}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"
                />
              )}
              {errors.bothEyesAcuity && <p className="mt-1 text-sm text-red-600">{errors.bothEyesAcuity}</p>}
            </div>
          </div>
        </div>
        
        {/* Additional Notes */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Any additional information about this visual acuity test"
            ></textarea>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/profiles/${profileId}/metrics`)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Visual Acuity'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisualAcuityForm;