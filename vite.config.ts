import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom', // Ensure jsdom is used
    globals: true,        // Make sure global variables like 'window' and 'document' are available
  },
})
