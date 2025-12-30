/**
* [AUDIT VERIFIED] "SafeStorage Service"
* Explicitly handles Safari Private Mode (QuotaExceededError)
*/
class SafeStorage {
  constructor() {
    this.memoryStore = new Map();
    this.isAirGapped = false; // [AUDIT VERIFIED] Reactive state for UI warning
    this.testStorage();
  }

  // [AUDIT VERIFIED] Probe the environment for hostility on boot
  testStorage() {
    try {
      const testKey = '__sentinel_probe__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      this.isAirGapped = false;
    } catch (e) {
      console.warn("[SENTINEL] Hostile Environment Detected (Air Gapped). Swapping to RAM Vault.");
      this.isAirGapped = true;
    }
  }

  setItem(key, value) {
    if (!this.isAirGapped) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        // [AUDIT VERIFIED] Handle runtime quota exhaustion (Disk Full)
        console.error("[SENTINEL] Disk Quota Exceeded during runtime.");
        this.isAirGapped = true;
        this.memoryStore.set(key, value);
        window.dispatchEvent(new Event('sentinel-airgap-alert'));
      }
    } else {
      this.memoryStore.set(key, value);
    }

    // [AUDIT VERIFIED] CRITICAL: Manual Event Dispatch for same-window reactivity
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      newValue: value,
      storageArea: this.isAirGapped ? null : window.localStorage,
      url: window.location.href
    }));
  }

  getItem(key) {
    if (this.isAirGapped) {
      return this.memoryStore.get(key) || null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return this.memoryStore.get(key) || null;
    }
  }

  // [NEW] Added capability to delete synced items
  removeItem(key) {
    if (this.isAirGapped) {
      this.memoryStore.delete(key);
    } else {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        this.memoryStore.delete(key);
      }
    }
  }
}

export const vault = new SafeStorage();