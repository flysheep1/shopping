import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // 部署路径：默认 /shopping/（gh-pages），可用环境变量 VITE_BASE=/ 覆盖，
  // 或构建时 npx vite build --base=/
  base: process.env.VITE_BASE || '/shopping/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
