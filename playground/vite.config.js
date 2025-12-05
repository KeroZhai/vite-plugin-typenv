import Vue from '@vitejs/plugin-vue'
import UnoCss from 'unocss/vite'
import { defineConfig } from 'vite'
import Typenv from 'vite-plugin-typenv'

export default defineConfig({
  plugins: [
    Vue(),
    UnoCss(),
    Typenv(),
  ],
})
