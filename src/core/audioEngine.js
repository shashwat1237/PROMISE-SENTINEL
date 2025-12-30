export class WebAudioEngine {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.initialized = false;
  }

  // [IOS FIX] Must be called from a UI event handler (click/tap)
  async resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn("[SENTINEL] Audio Resume Failed", e);
      }
    }
  }

  async init() {
    if (this.initialized) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      await Promise.all([
        this.loadBuffer('/clunk.mp3', 'clunk'),
        this.loadBuffer('/whoosh.mp3', 'whoosh')
      ]);
      this.initialized = true;
    } catch (e) {
      console.warn("[SENTINEL] Audio Engine: FAILED", e);
    }
  }

  async loadBuffer(url, key) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.buffers[key] = await this.ctx.decodeAudioData(arrayBuffer);
  }

  play(key) {
    if (!this.ctx || !this.buffers[key]) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers[key];
    source.connect(this.ctx.destination);
    source.start(0);
  }
}

export const audioEngine = new WebAudioEngine();