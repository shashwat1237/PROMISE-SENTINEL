class ChaosMonkey {
  constructor() {
    this.isOffline = false;
    this.listeners = new Set();
  }

  toggle() {
    this.isOffline = !this.isOffline;
    this.notify();
    return this.isOffline;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.isOffline));
  }
}

export const chaosEngine = new ChaosMonkey();