/**
 * Property-based tests for Safe Storage System interface definitions
 * Feature: safe-storage-system, Property 1: Type safety validation
 * Validates: Requirements 5.1, 6.1
 */

import fc from 'fast-check';
import {
  StorageItem,
  SentinelStorageEvent,
  VaultPayload,
  SafeStorageConfig,
  StorageStats,
  StorageError,
  StorageErrorType
} from './types';

describe('Safe Storage System Interface Type Safety', () => {
  /**
   * Property 1: Type safety validation
   * For any valid data conforming to our interfaces, the TypeScript compiler
   * should accept the data and all required properties should be present
   * Validates: Requirements 5.1, 6.1
   */
  
  test('Property 1: StorageItem interface maintains type safety', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1 }), // key
      fc.string(), // value
      fc.integer({ min: 0 }), // timestamp
      (key, value, timestamp) => {
        const item: StorageItem = { key, value, timestamp };
        
        // Type safety validation - these should compile without errors
        expect(typeof item.key).toBe('string');
        expect(typeof item.value).toBe('string');
        expect(typeof item.timestamp).toBe('number');
        expect(item.key.length).toBeGreaterThan(0);
        expect(item.timestamp).toBeGreaterThanOrEqual(0);
      }
    ), { numRuns: 100 });
  });

  test('Property 1: SentinelStorageEvent interface maintains type safety for custom events', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1 }), // key
      fc.oneof(fc.string(), fc.constant(null)), // newValue
      fc.oneof(fc.string(), fc.constant(null)), // oldValue
      fc.string(), // url
      fc.boolean(), // isAirGapped
      (key, newValue, oldValue, url, isAirGapped) => {
        // Create a mock SentinelStorageEvent-like object
        const event = {
          key,
          newValue,
          oldValue,
          storageArea: null as Storage | null,
          url,
          isAirGapped,
          // Required StorageEvent properties
          bubbles: false,
          cancelBubble: false,
          cancelable: false,
          composed: false,
          currentTarget: null,
          defaultPrevented: false,
          eventPhase: 0,
          isTrusted: false,
          returnValue: false,
          srcElement: null,
          target: null,
          timeStamp: Date.now(),
          type: 'storage'
        } as SentinelStorageEvent;
        
        // Type safety validation for Requirements 5.1 (custom StorageEvent)
        expect(typeof event.key).toBe('string');
        expect(event.key.length).toBeGreaterThan(0);
        expect(event.newValue === null || typeof event.newValue === 'string').toBe(true);
        expect(event.oldValue === null || typeof event.oldValue === 'string').toBe(true);
        expect(typeof event.url).toBe('string');
        expect(typeof event.isAirGapped).toBe('boolean'); // Validates Requirement 6.1
      }
    ), { numRuns: 100 });
  });

  test('Property 1: VaultPayload interface maintains cryptographic type safety', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1 }), // data
      fc.boolean(), // encrypted
      fc.option(fc.string()), // optional checksum
      (data, encrypted, checksum) => {
        const payload: VaultPayload = {
          data,
          encrypted,
          ...(checksum !== null && { checksum })
        };
        
        // Type safety validation for cryptographic payloads
        expect(typeof payload.data).toBe('string');
        expect(payload.data.length).toBeGreaterThan(0);
        expect(typeof payload.encrypted).toBe('boolean');
        if (payload.checksum !== undefined) {
          expect(typeof payload.checksum).toBe('string');
        }
      }
    ), { numRuns: 100 });
  });

  test('Property 1: SafeStorageConfig interface maintains configuration type safety', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1 }), // probeKey
      fc.boolean(), // enableLogging
      fc.integer({ min: 1, max: 10000 }), // maxMemoryItems
      (probeKey, enableLogging, maxMemoryItems) => {
        const config: SafeStorageConfig = {
          probeKey,
          enableLogging,
          maxMemoryItems
        };
        
        // Type safety validation for configuration
        expect(typeof config.probeKey).toBe('string');
        expect(config.probeKey.length).toBeGreaterThan(0);
        expect(typeof config.enableLogging).toBe('boolean');
        expect(typeof config.maxMemoryItems).toBe('number');
        expect(config.maxMemoryItems).toBeGreaterThan(0);
      }
    ), { numRuns: 100 });
  });

  test('Property 1: StorageStats interface maintains diagnostic type safety', () => {
    fc.assert(fc.property(
      fc.boolean(), // isAirGapped - Validates Requirement 6.1
      fc.integer({ min: 0 }), // memoryItemCount
      fc.boolean(), // localStorageAvailable
      fc.integer({ min: 0 }), // lastProbeTime
      fc.integer({ min: 0 }), // totalOperations
      fc.integer({ min: 0 }), // failedOperations
      (isAirGapped, memoryItemCount, localStorageAvailable, lastProbeTime, totalOperations, failedOperations) => {
        const stats: StorageStats = {
          isAirGapped,
          memoryItemCount,
          localStorageAvailable,
          lastProbeTime,
          totalOperations,
          failedOperations
        };
        
        // Type safety validation for diagnostics - Validates Requirement 6.1
        expect(typeof stats.isAirGapped).toBe('boolean');
        expect(typeof stats.memoryItemCount).toBe('number');
        expect(stats.memoryItemCount).toBeGreaterThanOrEqual(0);
        expect(typeof stats.localStorageAvailable).toBe('boolean');
        expect(typeof stats.lastProbeTime).toBe('number');
        expect(stats.lastProbeTime).toBeGreaterThanOrEqual(0);
        expect(typeof stats.totalOperations).toBe('number');
        expect(stats.totalOperations).toBeGreaterThanOrEqual(0);
        expect(typeof stats.failedOperations).toBe('number');
        expect(stats.failedOperations).toBeGreaterThanOrEqual(0);
      }
    ), { numRuns: 100 });
  });

  test('Property 1: StorageError interface maintains error handling type safety', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(StorageErrorType)), // type
      fc.string({ minLength: 1 }), // message
      fc.constantFrom('air_gap', 'retry', 'fail'), // recoveryAction
      fc.integer({ min: 0 }), // timestamp
      (type, message, recoveryAction, timestamp) => {
        const error: StorageError = {
          type,
          message,
          recoveryAction,
          timestamp
        };
        
        // Type safety validation for error handling
        expect(Object.values(StorageErrorType)).toContain(error.type);
        expect(typeof error.message).toBe('string');
        expect(error.message.length).toBeGreaterThan(0);
        expect(['air_gap', 'retry', 'fail']).toContain(error.recoveryAction);
        expect(typeof error.timestamp).toBe('number');
        expect(error.timestamp).toBeGreaterThanOrEqual(0);
      }
    ), { numRuns: 100 });
  });

  test('Property 1: StorageErrorType enum maintains consistent error categorization', () => {
    // Validate that all enum values are strings and follow expected pattern
    const errorTypes = Object.values(StorageErrorType);
    
    expect(errorTypes).toHaveLength(4);
    expect(errorTypes).toContain('quota_exceeded');
    expect(errorTypes).toContain('access_denied');
    expect(errorTypes).toContain('storage_disabled');
    expect(errorTypes).toContain('unknown_error');
    
    // All enum values should be strings with underscores
    errorTypes.forEach(errorType => {
      expect(typeof errorType).toBe('string');
      expect(errorType).toMatch(/^[a-z]+(_[a-z]+)*$/);
    });
  });
});