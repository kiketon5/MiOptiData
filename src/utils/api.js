/**
 * API utility functions for the MiOptiData application
 * 
 * This module provides functions for interacting with the backend API
 * Note: For this demo, we'll use mock data with localStorage
 */

// Helper function to simulate API delay
const simulateAPIDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock profile data in localStorage
const initializeMockData = () => {
  // Check if mock data already exists
  if (!localStorage.getItem('MiOptiDataProfiles')) {
    const mockProfiles = [
      {
        id: '1',
        userId: 'mock-user-id',
        name: 'Personal',
        relationship: 'Self',
        dateOfBirth: '1990-01-15',
        gender: 'Male',
        notes: 'My personal eye health profile',
        createdAt: '2023-01-01T12:00:00Z',
        updatedAt: '2023-01-01T12:00:00Z'
      },
      {
        id: '2',
        userId: 'mock-user-id',
        name: 'Mom',
        relationship: 'Parent',
        dateOfBirth: '1965-06-20',
        gender: 'Female',
        notes: 'Tracking mom\'s eye health after cataract surgery',
        createdAt: '2023-01-05T14:30:00Z',
        updatedAt: '2023-01-05T14:30:00Z'
      }
    ];
    localStorage.setItem('MiOptiDataProfiles', JSON.stringify(mockProfiles));
  }

  if (!localStorage.getItem('MiOptiDataMetrics')) {
    const mockMetrics = [
      {
        id: '1',
        profileId: '1',
        recordDate: '2023-01-10T09:30:00Z',
        recordType: 'prescription',
        data: {
          rightSphere: -2.25,
          rightCylinder: -0.75,
          rightAxis: 180,
          rightAdd: 0,
          leftSphere: -2.00,
          leftCylinder: -0.50,
          leftAxis: 175,
          leftAdd: 0,
          pupillaryDistance: 62,
          prescriptionType: 'Distance',
          doctorName: 'Dr. Smith',
          expirationDate: '2024-01-10'
        },
        notes: 'Annual eye exam',
        createdAt: '2023-01-10T09:30:00Z',
        updatedAt: '2023-01-10T09:30:00Z'
      },
      {
        id: '2',
        profileId: '1',
        recordDate: '2023-01-10T09:45:00Z',
        recordType: 'visualAcuity',
        data: {
          rightEyeAcuity: '20/25',
          leftEyeAcuity: '20/20',
          bothEyesAcuity: '20/20',
          corrected: true,
          testingMethod: 'Snellen',
          testingDistance: '20 feet'
        },
        notes: 'Measured during annual exam',
        createdAt: '2023-01-10T09:45:00Z',
        updatedAt: '2023-01-10T09:45:00Z'
      },
      {
        id: '3',
        profileId: '2',
        recordDate: '2023-02-15T10:00:00Z',
        recordType: 'prescription',
        data: {
          rightSphere: +1.75,
          rightCylinder: -0.50,
          rightAxis: 90,
          rightAdd: 2.00,
          leftSphere: +2.00,
          leftCylinder: -0.75,
          leftAxis: 85,
          leftAdd: 2.00,
          pupillaryDistance: 60,
          prescriptionType: 'Multifocal',
          doctorName: 'Dr. Johnson',
          expirationDate: '2024-02-15'
        },
        notes: 'Post-cataract surgery check-up',
        createdAt: '2023-02-15T10:00:00Z',
        updatedAt: '2023-02-15T10:00:00Z'
      }
    ];
    localStorage.setItem('MiOptiDataMetrics', JSON.stringify(mockMetrics));
  }

  if (!localStorage.getItem('MiOptiDataReminders')) {
    const mockReminders = [
      {
        id: '1',
        userId: 'mock-user-id',
        profileId: '1',
        title: 'Annual Eye Exam',
        description: 'Yearly check-up with Dr. Smith',
        reminderDate: '2024-01-10',
        reminderTime: '09:00',
        reminderType: 'appointment',
        type: 'exam',
        isRecurring: true,
        recurrencePattern: 'yearly',
        notificationMethods: ['email', 'app'],
        isCompleted: false,
        isActive: true,
        createdAt: '2023-01-10T10:00:00Z',
        updatedAt: '2023-01-10T10:00:00Z'
      },
      {
        id: '2',
        userId: 'mock-user-id',
        profileId: '2',
        title: 'Follow-up Appointment',
        description: 'Post-surgery follow-up with Dr. Johnson',
        reminderDate: '2024-05-15',
        reminderTime: '14:30',
        reminderType: 'appointment',
        type: 'checkup',
        isRecurring: false,
        recurrencePattern: null,
        notificationMethods: ['email', 'app'],
        isCompleted: false,
        isActive: true,
        createdAt: '2023-02-15T11:00:00Z',
        updatedAt: '2023-02-15T11:00:00Z'
      }
    ];
    localStorage.setItem('MiOptiDataReminders', JSON.stringify(mockReminders));
  }

  if (!localStorage.getItem('MiOptiDataSharedLinks')) {
    const mockSharedLinks = [];
    localStorage.setItem('MiOptiDataSharedLinks', JSON.stringify(mockSharedLinks));
  }

  // Initialize new data stores for enhanced features
  if (!localStorage.getItem('MiOptiDataAppointments')) {
    const mockAppointments = [];
    localStorage.setItem('MiOptiDataAppointments', JSON.stringify(mockAppointments));
  }

  if (!localStorage.getItem('MiOptiDataDoctors')) {
    const mockDoctors = [];
    localStorage.setItem('MiOptiDataDoctors', JSON.stringify(mockDoctors));
  }

  if (!localStorage.getItem('MiOptiDataMedications')) {
    const mockMedications = [];
    localStorage.setItem('MiOptiDataMedications', JSON.stringify(mockMedications));
  }

  if (!localStorage.getItem('MiOptiDataFamilyAccounts')) {
    const mockFamilyAccounts = [];
    localStorage.setItem('MiOptiDataFamilyAccounts', JSON.stringify(mockFamilyAccounts));
  }
};

