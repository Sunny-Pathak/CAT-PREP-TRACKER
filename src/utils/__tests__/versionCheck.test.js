import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  APP_VERSION, 
  isNewerVersion, 
  checkForAppUpdate, 
  dismissUpdateForSession 
} from '../versionCheck';

describe('Version Check & OTA Update Engine', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('isNewerVersion semver comparison', () => {
    it('correctly identifies newer patch, minor, and major versions', () => {
      expect(isNewerVersion('1.0.93', '1.0.92')).toBe(true);
      expect(isNewerVersion('1.1.0', '1.0.92')).toBe(true);
      expect(isNewerVersion('2.0.0', '1.0.92')).toBe(true);
      expect(isNewerVersion('v1.0.93', '1.0.92')).toBe(true);
    });

    it('returns false when remote version is equal or older', () => {
      expect(isNewerVersion('1.0.92', '1.0.92')).toBe(false);
      expect(isNewerVersion('1.0.91', '1.0.92')).toBe(false);
      expect(isNewerVersion('1.0.90', '1.0.92')).toBe(false);
      expect(isNewerVersion('0.9.99', '1.0.92')).toBe(false);
      expect(isNewerVersion('', '1.0.92')).toBe(false);
      expect(isNewerVersion(null, '1.0.92')).toBe(false);
    });
  });

  describe('checkForAppUpdate', () => {
    it('returns null on localhost when __FORCE_UPDATE_CHECK__ is not enabled', async () => {
      const res = await checkForAppUpdate();
      expect(res).toBeNull();
    });

    it('returns update when forced and remote version is strictly newer', async () => {
      window.__FORCE_UPDATE_CHECK__ = true;
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          version: '1.0.99',
          releaseNotes: 'Speed optimizations deployed'
        })
      });

      const update = await checkForAppUpdate();
      expect(update).toBeDefined();
      expect(update.version).toBe('1.0.99');
      delete window.__FORCE_UPDATE_CHECK__;
    });

    it('returns null when forced but remote version matches current APP_VERSION', async () => {
      window.__FORCE_UPDATE_CHECK__ = true;
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          version: APP_VERSION,
          releaseNotes: 'Current version'
        })
      });

      const update = await checkForAppUpdate();
      expect(update).toBeNull();
      delete window.__FORCE_UPDATE_CHECK__;
    });

    it('honors session dismissal for a given version', async () => {
      window.__FORCE_UPDATE_CHECK__ = true;
      dismissUpdateForSession('1.0.99');

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          version: '1.0.99',
          releaseNotes: 'Speed optimizations'
        })
      });

      const update = await checkForAppUpdate();
      expect(update).toBeNull();
      delete window.__FORCE_UPDATE_CHECK__;
    });
  });
});
