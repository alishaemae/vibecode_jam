/**
 * Custom hook for managing form field state and validation
 * Centralizes handleChange, handleBlur, and error management logic
 */

import { useState, useCallback } from 'react';
import { validateField } from '../utils/validation';

interface UseFormFieldOptions {
  initialValue?: string;
  validator?: (value: string, fieldName: string) => string | undefined;
  onChangeCallback?: (value: string) => void;
}

export interface FormFieldState {
  value: string;
  error: string | undefined;
  isTouched: boolean;
}

export const useFormField = (
  fieldName: string,
  options: UseFormFieldOptions = {}
) => {
  const {
    initialValue = '',
    validator = validateField,
    onChangeCallback,
  } = options;

  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | undefined>();
  const [isTouched, setIsTouched] = useState(false);

  const validate = useCallback(
    (fieldValue: string) => {
      const validationError = validator(fieldValue, fieldName);
      setError(validationError);
      return validationError;
    },
    [fieldName, validator]
  );

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      onChangeCallback?.(newValue);

      // Validate only if field has been touched
      if (isTouched) {
        validate(newValue);
      }
    },
    [isTouched, validate, onChangeCallback]
  );

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    validate(value);
  }, [value, validate]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(undefined);
    setIsTouched(false);
  }, [initialValue]);

  const setFieldValue = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const setFieldError = useCallback((newError: string | undefined) => {
    setError(newError);
  }, []);

  return {
    value,
    error,
    isTouched,
    handleChange,
    handleBlur,
    reset,
    setFieldValue,
    setFieldError,
    validate: () => validate(value),
  };
};

/**
 * Hook for managing multiple form fields
 */
export interface FormState {
  [key: string]: FormFieldState;
}

export const useForm = (
  initialValues: Record<string, string>,
  onSubmit?: (values: Record<string, string>) => void
) => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate if field has been touched
      if (touched.has(name)) {
        const error = validateField(value, name);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      // Mark field as touched
      const newTouched = new Set(touched);
      newTouched.add(name);
      setTouched(newTouched);

      // Validate field
      const error = validateField(value, name);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [touched]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const newErrors: Record<string, string | undefined> = {};
      Object.entries(values).forEach(([name, value]) => {
        newErrors[name] = validateField(value, name);
      });

      setErrors(newErrors);

      // Check if form is valid
      const hasErrors = Object.values(newErrors).some((error) => error);
      if (!hasErrors && onSubmit) {
        onSubmit(values);
      }
    },
    [values, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched(new Set());
  }, [initialValues]);

  const setFieldValue = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
  };
};