// Initialize mock data
initializeMockData();

// Profile API functions
export const getAllProfiles = async () => {
  await simulateAPIDelay();
  try {
    const profiles = JSON.parse(localStorage.getItem('MiOptiDataProfiles') || '[]');
    return profiles;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw new Error('Failed to fetch profiles');
  }
};

export const getProfile = async (profileId) => {
  await simulateAPIDelay();
  try {
    const profiles = JSON.parse(localStorage.getItem('MiOptiDataProfiles') || '[]');
    const profile = profiles.find(p => p.id === profileId);
    
    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    return profile;
  } catch (error) {
    console.error(`Error fetching profile ${profileId}:`, error);
    throw new Error('Failed to fetch profile');
  }
};

export const createProfile = async (profileData) => {
  await simulateAPIDelay();
  try {
    const profiles = JSON.parse(localStorage.getItem('MiOptiDataProfiles') || '[]');
    
    const newProfile = {
      id: Date.now().toString(),
      userId: 'mock-user-id',
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    profiles.push(newProfile);
    localStorage.setItem('MiOptiDataProfiles', JSON.stringify(profiles));
    
    return newProfile;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw new Error('Failed to create profile');
  }
};

export const updateProfile = async (profileId, profileData) => {
  await simulateAPIDelay();
  try {
    const profiles = JSON.parse(localStorage.getItem('MiOptiDataProfiles') || '[]');
    const profileIndex = profiles.findIndex(p => p.id === profileId);
    
    if (profileIndex === -1) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    const updatedProfile = {
      ...profiles[profileIndex],
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    profiles[profileIndex] = updatedProfile;
    localStorage.setItem('MiOptiDataProfiles', JSON.stringify(profiles));
    
    return updatedProfile;
  } catch (error) {
    console.error(`Error updating profile ${profileId}:`, error);
    throw new Error('Failed to update profile');
  }
};

export const deleteProfile = async (profileId) => {
  await simulateAPIDelay();
  try {
    const profiles = JSON.parse(localStorage.getItem('MiOptiDataProfiles') || '[]');
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    
    localStorage.setItem('MiOptiDataProfiles', JSON.stringify(updatedProfiles));
    
    // Also delete associated metrics for this profile
    const metrics = JSON.parse(localStorage.getItem('MiOptiDataMetrics') || '[]');
    const updatedMetrics = metrics.filter(m => m.profileId !== profileId);
    localStorage.setItem('MiOptiDataMetrics', JSON.stringify(updatedMetrics));
    
    // And remove any reminders for this profile
    const reminders = JSON.parse(localStorage.getItem('MiOptiDataReminders') || '[]');
    const updatedReminders = reminders.filter(r => r.profileId !== profileId);
    localStorage.setItem('MiOptiDataReminders', JSON.stringify(updatedReminders));
    
    return true;
  } catch (error) {
    console.error(`Error deleting profile ${profileId}:`, error);
    throw new Error('Failed to delete profile');
  }
};

// Metrics API functions
export const getMetrics = async (profileId, metricType = null) => {
  await simulateAPIDelay();
  try {
    const metrics = JSON.parse(localStorage.getItem('MiOptiDataMetrics') || '[]');
    let filteredMetrics = metrics.filter(m => m.profileId === profileId);
    
    if (metricType) {
      filteredMetrics = filteredMetrics.filter(m => m.recordType === metricType);
    }
    
    return filteredMetrics;
  } catch (error) {
    console.error(`Error fetching metrics for profile ${profileId}:`, error);
    throw new Error('Failed to fetch metrics');
  }
};

export const createMetric = async (profileId, metricType, metricData) => {
  await simulateAPIDelay();
  try {
    const metrics = JSON.parse(localStorage.getItem('MiOptiDataMetrics') || '[]');
    
    const newMetric = {
      id: Date.now().toString(),
      profileId,
      recordType: metricType,
      recordDate: new Date().toISOString(),
      data: metricData,
      notes: metricData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    metrics.push(newMetric);
    localStorage.setItem('MiOptiDataMetrics', JSON.stringify(metrics));
    
    return newMetric;
  } catch (error) {
    console.error(`Error creating ${metricType} metric for profile ${profileId}:`, error);
    throw new Error(`Failed to create ${metricType} metric`);
  }
};

export const updateMetric = async (metricId, metricData) => {
  await simulateAPIDelay();
  try {
    const metrics = JSON.parse(localStorage.getItem('MiOptiDataMetrics') || '[]');
    const metricIndex = metrics.findIndex(m => m.id === metricId);
    
    if (metricIndex === -1) {
      throw new Error(`Metric with ID ${metricId} not found`);
    }
    
    const updatedMetric = {
      ...metrics[metricIndex],
      data: {
        ...metrics[metricIndex].data,
        ...metricData
      },
      notes: metricData.notes !== undefined ? metricData.notes : metrics[metricIndex].notes,
      updatedAt: new Date().toISOString()
    };
    
    metrics[metricIndex] = updatedMetric;
    localStorage.setItem('MiOptiDataMetrics', JSON.stringify(metrics));
    
    return updatedMetric;
  } catch (error) {
    console.error(`Error updating metric ${metricId}:`, error);
    throw new Error('Failed to update metric');
  }
};

export const deleteMetric = async (metricId) => {
  await simulateAPIDelay();
  try {
    const metrics = JSON.parse(localStorage.getItem('MiOptiDataMetrics') || '[]');
    const updatedMetrics = metrics.filter(m => m.id !== metricId);
    
    localStorage.setItem('MiOptiDataMetrics', JSON.stringify(updatedMetrics));
    
    return true;
  } catch (error) {
    console.error(`Error deleting metric ${metricId}:`, error);
    throw new Error('Failed to delete metric');
  }
};

// Reminder API functions
export const getReminders = async (profileId = null) => {
  await simulateAPIDelay();
  try {
    const reminders = JSON.parse(localStorage.getItem('MiOptiDataReminders') || '[]');
    
    if (profileId) {
      return reminders.filter(r => r.profileId === profileId);
    }
    
    return reminders;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw new Error('Failed to fetch reminders');
  }
};

export const getReminder = async (reminderId) => {
  await simulateAPIDelay();
  try {
    const reminders = JSON.parse(localStorage.getItem('MiOptiDataReminders') || '[]');
    const reminder = reminders.find(r => r.id === reminderId);
    
    if (!reminder) {
      throw new Error(`Reminder with ID ${reminderId} not found`);
    }
    
    return reminder;
  } catch (error) {
    console.error(`Error fetching reminder ${reminderId}:`, error);
    throw new Error('Failed to fetch reminder');
  }
};

export const createReminder = async (reminderData) => {
  await simulateAPIDelay();
  try {
    const reminders = JSON.parse(localStorage.getItem('MiOptiDataReminders') || '[]');
    
    const newReminder = {
      id: Date.now().toString(),
      userId: 'mock-user-id',
      ...reminderData,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    reminders.push(newReminder);
    localStorage.setItem('MiOptiDataReminders', JSON.stringify(reminders));
    
    return newReminder;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw new Error('Failed to create reminder');
  }
};

export const updateReminder = async (reminderId, reminderData) => {
  await simulateAPIDelay();
  try {
    const reminders = JSON.parse(localStorage.getItem('MiOptiDataReminders') || '[]');
    const reminderIndex = reminders.findIndex(r => r.id === reminderId);
    
    if (reminderIndex === -1) {
      throw new Error(`Reminder with ID ${reminderId} not found`);
    }
    
    const updatedReminder = {
      ...reminders[reminderIndex],
      ...reminderData,
      updatedAt: new Date().toISOString()
    };
    
    reminders[reminderIndex] = updatedReminder;
    localStorage.setItem('MiOptiDataReminders', JSON.stringify(reminders));
    
    return updatedReminder;
  } catch (error) {
    console.error(`Error updating reminder ${reminderId}:`, error);
    throw new Error('Failed to update reminder');
  }
};

export const deleteReminder = async (reminderId) => {
  await simulateAPIDelay();
  try {
    const reminders = JSON.parse(localStorage.getItem('MiOptiDataReminders') || '[]');
    const updatedReminders = reminders.filter(r => r.id !== reminderId);
    
    localStorage.setItem('MiOptiDataReminders', JSON.stringify(updatedReminders));
    
    return true;
  } catch (error) {
    console.error(`Error deleting reminder ${reminderId}:`, error);
    throw new Error('Failed to delete reminder');
  }
};

// PDF Export and Sharing API functions
export const getUserProfile = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: userId,
        name: 'John Doe',
        dateOfBirth: '1985-03-15',
        eyeColor: 'Brown',
        medicalHistory: 'No significant history'
      });
    }, 300);
  });
};

