import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate(result.data.user.role === 'admin' ? '/dashboard/users' : '/dashboard/profile');
    } else {
      if (result.error?.toLowerCase().includes('blocked')) {
        window.alert(result.error);
      }
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <header className="auth-top-bar">
        <p className="auth-brand">SAMARASINGHE MOTORS</p>
        <Link className="auth-top-action" to="/signup">
          SIGN UP
        </Link>
      </header>

      <div className="auth-card">
        <h1>Login</h1>
        <p>Vehicle management console</p>
        <form onSubmit={handleLogin} className="auth-form-grid">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group form-group-wide">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="Email"
            />
          </div>

          <div className="form-group form-group-wide">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Password"
            />
          </div>

          <button type="submit" disabled={isLoading} className="login-btn form-group-wide">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <p className="auth-switch form-group-wide">
            Need a new account? <Link to="/signup">Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
