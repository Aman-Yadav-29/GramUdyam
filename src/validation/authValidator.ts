import type { ValidationResult } from './businessValidator.ts';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateLoginPayload(payload: {
  email?: string;
  password?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (!payload.email || typeof payload.email !== 'string') {
    errors.push('Email is required.');
  } else if (!EMAIL_REGEX.test(payload.email.trim())) {
    errors.push('Please enter a valid email address.');
  }

  if (!payload.password || typeof payload.password !== 'string') {
    errors.push('Password is required.');
  } else if (payload.password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateRegisterPayload(payload: {
  fullName?: string;
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}): ValidationResult {
  const errors: string[] = [];

  const nameVal = (payload.name ?? payload.fullName ?? '').trim();
  if (!nameVal) {
    errors.push('Name is required.');
  } else if (nameVal.length < 2) {
    errors.push('Name must be at least 2 characters.');
  } else if (nameVal.length > 100) {
    errors.push('Name cannot exceed 100 characters.');
  }

  if (!payload.email || typeof payload.email !== 'string') {
    errors.push('Email is required.');
  } else if (!EMAIL_REGEX.test(payload.email.trim())) {
    errors.push('Please enter a valid email address.');
  }

  if (!payload.password || typeof payload.password !== 'string') {
    errors.push('Password is required.');
  } else if (payload.password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (payload.confirmPassword !== undefined) {
    if (!payload.confirmPassword) {
      errors.push('Please confirm your password.');
    } else if (payload.password !== payload.confirmPassword) {
      errors.push('Passwords do not match.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
