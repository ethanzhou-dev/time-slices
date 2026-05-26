import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import cesium from 'vite-plugin-cesium';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    cesium(),
  ],
  build: {
    rollupOptions: {
      output: {
        // 性能优化：将 Cesium 分离为独立 chunk，支持并行下载和长期浏览器缓存
        manualChunks(id: string) {
          if (id.includes('node_modules/cesium')) {
            return 'cesium';
          }
        },
      },
    },
  },
})
