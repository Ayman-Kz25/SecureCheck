import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: "/SecureCheck/",
  build: {
    rollupOptions: {
      input: {
        main_home: resolve(__dirname, 'index.html'),
        main_password: resolve(__dirname, 'password.html'),
        main_url: resolve(__dirname, 'url.html'),
      },
    },
  },
})
