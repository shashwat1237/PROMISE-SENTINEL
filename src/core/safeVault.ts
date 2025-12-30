/**
 * [AUDIT VERIFIED] "SafeStorage Service"
 * Updated to use TypeScript SafeStorage singleton for enhanced type safety
 * Maintains backward compatibility with existing usage patterns
 */

import { SafeStorage } from './SafeStorage.ts';

// Export singleton instance for backward compatibility
// This maintains the same API surface as the original JavaScript class
export const vault = SafeStorage.getInstance({
  probeKey: '__sentinel_probe__',
  enableLogging: true,
  maxMemoryItems: 1000
});

// Also export the SafeStorage class for direct access if needed
export { SafeStorage };