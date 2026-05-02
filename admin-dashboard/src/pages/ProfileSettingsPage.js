import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import '../styles/ProfileSettingsPage.css';

const ProfileSettingsPage = () => {
  const { user, updateUserData } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nic, setNic] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhoneNumber(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!user?._id) {
      setError('User session not found. Please login again.');
      return;
    }

    if (!fullName.trim() || !phoneNumber.trim()) {
      setError('Full name and phone number are required.');
      return;
    }

    try {
      setIsSaving(true);
      const response = await userService.updateUser(user._id, fullName.trim(), user.email, phoneNumber.trim());

      if (response.success && response.user) {
        updateUserData(response.user);
        if (newPassword.trim()) {
          setMessage('Profile updated. Password update endpoint is not implemented yet.');
        } else {
          setMessage('Profile updated successfully.');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1>Profile Settings</h1>
        <p>personal details • account security</p>
      </header>

      <section className="profile-card">
        <h2>Personal Information</h2>

        <form className="profile-form" onSubmit={handleSubmit}>
          {error && <div className="profile-alert error">{error}</div>}
          {message && <div className="profile-alert success">{message}</div>}

          <div className="profile-grid">
            <div className="field-group">
              <label htmlFor="fullName">FULL NAME</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="field-group">
              <label htmlFor="phone">PHONE NUMBER</label>
              <input
                id="phone"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="field-group">
              <label htmlFor="email">EMAIL (ACCOUNT ID)</label>
              <input id="email" type="email" value={user?.email || ''} disabled />
              <small>Email cannot be changed.</small>
            </div>

            <div className="field-group">
              <label htmlFor="nic">NIC</label>
              <input
                id="nic"
                type="text"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                placeholder="Enter NIC"
              />
              <small>Contact admin to sync NIC with backend.</small>
            </div>

            <div className="field-group">
              <label htmlFor="license">DRIVING LICENSE URL</label>
              <input
                id="license"
                type="url"
                value={licenseUrl}
                onChange={(e) => setLicenseUrl(e.target.value)}
                placeholder="https://link-to-your-license-image"
              />
            </div>

            <div className="field-group">
              <label htmlFor="password">NEW PASSWORD</label>
              <input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </div>
          </div>

          <button type="submit" className="save-profile-btn" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ProfileSettingsPage;
