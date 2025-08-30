/**
 * Date utility functions for the MiOptiData application
 */

// Format date for display (YYYY-MM-DD format to localized string)
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Format date and time for display
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return dateString;
  }
};

// Format date for input fields (converts to YYYY-MM-DD for date inputs)
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

// Get age from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  try {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

// Check if a date is in the past
export const isDateInPast = (dateString) => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  } catch (error) {
    console.error('Error checking if date is in past:', error);
    return false;
  }
};

// Check if a date is today
export const isDateToday = (dateString) => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

// Get days remaining until a future date
export const getDaysRemaining = (dateString) => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Convert both dates to milliseconds and calculate the difference
    const diffInMs = date - today;
    
    // Convert difference to days
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating days remaining:', error);
    return null;
  }
};

// Get formatted time period (e.g., "2 years ago", "in 3 months")
export const getTimePeriod = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = date - now;
    const diffInSeconds = diffInMs / 1000;
    const isInFuture = diffInSeconds > 0;
    const absDiffInSeconds = Math.abs(diffInSeconds);
    
    // Define time thresholds
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = day * 365;
    
    let unit, value;
    
    if (absDiffInSeconds < minute) {
      unit = 'second';
      value = Math.floor(absDiffInSeconds);
    } else if (absDiffInSeconds < hour) {
      unit = 'minute';
      value = Math.floor(absDiffInSeconds / minute);
    } else if (absDiffInSeconds < day) {
      unit = 'hour';
      value = Math.floor(absDiffInSeconds / hour);
    } else if (absDiffInSeconds < month) {
      unit = 'day';
      value = Math.floor(absDiffInSeconds / day);
    } else if (absDiffInSeconds < year) {
      unit = 'month';
      value = Math.floor(absDiffInSeconds / month);
    } else {
      unit = 'year';
      value = Math.floor(absDiffInSeconds / year);
    }
    
    // Make unit plural if value is not 1
    if (value !== 1) {
      unit += 's';
    }
    
    if (isInFuture) {
      return `in ${value} ${unit}`;
    } else {
      return `${value} ${unit} ago`;
    }
  } catch (error) {
    console.error('Error formatting time period:', error);
    return '';
  }
};

// Get next reminder date based on recurrence pattern
export const getNextReminderDate = (baseDate, recurrencePattern) => {
  try {
    const date = new Date(baseDate);
    
    switch (recurrencePattern) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        return null;
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Error calculating next reminder date:', error);
    return null;
  }
};