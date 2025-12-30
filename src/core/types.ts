/**
 * TypeScript interfaces and types for the Safe Storage System
 * Provides strict type safety for all storage operations and cryptographic payloads
 */

/**
 * Represents a stored item with metadata
 */
export interface StorageItem {
  key: string;
  value: string;
  timestamp: number;
}

/**
 * Custom storage event interface extending the native StorageEvent
 * Used for cross-component reactivity with air-gap awareness
 */
export interface SentinelStorageEvent extends StorageEvent {
  key: string;
  newValue: string | null;
  oldValue: string | null;
  storageArea: Storage | null;
  url: string;
  isAirGapped: boolean;
}

/**
 * Cryptographic vault payload structure
 * Ensures type safety for encrypted transaction data
 */
export interface VaultPayload {
  data: string;
  encrypted: boolean;
  checksum?: string;
}

/**
 * Configuration options for SafeStorage initialization
 */
export interface SafeStorageConfig {
  probeKey: string;
  enableLogging: boolean;
  maxMemoryItems: number;
}

/**
 * Storage system statistics and diagnostics
 */
export interface StorageStats {
  isAirGapped: boolean;
  memoryItemCount: number;
  localStorageAvailable: boolean;
  lastProbeTime: number;
  totalOperations: number;
  failedOperations: number;
}

/**
 * Error categorization for storage operations
 */
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'quota_exceeded',
  ACCESS_DENIED = 'access_denied',
  STORAGE_DISABLED = 'storage_disabled',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Structured error information for storage failures
 */
export interface StorageError {
  type: StorageErrorType;
  message: string;
  recoveryAction: 'air_gap' | 'retry' | 'fail';
  timestamp: number;
}