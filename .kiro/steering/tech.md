# Technical Constraints
- **Current Stack**: React 18, Vite, JavaScript (.jsx), CommonJS/ESM Hybrid.
- **Target Stack**: React 18, Vite, **Strict TypeScript (.tsx)**.

# Hardening Rules
1. **Zero 'Any' Policy**: No usage of the `any` type is permitted. You must define interfaces for `Transaction`, `GraphNode`, and `VaultPayload`.
2. **File Extensions**: All component files must be renamed from `.jsx` to `.tsx`.
3. **Typed Events**: The 'SafeVault' must use a custom `SentinelStorageEvent` interface extending the native `StorageEvent`.