import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    headers: (() => {
      // Allow switching headers via env for FHE threads vs wallet SDKs
      const coop = process.env.VITE_COOP_HEADER || 'unsafe-none';
      const coep = process.env.VITE_COEP_HEADER || 'unsafe-none';
      return {
        'Cross-Origin-Opener-Policy': coop,
        'Cross-Origin-Embedder-Policy': coep,
        'Cross-Origin-Resource-Policy': 'cross-origin'
      } as Record<string, string>;
    })()
  },
  plugins: [react()],
  define: { 
    global: 'globalThis',
    'process.env': {}
  },
  optimizeDeps: { 
    include: ['@zama-fhe/relayer-sdk/bundle']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          wagmi: ['wagmi', 'viem']
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false
  }
});
