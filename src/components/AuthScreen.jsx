import React, { useState, useEffect } from 'react';
import { logInUser, signUpUser, signInWithGoogle } from '../utils/firebase';
import { Icons } from './AspirantIcons';
import DitherBackground from './DitherBackground';
import SmoothCaretInput from './animations/SmoothCaretInput';
import AnimatedSelect from './animations/AnimatedSelect';
import LiquidMetalLogo from './LiquidMetalLogo';

// Official CATalyze Vector Liquid Metal Logo
function BrandLogo({ size = 32 }) {
  return <LiquidMetalLogo size={size} />;
}

import { stripEmojis } from '../utils/textUtils';

export default function AuthScreen({ onAuthSuccess, onContinueAsGuest, theme }) {
  const activeTheme = theme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null) || 'dark';
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [targetExam, setTargetExam] = useState('CAT');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [transitionState, setTransitionState] = useState('idle'); // 'idle' | 'success-exit' | 'error-return'

  // Brute-force & credential stuffing defense: Progressive lockout cooldown
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Condition statement: Has user visited the site before?
  const [hasVisitedBefore, setHasVisitedBefore] = useState(() => {
    try {
      return !!(
        localStorage.getItem('cat_prep_visited_before') ||
        localStorage.getItem('cat_guest_mode') ||
        localStorage.getItem('cat_tracker_data') ||
        localStorage.getItem('aspirant_profile')
      );
    } catch {
      return false;
    }
  });

  const markVisited = () => {
    try {
      localStorage.setItem('cat_prep_visited_before', 'true');
    } catch (e) {
      console.warn("Could not write visited flag:", e);
    }
  };

  const handleContinueGuest = () => {
    markVisited();
    if (onContinueAsGuest) onContinueAsGuest();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    // Check brute force cooldown
    if (lockoutSeconds > 0) {
      setAuthError(`Too many failed attempts. Cooldown active: wait ${lockoutSeconds}s.`);
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    const cleanName = stripEmojis(displayName).trim().slice(0, 50);

    if (!cleanEmail || !cleanPassword) {
      setAuthError('Please enter both email and password.');
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);
      return;
    }

    // RFC-compliant email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setAuthError('Please enter a valid email address.');
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);
      return;
    }

    // Password length boundaries
    if (cleanPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);
      return;
    }
    if (cleanPassword.length > 128) {
      setAuthError('Password cannot exceed 128 characters.');
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);
      return;
    }

    if (isSignUp && !cleanName) {
      setAuthError('Please enter your full name.');
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);
      return;
    }

    setLoading(true);
    try {
      let u;
      if (isSignUp) {
        u = await signUpUser(cleanEmail, cleanPassword, cleanName, targetExam);
      } else {
        u = await logInUser(cleanEmail, cleanPassword);
      }

      if (!u) {
        throw new Error('Authentication process did not return an active session.');
      }

      setFailedAttempts(0);
      setLockoutSeconds(0);
      markVisited();
      if (onAuthSuccess) onAuthSuccess(u);
    } catch (err) {
      console.warn("Auth failure code:", err?.code || 'unknown');
      let msg = 'Authentication failed. Please try again.';
      const errCode = err?.code || '';
      const errMsg = err?.message || '';

      if (errCode === 'auth/invalid-credential' || errMsg.includes('invalid-credential') || errMsg.includes('wrong-password') || errMsg.includes('user-not-found')) {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (errCode === 'auth/email-already-in-use' || errMsg.includes('email-already-in-use')) {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (errCode === 'auth/weak-password' || errMsg.includes('weak-password')) {
        msg = 'Password should be at least 6 characters.';
      } else if (errCode === 'auth/invalid-email' || errMsg.includes('invalid-email')) {
        msg = 'Please enter a valid email address.';
      } else if (errCode === 'auth/too-many-requests' || errMsg.includes('too-many-requests')) {
        msg = 'Access temporarily restricted due to many failed attempts. Please wait a moment.';
      }

      // Increment failed attempts counter and engage progressive lockout
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      if (nextFailures >= 5) {
        setLockoutSeconds(30);
        msg = '5 failed attempts detected. Cooldown activated for 30 seconds.';
      }
      
      setAuthError(msg);
      setTransitionState('error-return');
      setTimeout(() => {
        setTransitionState('idle');
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    if (lockoutSeconds > 0) {
      setAuthError(`Cooldown active: please wait ${lockoutSeconds}s.`);
      return;
    }
    setGoogleLoading(true);
    try {
      const u = await signInWithGoogle();
      if (!u) {
        throw new Error('Sign-in cancelled.');
      }
      setFailedAttempts(0);
      setLockoutSeconds(0);
      markVisited();
      if (onAuthSuccess) onAuthSuccess(u);
    } catch (err) {
      console.warn("Google Auth failure:", err?.code || err?.message || 'unknown');
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);

      if (!err?.message?.includes('popup-closed-by-user')) {
        if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
          setAuthError("Google Sign-In is disabled in Firebase Console. You can sign in with Email & Password or Continue as Guest.");
        } else {
          setAuthError(err?.message || 'Google sign-in failed. Please try again.');
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div 
      className={`skiper-auth-root ${transitionState === 'success-exit' ? 'is-exiting' : ''} ${transitionState === 'error-return' ? 'is-returning' : ''}`}
      data-theme={activeTheme}
    >
      {/* High-Performance WebGL Dither Wave Background */}
      <div className="auth-dither-backdrop" aria-hidden="true">
        <DitherBackground 
          activeTheme={activeTheme} 
          opacity={0.32} 
          ditherSize={2.4} 
          waveSpeed={0.22} 
        />
      </div>

      {/* Ambient Darkening Veil */}
      <div className="auth-bg-veil" aria-hidden="true" />

      {/* Clean Single Card Container */}
      <div className={`skiper-split-card auth-clean-card ${transitionState === 'success-exit' ? 'split-card-exit' : ''} ${transitionState === 'error-return' ? 'split-card-return' : ''}`}>
        
        <div className="skiper-form-column auth-clean-column">
          
          {/* Brand & Clean Title */}
          <div className="auth-clean-header">
            <div className="auth-brand-badge">
              <BrandLogo size={28} />
              <span className="auth-brand-label">CATalyze</span>
            </div>

            <h1 className="auth-clean-title">
              {isSignUp ? 'Create your account' : hasVisitedBefore ? 'Welcome back' : 'Sign in'}
            </h1>
            <p className="auth-clean-subtitle">
              {isSignUp
                ? 'Start tracking drills, errors, and daily progress.'
                : 'Enter your credentials to access your study workspace.'}
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="skiper-error-banner" role="alert">
              <Icons.AlertCircle size={15} />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form className="skiper-form" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="skiper-input-group">
                <label className="skiper-label">Full Name</label>
                <SmoothCaretInput
                  type="text"
                  placeholder="Sunny Pathak"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading || googleLoading || lockoutSeconds > 0}
                  autoComplete="name"
                  maxLength={50}
                  required
                />
              </div>
            )}

            <div className="skiper-input-group">
              <label className="skiper-label">Email</label>
              <SmoothCaretInput
                type="email"
                placeholder="youremail@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || googleLoading || lockoutSeconds > 0}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={100}
                required
              />
            </div>

            <div className="skiper-input-group">
              <label className="skiper-label">Password</label>
              <div className="skiper-pwd-container">
                <SmoothCaretInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading || lockoutSeconds > 0}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  minLength={6}
                  maxLength={128}
                  required
                >
                  <button
                    type="button"
                    className="skiper-pwd-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Icons.EyeOff size={15} /> : <Icons.Eye size={15} />}
                  </button>
                </SmoothCaretInput>
              </div>
            </div>

            {isSignUp && (
              <div className="skiper-input-group" style={{ position: 'relative', zIndex: 100 }}>
                <label className="skiper-label">Target Examination</label>
                <AnimatedSelect
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  disabled={loading || googleLoading || lockoutSeconds > 0}
                  options={[
                    { value: 'CAT', label: 'CAT', badge: 'Primary' },
                    { value: 'XAT', label: 'XAT', badge: 'Decision' },
                    { value: 'SNAP / NMAT', label: 'SNAP / NMAT', badge: 'Speed' },
                    { value: 'All MBA Entrances', label: 'All MBA Entrances', badge: 'Complete' }
                  ]}
                />
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="skiper-submit-btn auth-tactile-submit"
              disabled={loading || googleLoading || lockoutSeconds > 0}
            >
              {loading ? (
                <span className="skiper-loading-spinner" />
              ) : lockoutSeconds > 0 ? (
                <span>Cooldown ({lockoutSeconds}s)</span>
              ) : isSignUp ? (
                <span>Create Account</span>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="skiper-divider-row auth-clean-divider">
            <span className="skiper-divider-line" />
            <span className="skiper-divider-text">or</span>
            <span className="skiper-divider-line" />
          </div>

          {/* Google OAuth Button */}
          <div className="skiper-social-wrap">
            <button
              type="button"
              className="skiper-google-btn auth-tactile-google"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              title="Continue with Google"
            >
              {googleLoading ? (
                <span className="skiper-loading-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Switch Row & Guest Link */}
          <div className="auth-clean-footer">
            <div className="skiper-switch-container">
              {isSignUp ? (
                <p className="skiper-switch-p">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="skiper-switch-link"
                    onClick={() => {
                      setIsSignUp(false);
                      setAuthError('');
                    }}
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p className="skiper-switch-p">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="skiper-switch-link"
                    onClick={() => {
                      setIsSignUp(true);
                      setAuthError('');
                    }}
                  >
                    Sign up
                  </button>
                </p>
              )}
            </div>

            {onContinueAsGuest && (
              <div className="skiper-guest-wrap">
                <button
                  type="button"
                  className="skiper-guest-link auth-clean-guest-link"
                  onClick={handleContinueGuest}
                >
                  <span>Continue as Offline Guest</span>
                  <Icons.ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
