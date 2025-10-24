import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

const basePath = process.env.BASE_PATH || ''

export default defineConfig({
  plugins: [sveltekit()],
  base: basePath
})
