/**
 * Centralized validation utilities for forms
 * Consolidates validation logic from all Step components
 */

export const validateFullName = (value: string): string | undefined => {
  if (!value.trim()) return 'Full name is required';
  if (value.trim().length < 2) return 'Name must be at least 2 characters';
  return undefined;
};

export const validateEmail = (value: string): string | undefined => {
  if (!value.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
  return undefined;
};

export const validatePhone = (value: string): string | undefined => {
  if (!value.trim()) return 'Phone number is required';
  if (!/^[\d\s\-+()]+$/.test(value)) return 'Invalid phone format';
  if (value.replace(/\D/g, '').length < 10)
    return 'Phone number must have at least 10 digits';
  return undefined;
};

export const validateUrl = (url: string, platform?: string): string | undefined => {
  if (!url) return undefined; // Optional field

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);

    if (platform) {
      switch (platform) {
        case 'linkedin':
          if (!urlObj.hostname.includes('linkedin.com'))
            return 'Please enter a valid LinkedIn URL';
          break;
        case 'github':
          if (!urlObj.hostname.includes('github.com'))
            return 'Please enter a valid GitHub URL';
          break;
        case 'portfolio':
          // Any valid URL is fine for portfolio
          break;
      }
    }
    return undefined;
  } catch {
    return `Invalid URL format`;
  }
};

export const validateBio = (value: string): string | undefined => {
  if (!value.trim()) return 'Bio is required';
  if (value.trim().length < 10) return 'Bio must be at least 10 characters';
  if (value.trim().length > 500) return 'Bio must not exceed 500 characters';
  return undefined;
};

export const validateYearsOfExperience = (value: string): string | undefined => {
  if (!value) return 'Years of experience is required';
  const years = parseInt(value, 10);
  if (isNaN(years) || years < 0) return 'Please enter a valid number';
  if (years > 70) return 'Years of experience seems invalid';
  return undefined;
};

export const validateJobTitle = (value: string): string | undefined => {
  if (!value.trim()) return 'Job title is required';
  if (value.trim().length < 2) return 'Job title must be at least 2 characters';
  return undefined;
};

export const validateCompanyName = (value: string): string | undefined => {
  if (!value.trim()) return 'Company name is required';
  if (value.trim().length < 2) return 'Company name must be at least 2 characters';
  return undefined;
};

/**
 * Generic field validator that delegates to specific validators
 * Used for dynamic form fields
 */
export const validateField = (
  fieldName: string,
  value: string,
  platform?: string
): string | undefined => {
  switch (fieldName) {
    case 'fullName':
      return validateFullName(value);
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    case 'linkedinProfile':
    case 'githubUrl':
    case 'portfolioUrl':
      return validateUrl(value, platform);
    case 'bio':
      return validateBio(value);
    case 'yearsOfExperience':
      return validateYearsOfExperience(value);
    case 'currentRole':
      return validateJobTitle(value);
    case 'currentCompany':
      return validateCompanyName(value);
    default:
      return undefined;
  }
};

/**
 * Validate entire form object
 */
export const validateFormObject = (
  formData: Record<string, string>,
  requiredFields: string[] = []
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.entries(formData).forEach(([fieldName, value]) => {
    const error = validateField(fieldName, value);
    if (error) {
      errors[fieldName] = error;
    }
  });

  // Check required fields
  requiredFields.forEach((field) => {
    if (!formData[field]?.trim()) {
      errors[field] = `${field} is required`;
    }
  });

  return errors;
};
