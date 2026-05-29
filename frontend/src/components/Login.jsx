import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Simulate login (replace with real API call)
    setTimeout(() => {
      if (email && password.length >= 6) {
        onLogin({ email, name: email.split('@')[0] });
      } else {
        setError('Invalid email or password');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <p style={{
            margin: 0,
            color: '#94a3b8',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>
            RetailOS AI
          </p>
          <h1 style={{
            marginTop: '16px',
            fontSize: '2.25rem',
            fontWeight: '700',
            color: '#f1f5f9',
            margin: '16px 0 0 0'
          }}>
            Sign In
          </h1>
          <p style={{
            marginTop: '12px',
            color: '#cbd5e1',
            fontSize: '0.95rem',
            margin: '12px 0 0 0'
          }}>
            Access your enterprise forecasting dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#111827',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#7f1d1d',
              border: '1px solid #dc2626',
              color: '#fecaca',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {/* Email Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#e2e8f0'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@retailos.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#e2e8f0'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: isLoading ? '#64748b' : '#0ea5e9',
              color: '#020617',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#06b6d4')}
            onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#0ea5e9')}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          border: '1px solid #334155'
        }}>
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '0.85rem',
            color: '#94a3b8',
            fontWeight: '500'
          }}>
            Demo Credentials:
          </p>
          <div style={{
            backgroundColor: '#0f172a',
            padding: '12px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: '#cbd5e1',
            lineHeight: '1.6'
          }}>
            <div>Email: <span style={{ color: '#22c55e' }}>admin@retailos.com</span></div>
            <div>Password: <span style={{ color: '#22c55e' }}>password123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
