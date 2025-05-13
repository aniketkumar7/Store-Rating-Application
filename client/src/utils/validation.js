export const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }
  if (name.length < 5) {
    return 'Name must be at least 5 characters';
  }
  if (name.length > 20) {
    return 'Name must not exceed 20 characters';
  }
  return '';
};



export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return 'Email is invalid';
  }
  return '';
};



export const validateAddress = (address) => {
  if (!address) {
    return 'Address is required';
  }
  if (address.length > 400) {
    return 'Address must not exceed 400 characters';
  }
  return '';
};



export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return '';
};



export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Confirm password is required';
  }
  if (password !== confirmPassword) {
    return 'Passwords must match';
  }
  return '';
};



export const validateRating = (rating) => {
  const ratingNum = Number(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return 'Rating must be a number between 1 and 5';
  }
  return '';
};


export const validateForm = (formData, fields) => {
  const validators = {
    name: () => validateName(formData.name),
    email: () => validateEmail(formData.email),
    address: () => validateAddress(formData.address),
    password: () => validatePassword(formData.password),
    confirmPassword: () => validatePasswordConfirmation(formData.password, formData.confirmPassword),
    currentPassword: () => (!formData.currentPassword ? 'Current password is required' : undefined),
    role: () => (!formData.role ? 'Role is required' : undefined),
    rating: () => validateRating(formData.rating),
  };

  const errors = {};
  fields.forEach(field => {
    const error = validators[field]?.();
    if (error) errors[field] = error;
  });
  return errors;
};
