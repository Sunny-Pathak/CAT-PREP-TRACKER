import React, { useState, useEffect } from 'react';
import { logInUser, signUpUser, signInWithGoogle } from '../utils/firebase';
import { Icons } from './AspirantIcons';
import DitherBackground from './DitherBackground';
import SmoothCaretInput from './animations/SmoothCaretInput';
import AnimatedSelect from './animations/AnimatedSelect';
import { stripEmojis } from '../utils/textUtils';
import './AuthScreen.css';

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

  // Has user visited before flag
  const [hasVisitedBefore] = useState(() => {
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

    if (lockoutSeconds > 0) {
      setAuthError(`Too many failed attempts. Please wait ${lockoutSeconds}s.`);
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setAuthError('Please enter a valid email address.');
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);
      return;
    }

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
      setTransitionState('success-exit');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(u);
      }, 350);
    } catch (err) {
      console.warn("Auth failure code:", err?.code || 'unknown');
      let msg = 'Authentication failed. Please try again.';
      const errCode = err?.code || '';
      const errMsg = err?.message || '';

      if (errCode === 'auth/invalid-credential' || errMsg.includes('invalid-credential') || errMsg.includes('wrong-password') || errMsg.includes('user-not-found')) {
        msg = 'Invalid credentials. Please verify your email and password.';
      } else if (errCode === 'auth/email-already-in-use' || errMsg.includes('email-already-in-use')) {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (errCode === 'auth/weak-password' || errMsg.includes('weak-password')) {
        msg = 'Password should be at least 6 characters.';
      } else if (errCode === 'auth/invalid-email' || errMsg.includes('invalid-email')) {
        msg = 'Please enter a valid email address.';
      } else if (errCode === 'auth/too-many-requests' || errMsg.includes('too-many-requests')) {
        msg = 'Access temporarily restricted due to many failed attempts. Please wait.';
      }

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
      setTransitionState('success-exit');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(u);
      }, 350);
    } catch (err) {
      console.warn("Google Auth failure:", err?.code || err?.message || 'unknown');
      setTransitionState('error-return');
      setTimeout(() => setTransitionState('idle'), 600);

      if (!err?.message?.includes('popup-closed-by-user')) {
        if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
          setAuthError("Google Sign-In is disabled in Firebase Console. Sign in with Email or Continue as Guest.");
        } else {
          setAuthError(err?.message || 'Google sign-in failed. Please try again.');
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="clean-auth-root" data-theme={activeTheme}>
      {/* Subtle Ambient Atmosphere */}
      <div className="clean-auth-bg-glow" aria-hidden="true" />
      <div className="clean-auth-bg-dither" aria-hidden="true">
        <DitherBackground 
          activeTheme={activeTheme} 
          opacity={0.14} 
          ditherSize={2.4} 
          waveSpeed={0.20} 
        />
      </div>

      {/* Central Clean Obsidian Card */}
      <main className={`clean-auth-card ${transitionState === 'success-exit' ? 'clean-card-exit' : ''} ${transitionState === 'error-return' ? 'clean-card-return' : ''}`}>
        
        {/* Header */}
        <div className="clean-auth-header">
          <div className="clean-brand-row">
            <div className="brand-square-glyph" />
            <span className="clean-brand-name">CATALYZE</span>
          </div>

          <h1 className="clean-auth-title">
            {isSignUp ? 'Create an account' : hasVisitedBefore ? 'Welcome back' : 'Sign in'}
          </h1>
        </div>

        {/* Error Banner */}
        {authError && (
          <div className="clean-error-banner" role="alert">
            <Icons.AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </div>
        )}

        {/* 1-Tap Google Entry (First-class option) */}
        <button
          type="button"
          className="clean-google-btn"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          title="Continue with Google"
        >
          {googleLoading ? (
            <span>Connecting...</span>
          ) : (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Clean Divider */}
        <div className="clean-divider-row">
          <span className="clean-divider-line" />
          <span className="clean-divider-text">or with email</span>
          <span className="clean-divider-line" />
        </div>

        {/* Email Form */}
        <form className="clean-auth-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="clean-input-group">
              <label className="clean-label">Full Name</label>
              <div className="clean-field-box">
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
            </div>
          )}

          <div className="clean-input-group">
            <label className="clean-label">Email</label>
            <div className="clean-field-box">
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
          </div>

          <div className="clean-input-group">
            <label className="clean-label">Password</label>
            <div className="clean-field-box">
              <SmoothCaretInput
                type={showPassword ? 'text' : 'password'}
                placeholder={isSignUp ? "Create a password (min 6 characters)" : "Create a password or enter your password"}
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
                  className="clean-pwd-toggle"
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
            <div className="clean-input-group" style={{ position: 'relative', zIndex: 100 }}>
              <label className="clean-label">Target Examination</label>
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

          {/* Action Button */}
          <button
            type="submit"
            className="clean-submit-btn"
            disabled={loading || googleLoading || lockoutSeconds > 0}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : lockoutSeconds > 0 ? (
              <span>Cooldown ({lockoutSeconds}s)</span>
            ) : isSignUp ? (
              <span>Create account →</span>
            ) : (
              <span>Sign in →</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="clean-auth-footer">
          <p className="clean-switch-text">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="clean-switch-link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError('');
              }}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          {onContinueAsGuest && (
            <button
              type="button"
              className="clean-guest-btn"
              onClick={handleContinueGuest}
            >
              <span>Continue as guest</span>
              <Icons.ChevronRight size={13} />
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
