import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  sanitizeUrl, 
  isValidDocumentId, 
  sanitizeText, 
  sanitizeObjectForPrototypePollution 
} from '../../utils/textUtils';
import { validateAndSanitizeBackup } from '../../utils/storage';
import AvatarRenderer from '../AvatarRenderer';
import AuthScreen from '../AuthScreen';
import * as firebaseAuth from '../../utils/firebase';

vi.mock('../../utils/firebase', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    logInUser: vi.fn(),
    signUpUser: vi.fn(),
    signInWithGoogle: vi.fn(),
  };
});

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {}
    };
  };
});

describe('Cyber Security Audit & Defensive Sanitization Suite', () => {
  describe('URL Protocol Whitelisting & Injection Prevention (sanitizeUrl)', () => {
    it('accepts valid HTTPS image URLs', () => {
      const url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('upgrades insecure HTTP to HTTPS', () => {
      const url = 'http://example.com/avatar.png';
      expect(sanitizeUrl(url)).toBe('https://example.com/avatar.png');
    });

    it('accepts safe base64 image data URIs', () => {
      const base64Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      expect(sanitizeUrl(base64Png)).toBe(base64Png);
    });

    it('strictly neutralizes javascript: protocol injection', () => {
      expect(sanitizeUrl('javascript:alert(document.cookie)')).toBe('');
      expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
      expect(sanitizeUrl('javascript:/*--></title></style></textarea></script>alert(1)')).toBe('');
    });

    it('strictly neutralizes data:text/html XSS payloads', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
      expect(sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe('');
    });

    it('neutralizes vbscript, file, and malformed protocols', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
      expect(sanitizeUrl('file:///etc/passwd')).toBe('');
      expect(sanitizeUrl('   ')).toBe('');
      expect(sanitizeUrl(null)).toBe('');
      expect(sanitizeUrl(undefined)).toBe('');
    });
  });

  describe('Firestore Document ID Path Traversal Protection (isValidDocumentId)', () => {
    it('approves legitimate alphanumeric and hyphenated IDs', () => {
      expect(isValidDocumentId('ASP-849201')).toBe(true);
      expect(isValidDocumentId('user_942_test')).toBe(true);
      expect(isValidDocumentId('firebase-uid-12345')).toBe(true);
    });

    it('rejects path traversal attempts containing forward or backward slashes', () => {
      expect(isValidDocumentId('../../profiles/admin')).toBe(false);
      expect(isValidDocumentId('users/evil_user/tokens')).toBe(false);
      expect(isValidDocumentId('..\\..\\passwords')).toBe(false);
      expect(isValidDocumentId('/')).toBe(false);
    });

    it('rejects empty, overlong, or non-string inputs', () => {
      expect(isValidDocumentId('')).toBe(false);
      expect(isValidDocumentId('   ')).toBe(false);
      expect(isValidDocumentId('a'.repeat(129))).toBe(false);
      expect(isValidDocumentId(null)).toBe(false);
      expect(isValidDocumentId(12345)).toBe(false);
    });
  });

  describe('Prototype Pollution Defense (sanitizeObjectForPrototypePollution)', () => {
    it('strips __proto__, constructor, and prototype keys from untrusted JSON objects', () => {
      const maliciousPayload = JSON.parse('{"validKey":"hello","__proto__":{"polluted":"yes"},"nested":{"constructor":{"admin":true},"normal":42}}');
      
      const clean = sanitizeObjectForPrototypePollution(maliciousPayload);
      expect(clean.validKey).toBe('hello');
      expect(clean.nested.normal).toBe(42);
      expect(clean.__proto__).toBeUndefined();
      expect(clean.nested.constructor).toBeUndefined();
      expect(({}).polluted).toBeUndefined();
    });
  });

  describe('Backup Payload Validation (validateAndSanitizeBackup)', () => {
    it('validates and normalizes legitimate backup payloads', () => {
      const validBackup = JSON.stringify({
        tracker: { 'Month 1': [] },
        studyPlan: [],
        mocks: []
      });

      const normalized = validateAndSanitizeBackup(validBackup);
      expect(normalized).toBeDefined();
      expect(normalized.tracker).toBeDefined();
      expect(normalized.studyPlan).toBeDefined();
    });

    it('rejects oversized JSON bombs (> 10MB)', () => {
      const hugeString = 'a'.repeat(10 * 1024 * 1024 + 1);
      expect(() => validateAndSanitizeBackup(hugeString)).toThrow(/exceeds maximum allowed limit/i);
    });

    it('rejects corrupt or structurally incomplete JSON', () => {
      expect(() => validateAndSanitizeBackup('not a json')).toThrow();
      expect(() => validateAndSanitizeBackup('{"someOtherKey":123}')).toThrow(/missing tracker/i);
    });
  });

  describe('AvatarRenderer XSS Neutralization', () => {
    it('safely falls back to initials/icons when a javascript: URL is supplied', () => {
      const { container } = render(
        <AvatarRenderer 
          avatar="javascript:alert('pwned')" 
          name="Alice Aspirant" 
          size={40} 
        />
      );

      // Must NOT contain an img element with javascript: URL
      const img = container.querySelector('img');
      expect(img).toBeNull();

      // Renders clean user initial fallback
      expect(screen.getByText('A')).toBeDefined();
    });

    it('renders clean img element with referrerPolicy when given safe HTTPS image', () => {
      const { container } = render(
        <AvatarRenderer 
          avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb" 
          name="Alice Aspirant" 
          size={40} 
        />
      );

      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
    });
  });

  describe('AuthScreen Rate-Limiting & Progressive Lockout Defense', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('locks out submit button with countdown after 5 consecutive failed attempts', async () => {
      firebaseAuth.logInUser.mockRejectedValue(new Error('auth/invalid-credential'));

      const { container } = render(<AuthScreen onAuthSuccess={vi.fn()} onContinueAsGuest={vi.fn()} />);

      const emailInput = screen.getByPlaceholderText(/youremail@yourdomain\.com/i);
      const passwordInput = screen.getByPlaceholderText(/Create a password/i);
      const form = container.querySelector('form');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      // Trigger 5 consecutive failed attempts
      for (let i = 0; i < 5; i++) {
        fireEvent.submit(form);
        await waitFor(() => {
          expect(firebaseAuth.logInUser).toHaveBeenCalledTimes(i + 1);
        });
      }

      // 5th attempt must trigger progressive lockout cooldown
      await waitFor(() => {
        expect(screen.getByText(/5 failed attempts detected\. Cooldown activated/i)).toBeDefined();
      });

      // Submit button must be disabled with countdown
      const cooldownBtn = screen.getByRole('button', { name: /Cooldown/i });
      expect(cooldownBtn).toBeDefined();
      expect(cooldownBtn.hasAttribute('disabled')).toBe(true);
    });

    it('rejects invalid email formats before attempting backend authentication', async () => {
      const { container } = render(<AuthScreen onAuthSuccess={vi.fn()} onContinueAsGuest={vi.fn()} />);

      const emailInput = screen.getByPlaceholderText(/youremail@yourdomain\.com/i);
      const passwordInput = screen.getByPlaceholderText(/Create a password/i);
      const form = container.querySelector('form');

      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
      fireEvent.change(passwordInput, { target: { value: 'validpassword123' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeDefined();
      });

      // Backend must NOT have been called
      expect(firebaseAuth.logInUser).not.toHaveBeenCalled();
    });
  });
});

