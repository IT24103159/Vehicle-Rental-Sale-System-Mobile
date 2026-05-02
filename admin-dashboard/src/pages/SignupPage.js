import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/LoginPage.css';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nic: '',
    phone: '',
    password: '',
    confirmPassword: '',
    license: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(formData.password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.register(
        formData.name,
        formData.email,
        formData.phone,
        formData.password,
        formData.role,
      );
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <header className="auth-top-bar">
        <p className="auth-brand">SAMARASINGHE MOTORS</p>
        <Link className="auth-top-action" to="/login">
          LOGIN
        </Link>
      </header>

      <div className="auth-card signup-card">
        <h1>Create Account</h1>
        <p>Join Samarasinghe Motors today</p>

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="nic">NIC Number</label>
            <input id="nic" name="nic" type="text" value={formData.nic} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input id="phone" name="phone" type="text" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} />
            <small style={{ color: '#6b7280' }}>
              Use 8+ characters with uppercase, lowercase, number, and special character.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="form-group form-group-wide">
            <label htmlFor="license">Driving License Details (Optional but recommended)</label>
            <input
              id="license"
              name="license"
              type="text"
              placeholder="Enter License Number or Reference"
              value={formData.license}
              onChange={handleChange}
            />
          </div>

          <div className="form-group form-group-wide">
            <label>Account Type *</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                />
                User
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleChange}
                />
                Admin
              </label>
            </div>
          </div>

          {error && <div className="error-message form-group-wide">{error}</div>}

          <button type="submit" className="login-btn form-group-wide" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'SIGN UP'}
          </button>

          <p className="auth-switch form-group-wide">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
