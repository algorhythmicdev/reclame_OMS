import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

const basePath = process.env.BASE_PATH || '';
const resolvePath = (relative) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  plugins: [sveltekit()],
  base: basePath,
  resolve: {
    alias: {
      'svelte/src/runtime/index.js': resolvePath('./src/shims/svelte-runtime-index.js'),
      'svelte/src/runtime/ssr.js': resolvePath('./src/shims/svelte-runtime-ssr.js')
    }
  }
});
