/**
 * Validation utility functions for the MiOptiData application
 */

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Validate name (only letters, spaces, hyphens, and apostrophes)
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return nameRegex.test(name);
};

// Validate date
export const validateDate = (date) => {
  // Check if it's a valid date
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

// Validate numeric input with specified range
export const validateNumericRange = (value, min, max, allowDecimal = false) => {
  if (value === '' || value === null || value === undefined) return false;
  
  // Parse value as float or integer based on allowDecimal
  const numValue = allowDecimal ? parseFloat(value) : parseInt(value, 10);
  
  // Check if it's a valid number and within range
  return !isNaN(numValue) && numValue >= min && numValue <= max;
};

// Validate sphere value (-20.00 to +20.00 in 0.25 steps)
export const validateSphere = (value) => {
  if (value === '' || value === null || value === undefined) return false;
  
  // Convert to number
  const num = parseFloat(value);
  
  // Check if it's a valid number within range
  if (isNaN(num) || num < -20 || num > 20) return false;
  
  // Check if it's in 0.25 steps (multiply by 4 to convert to integer)
  return Number.isInteger(num * 4);
};

// Validate cylinder value (-10.00 to 0.00 in 0.25 steps)
export const validateCylinder = (value) => {
  if (value === '' || value === null || value === undefined) return false;
  
  // Convert to number
  const num = parseFloat(value);
  
  // Check if it's a valid number within range
  if (isNaN(num) || num < -10 || num > 0) return false;
  
  // Check if it's in 0.25 steps (multiply by 4 to convert to integer)
  return Number.isInteger(num * 4);
};

// Validate axis value (0 to 180 in 1 degree steps)
export const validateAxis = (value) => {
  if (value === '' || value === null || value === undefined) return false;
  
  // Convert to number
  const num = parseInt(value, 10);
  
  // Check if it's a valid integer within range
  return !isNaN(num) && num >= 0 && num <= 180 && Number.isInteger(num);
};

// Validate add power value (0.00 to +4.00 in 0.25 steps)
export const validateAdd = (value) => {
  if (value === '' || value === null || value === undefined) return true; // Add can be empty
  if (value === 0 || value === '0') return true; // Zero is valid
  
  // Convert to number
  const num = parseFloat(value);
  
  // Check if it's a valid number within range
  if (isNaN(num) || num < 0 || num > 4) return false;
  
  // Check if it's in 0.25 steps (multiply by 4 to convert to integer)
  return Number.isInteger(num * 4);
};

// Validate pupillary distance (40 to 80 in 0.5 steps)
export const validatePD = (value) => {
  if (value === '' || value === null || value === undefined) return false;
  
  // Convert to number
  const num = parseFloat(value);
  
  // Check if it's a valid number within range
  if (isNaN(num) || num < 40 || num > 80) return false;
  
  // Check if it's in 0.5 steps (multiply by 2 to convert to integer)
  return Number.isInteger(num * 2);
};

// Validate visual acuity format (e.g., 20/20, 6/6)
export const validateVisualAcuity = (value) => {
  if (value === '' || value === null || value === undefined) return false;
  
  // Common visual acuity formats: 20/x (US), 6/x (UK/EU)
  const acuityRegex = /^(20|6)\/\d+$/;
  return acuityRegex.test(value);
};

// Validate required fields
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};