export const getPrescriptions = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockPrescriptions = [
        {
          id: '1',
          eye: 'left',
          sphere: -2.25,
          cylinder: -0.75,
          axis: 180,
          date: '2024-01-15'
        },
        {
          id: '2',
          eye: 'right',
          sphere: -2.00,
          cylinder: -0.50,
          axis: 175,
          date: '2024-01-15'
        }
      ];
      resolve(mockPrescriptions);
    }, 300);
  });
};

export const getVisualAcuity = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockVisualAcuity = [
        {
          id: '1',
          eye: 'left',
          distanceVision: '20/20',
          nearVision: '20/20',
          date: '2024-01-15'
        },
        {
          id: '2',
          eye: 'right',
          distanceVision: '20/25',
          nearVision: '20/20',
          date: '2024-01-15'
        }
      ];
      resolve(mockVisualAcuity);
    }, 300);
  });
};

export const generateShareableLink = async (userId, email, shareType) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const token = Math.random().toString(36).substring(2, 15);
      resolve(`https://MiOptiData.app/shared/${token}`);
    }, 300);
  });
};

export const exportToCSV = async (userId) => {
  const data = await Promise.all([
    getUserProfile(userId),
    getPrescriptions(userId),
    getVisualAcuity(userId),
    getReminders(userId)
  ]);
  
  const csvContent = "data:text/csv;charset=utf-8," + 
    "Type,Date,Details\n" +
    data.flat().map(item => `${item.type || 'Unknown'},${item.date || 'N/A'},${JSON.stringify(item)}`).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `eye-metrics-${userId}-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Sharing API functions (existing)
export const createShareLink = async (profileId, dataTypes, expiration = 7) => {
  await simulateAPIDelay();
  try {
    const sharedLinks = JSON.parse(localStorage.getItem('MiOptiDataSharedLinks') || '[]');
    
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expiration);
    
    const newShareLink = {
      id: Date.now().toString(),
      userId: 'mock-user-id',
      profileId,
      accessToken: token,
      expirationDate: expirationDate.toISOString(),
      includedDataTypes: dataTypes,
      recipientEmail: '',
      accessLevel: 'read',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    sharedLinks.push(newShareLink);
    localStorage.setItem('MiOptiDataSharedLinks', JSON.stringify(sharedLinks));
    
    return {
      ...newShareLink,
      shareUrl: `${window.location.origin}/shared/${token}`
    };
  } catch (error) {
    console.error(`Error creating share link for profile ${profileId}:`, error);
    throw new Error('Failed to create share link');
  }
};

export const exportProfileData = async (profileId, format = 'json') => {
  await simulateAPIDelay();
  try {
    const profile = await getProfile(profileId);
    const metrics = await getMetrics(profileId);
    
    const exportData = {
      profile,
      metrics,
      exportDate: new Date().toISOString()
    };
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else if (format === 'csv') {
      return JSON.stringify(exportData, null, 2);
    }
    
    return exportData;
  } catch (error) {
    console.error(`Error exporting profile ${profileId} data:`, error);
    throw new Error('Failed to export profile data');
  }
};