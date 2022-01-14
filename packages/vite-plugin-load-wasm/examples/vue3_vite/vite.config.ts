import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pluginWasm from '../../src/index'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    pluginWasm({
      include: [resolve(__dirname, './src/wasm/*.js')]
    })
  ]
})
