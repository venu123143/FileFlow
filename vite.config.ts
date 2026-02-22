import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   host: process.env.IP || "0.0.0.0", // Use IP from env or default to 0.0.0.0 (all interfaces)
  //   port: parseInt(process.env.PORT || "5173", 10), // Use PORT from env or default to 5173
  // },
  // preview: {
  //   host: process.env.IP || "0.0.0.0", // Use IP from env for preview as well
  //   port: parseInt(process.env.PORT || "4173", 10), // Use PORT from env or default to 4173
  // },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate video.js into its own chunk (only loaded when needed)
          'videojs': ['video.js'],
          // React and React DOM
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // React Query
          'react-query': ['@tanstack/react-query'],
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-alert-dialog',
          ],
          // Animation library
          'framer-motion': ['framer-motion'],
          // Utilities
          'utils': ['axios', 'date-fns', 'zod', 'clsx', 'tailwind-merge'],
          // Socket and state management
          'state': ['zustand', 'socket.io-client'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for video.js chunk
  },
})
