// useFormValidation – wraps validateForm with React state
import { useState, useCallback } from 'react';
import { validateForm, isFormValid } from '../lib/validation';
import type { ValidationErrors } from '../lib/validation';
import type { FormData } from '../lib/validation';

interface UseFormValidationReturn {
  errors: ValidationErrors;
  validate: (data: FormData) => boolean;
  clearError: (field: keyof ValidationErrors) => void;
  clearAllErrors: () => void;
}

const EMPTY_ERRORS: ValidationErrors = {
  date: null,
  topics: null,
  mentorId: null,
  time: null,
  introduction: null,
};

export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>(EMPTY_ERRORS);

  const validate = useCallback((data: FormData): boolean => {
    const newErrors = validateForm(data);
    setErrors(newErrors);
    return isFormValid(newErrors);
  }, []);

  const clearError = useCallback((field: keyof ValidationErrors) => {
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors(EMPTY_ERRORS);
  }, []);

  return { errors, validate, clearError, clearAllErrors };
}
