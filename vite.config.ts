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
            'element-plus': ['element-plus', '@element-plus/icons-vue'],
            'highlight.js': [
              'highlight.js',
              'highlight.js/lib/languages/javascript',
              'highlight.js/lib/languages/typescript',
              'highlight.js/lib/languages/python',
              'highlight.js/lib/languages/bash',
              'highlight.js/lib/languages/json',
              'highlight.js/lib/languages/xml',
              'highlight.js/lib/languages/css',
              'highlight.js/lib/languages/markdown',
              'highlight.js/lib/languages/java',
              'highlight.js/lib/languages/php',
              'highlight.js/lib/languages/c',
              'highlight.js/lib/languages/cpp',
              'highlight.js/lib/languages/csharp',
              'highlight.js/lib/languages/go',
              'highlight.js/lib/languages/kotlin',
            ],
            'markdown-it': ['markdown-it'],
            vue: ['vue'],
          },
          chunkFileNames: 'assets/js/[name].[hash].js',
          entryFileNames: 'assets/js/[name].[hash].js',
          assetFileNames: (chunkInfo) => {
            const imgList = ['png', 'jpg', 'jpeg', 'gif', 'svg'];
            if (imgList.some((ext) => chunkInfo.name.endsWith(ext))) {
              return 'assets/images/[name].[hash].[ext]';
            }
            return 'assets/[ext]/[name].[hash].[ext]';
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
