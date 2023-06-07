import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess({
        postcss: true,
    }),

    kit: {
        adapter: adapter({
            pages: "../dist/www",
            assets: "../dist/www",
            fallback: 'index.html'
        }),
    },
};

export default config;
