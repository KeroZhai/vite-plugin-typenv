import { cwd } from 'node:process'
import vue from '@vitejs/plugin-vue'
import unoCss from 'unocss/vite'
import { defineConfig } from 'vite'
import typenv, { loadEnv } from 'vite-plugin-typenv'

export default defineConfig(async ({ mode }) => {
  const env = await loadEnv(mode, cwd())

  console.log(env)

  return {
    plugins: [
      vue(),
      unoCss(),
      typenv(),
    ],
  }
})
