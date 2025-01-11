import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import ElementPlus from 'unplugin-element-plus/vite';
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',
    plugins: [vue(), vueJsx(), vueDevTools(), ElementPlus({})],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    server: {
      port: parseInt(env.VITE_PORT || '5173'),
      host: true,
    },
    define: {
      'process.env': {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // 将 Element Plus 相关代码单独打包
            'element-plus': ['element-plus'],
            'highlight.js': ['highlight.js'],
            'markdown-it': ['markdown-it'],
            vue: ['vue'],
          },
        },
      },
      minify: 'esbuild',
      terserOptions: {
        compress: {
          drop_debugger: true,
        },
      },
    },
  };
});
