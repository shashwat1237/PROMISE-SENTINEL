/**
 * SafeStorage - Singleton TypeScript class for resilient data storage
 * Provides automatic fallback capabilities and air-gap detection
 * Maintains backward compatibility with existing SafeVault API
 */

import { SafeStorageConfig, StorageStats, SentinelStorageEvent } from './types';

export class SafeStorage {
  private static instance: SafeStorage;
  private memoryStore: Map<string, string>;
  private isAirGapped: boolean;
  private config: SafeStorageConfig;
  private totalOperations: number;
  private failedOperations: number;
  private lastProbeTime: number;

  /**
   * Private constructor enforces singleton pattern
   * @param config Optional configuration overrides
   */
  private constructor(config?: Partial<SafeStorageConfig>) {
    // Initialize default configuration
    this.config = {
      probeKey: '__sentinel_probe__',
      enableLogging: true,
      maxMemoryItems: 1000,
      ...config
    };

    // Initialize private fields
    this.memoryStore = new Map<string, string>();
    this.isAirGapped = false;
    this.totalOperations = 0;
    this.failedOperations = 0;
    this.lastProbeTime = 0;

    // Perform initial storage probing
    this.testStorage();
  }

  /**
   * Static method to get singleton instance
   * @param config Optional configuration for first-time initialization
   * @returns SafeStorage singleton instance
   */
  public static getInstance(config?: Partial<SafeStorageConfig>): SafeStorage {
    if (!SafeStorage.instance) {
      SafeStorage.instance = new SafeStorage(config);
    }
    return SafeStorage.instance;
  }

  /**
   * Test storage availability and set air-gap mode accordingly
   * Probes localStorage to detect hostile environments
   */
  private testStorage(): void {
    this.lastProbeTime = Date.now();
    
    try {
      window.localStorage.setItem(this.config.probeKey, '1');
      window.localStorage.removeItem(this.config.probeKey);
      this.isAirGapped = false;
      
      if (this.config.enableLogging) {
        console.log('[SENTINEL] Storage probe successful - Normal mode');
      }
    } catch (error) {
      this.isAirGapped = true;
      this.failedOperations++;
      
      if (this.config.enableLogging) {
        console.warn('[SENTINEL] Hostile Environment Detected (Air Gapped). Swapping to RAM Vault.');
      }
    }
  }

  /**
   * Store a key-value pair with automatic fallback handling
   * @param key Storage key
   * @param value Storage value
   */
  public setItem(key: string, value: string): void {
    this.totalOperations++;

    if (!this.isAirGapped) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        // Handle runtime quota exhaustion
        if (this.config.enableLogging) {
          console.error('[SENTINEL] Disk Quota Exceeded during runtime.');
        }
        
        this.switchToAirGapMode();
        this.memoryStore.set(key, value);
        this.failedOperations++;
      }
    } else {
      this.memoryStore.set(key, value);
    }

    // Dispatch custom storage event for reactivity
    this.dispatchStorageEvent(key, value);
  }

  /**
   * Retrieve a value by key with fallback handling
   * @param key Storage key
   * @returns Stored value or null if not found
   */
  public getItem(key: string): string | null {
    this.totalOperations++;

    if (this.isAirGapped) {
      return this.memoryStore.get(key) || null;
    }

    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      this.failedOperations++;
      return this.memoryStore.get(key) || null;
    }
  }

  /**
   * Remove a key-value pair with fallback handling
   * @param key Storage key to remove
   */
  public removeItem(key: string): void {
    this.totalOperations++;

    if (this.isAirGapped) {
      this.memoryStore.delete(key);
    } else {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        this.failedOperations++;
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * Get current air-gap status
   * @returns True if in air-gap mode, false otherwise
   */
  public getAirGapStatus(): boolean {
    return this.isAirGapped;
  }

  /**
   * Get comprehensive storage statistics
   * @returns StorageStats object with diagnostic information
   */
  public getStorageStats(): StorageStats {
    return {
      isAirGapped: this.isAirGapped,
      memoryItemCount: this.memoryStore.size,
      localStorageAvailable: !this.isAirGapped,
      lastProbeTime: this.lastProbeTime,
      totalOperations: this.totalOperations,
      failedOperations: this.failedOperations
    };
  }

  /**
   * Switch to air-gap mode and dispatch alert event
   * @private
   */
  private switchToAirGapMode(): void {
    this.isAirGapped = true;
    this.dispatchAirGapAlert();
  }

  /**
   * Dispatch custom storage event for cross-component reactivity
   * @param key Storage key
   * @param newValue New value (or null for removal)
   * @private
   */
  private dispatchStorageEvent(key: string, newValue: string | null): void {
    const event = new StorageEvent('storage', {
      key: key,
      newValue: newValue,
      storageArea: this.isAirGapped ? null : window.localStorage,
      url: window.location.href
    }) as SentinelStorageEvent;

    // Add air-gap awareness to the event
    (event as any).isAirGapped = this.isAirGapped;

    window.dispatchEvent(event);
  }

  /**
   * Dispatch air-gap alert event for UI notifications
   * @private
   */
  private dispatchAirGapAlert(): void {
    window.dispatchEvent(new Event('sentinel-airgap-alert'));
  }
}