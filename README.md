# Promise Sentinel



***FOR MERCHANT CONSOLE GO TO https://promise-sentinel.vercel.app/ and then click on INITIALIZE SENTINEL_OS***

***FOR GOD MODE/ TECH VIEW GO TO https://promise-sentinel.vercel.app/god-mode and then click on INITIALIZE SENTINEL_OS***




**The Local-First Flight Recorder for the Offline Economy**

Promise Sentinel is an **offline-first transaction recording system** built to demonstrate how web applications can remain reliable in **hostile environments** such as weak connectivity, Safari Private Mode, and browser storage failures.

This project focuses on **protocol hardening**, not payments.

---

## Overview

In real-world high-density environments (festivals, pop-ups, mobile vendors), network connectivity often degrades instead of fully disconnecting. This “Lie-Fi” state causes many web applications to freeze, crash, or silently lose data.

Promise Sentinel is designed to **never lose a transaction**, even when:
- the network is unreliable
- browser storage is blocked or full
- runtime assumptions fail

The system degrades gracefully instead of crashing.

---

## Core Principles

- **Local-first**: Transactions are secured locally before any network interaction
- **Storage is hostile by default**: Browser storage is actively probed and verified
- **Failure is explicit**: Degraded modes are visible, not hidden
- **Correctness over availability**: Data integrity is prioritized over convenience

---

## Key Features

### SafeStorage (Air-Gap Vault)
- Probes `localStorage` on startup
- Detects Safari Private Mode and quota exhaustion
- Automatically switches to an in-memory vault when storage fails
- Never throws storage errors upstream
- Emits explicit events for UI reactivity

### Cryptographic First-Write
- All transactions are encrypted using **AES-GCM**
- Encryption happens **before** data touches disk or memory
- Uses the browser-native Web Crypto API
- No plaintext persistence

### Visual Reliability Proof
- **Hex Inspector** shows encrypted payloads in real time
- **Network Graph** visualizes queued vs synced transactions
- **Air-Gap Indicator** signals storage degradation
- **Audio feedback** confirms success without visual attention

### Chaos Mode
- Intentionally simulates hostile environments
- Floods storage and breaks network assumptions
- Demonstrates that the system continues operating correctly

---

## Architecture

User Action  
↓  
Encrypt Payload (AES-GCM)  
↓  
SafeStorage Singleton  
↓  
Normal Mode (localStorage) / Air-Gap Mode (In-Memory Map)  
↓  
Custom Storage Events  
↓  
Reactive UI + Visual Diagnostics  

---

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion

### Storage & Resilience
- Custom SafeStorage engine
- localStorage with RAM fallback
- BroadcastChannel + custom events

### Security
- Web Crypto API
- AES-GCM encryption

### Visualization
- react-force-graph-2d
- D3-based force simulations

### Tooling
- TypeScript (strict, migration target)
- Jest
- fast-check (property-based testing)
- Kiro IDE (agentic guardrails)

---

## Running Locally

```bash
npm install
npm run dev
```

## Running deployed version online via Vercel

**FOR MERCHANT CONSOLE GO TO https://promise-sentinel.vercel.app/ and then click on INITIALIZE SENTINEL_OS   ,      FOR GOD MODE/ TECH VIEW GO TO https://promise-sentinel.vercel.app/god-mode and then click on INITIALIZE SENTINEL_OS**


### Requirements
- Modern browser with Web Crypto API support
- HTTPS or localhost (required for crypto APIs)

---

## Demo Flow

1. Select a product → encrypted data appears instantly
2. Enable Chaos Mode → network degrades, UI reflects failure
3. Continue transactions → data queues locally
4. Disable Chaos Mode → queue flushes automatically
5. Zero crashes, zero data loss

---

## What This Project Is

- A protocol-hardening demonstration
- An offline-first architecture case study
- A reliability and correctness showcase

---

## What This Project Is Not

- A real payment processor
- A POS replacement
- A backend-dependent system
- A cloud-first application

---

## Future Work

- Complete TypeScript migration
- Expanded property-based verification
- Multi-device synchronization
- Immutable ledger backends
- Hardware POS integration

---

## License

MIT
