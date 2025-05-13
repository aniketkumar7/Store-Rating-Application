import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { validateForm } from '../utils/validation';

const ChangePassword = () => {
  const { updatePassword } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const newErrors = validateForm(formData, [
      'currentPassword',
      'newPassword',
      'confirmPassword'
    ]);
    setErrors(newErrors);

    // If no errors, submit the form
    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true);
        setUpdateError('');
        setUpdateSuccess('');

        const { currentPassword, newPassword } = formData;
        await updatePassword(currentPassword, newPassword);

        setUpdateSuccess('Password updated successfully');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err) {
        console.error('Error updating password:', err);
        setUpdateError(err.response?.data?.message || 'Failed to update password');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="change-password">
      <h1>Change Password</h1>

      {updateError && <div className="error-message">{updateError}</div>}
      {updateSuccess && <div className="success-message">{updateSuccess}</div>}

      <div className="password-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
            />
            {errors.currentPassword && <div className="error-text">{errors.currentPassword}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
            />
            {errors.newPassword && <div className="error-text">{errors.newPassword}</div>}
            <small className="form-text text-muted">
              Password must be 8-16 characters, include at least one uppercase letter and one special character.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>

          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
