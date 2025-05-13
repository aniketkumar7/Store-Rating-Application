const validateName = (name) => {
  if (!name || name.length < 5 || name.length > 20) {
    return { valid: false, message: 'Name must be between 5 and 20 characters' };
  }
  return { valid: true };
};



const validateAddress = (address) => {
  if (!address || address.length > 400) {
    return { valid: false, message: 'Address must not exceed 400 characters' };
  }
  return { valid: true };
};



const validatePassword = (password) => {
  if (!password || password.length < 8 || password.length > 16) {
    return { valid: false, message: 'Password must be between 8 and 16 characters' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUpperCase || !hasSpecialChar) {
    return {
      valid: false,
      message: 'Password must include at least one uppercase letter and one special character'
    };
  }

  return { valid: true };
};




const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, message: 'Please provide a valid email address' };
  }
  return { valid: true };
};




const validateRating = (rating) => {
  const ratingNum = Number(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return { valid: false, message: 'Rating must be a number between 1 and 5' };
  }
  return { valid: true };
};

module.exports = {
  validateName,
  validateAddress,
  validatePassword,
  validateEmail,
  validateRating
};
