import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

// [AUDIT VERIFIED] Master Configuration for Stability
export default defineConfig({
  plugins: [
    viteCommonjs(), // [CRITICAL] Fixes "require is not defined" in d3/force-graph dependencies
    react()
  ],
  define: {
    // [AUDIT VERIFIED] Polyfill global for legacy libs that assume Node.js environment
    global: 'window',
  },
  optimizeDeps: {
    // [CRITICAL] Force pre-bundling of graph libraries AND scheduler to convert CJS to ESM
    include: ['react-force-graph-2d', 'force-graph', 'scheduler']
  },
  build: {
    commonjsOptions: {
      // [CRITICAL] Transform mixed ES modules to support 'require' in d3/graph packages
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          graph: ['react-force-graph-2d', 'force-graph']
        }
      }
    }
  }
});