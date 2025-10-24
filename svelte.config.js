import adapter from '@sveltejs/adapter-static';

const dev = process.env.NODE_ENV === 'development';
const basePath = process.env.BASE_PATH || '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: '404.html'
    }),
    paths: {
      base: dev ? '' : basePath
    },
    prerender: {
      entries: ['*']
    }
  }
};

export default config;
