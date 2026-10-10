export const APP_VERSION = "1.0.95";
export const APP_BUILD_TIME = new Date().toISOString();

/**
 * Compare two semver strings to determine if remote is strictly newer than current.
 */
export function isNewerVersion(remote, current) {
  if (!remote || !current) return false;
  const parse = (v) => String(v).replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const r = parse(remote);
  const c = parse(current);
  for (let i = 0; i < 3; i++) {
    if ((r[i] || 0) > (c[i] || 0)) return true;
    if ((r[i] || 0) < (c[i] || 0)) return false;
  }
  return false;
}

export async function checkForAppUpdate() {
  try {
    // In local development, avoid popping update banners while editing/using HMR
    if (typeof window !== 'undefined') {
      const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local')
      );
      if (isLocalhost && !window.__FORCE_UPDATE_CHECK__) {
        return null;
      }
    }

    const origin = (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') 
      ? window.location.origin 
      : '';
    const url = origin ? `${origin}/version.json?t=${Date.now()}` : `/version.json?t=${Date.now()}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.version) return null;

    // Check if user dismissed this update during this active session
    if (typeof sessionStorage !== 'undefined') {
      const dismissed = sessionStorage.getItem(`catalyze_dismissed_update_${data.version}`);
      if (dismissed === 'true') return null;
    }

    // Only notify if remote version is strictly newer than the running bundle's APP_VERSION
    if (isNewerVersion(data.version, APP_VERSION)) {
      return data;
    }

    // Keep localStorage synchronized with current running version
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('catalyze_installed_version', APP_VERSION);
    }
    return null;
  } catch (err) {
    console.warn("Update check error:", err);
    return null;
  }
}

export function dismissUpdateForSession(version) {
  if (typeof sessionStorage !== 'undefined' && version) {
    sessionStorage.setItem(`catalyze_dismissed_update_${version}`, 'true');
  }
}

export async function applyInstantUpdate(newVersion) {
  if (typeof localStorage !== 'undefined' && newVersion) {
    localStorage.setItem('catalyze_installed_version', newVersion);
  }
  if (typeof window !== 'undefined') {
    if ('caches' in window) {
      try {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      } catch (_e) {}
    }
    if ('serviceWorker' in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.update()));
      } catch (_e) {}
    }
    // Hard refresh with query parameter to bypass stale HTTP disk caches
    const url = new URL(window.location.href);
    url.searchParams.set('v_reload', Date.now().toString());
    window.location.href = url.toString();
  }
}
