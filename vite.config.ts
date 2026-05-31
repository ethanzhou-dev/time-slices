import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium';
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cesium(),
    {
      name: 'defer-cesium-script',
      enforce: 'post',
      transformIndexHtml(html) {
        return html.replace(
          '<script src="/cesium/Cesium.js"></script>',
          '<script src="/cesium/Cesium.js" defer></script>'
        );
      }
    },
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  esbuild: {
    // @ts-ignore: drop is supported by esbuild but may not be in Vite's type definitions
    drop: ['console', 'debugger'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        // 性能优化：更细粒度的分块策略
        manualChunks(id: string) {
          if (id.includes('node_modules/cesium')) {
            return 'cesium';
          }
          if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')) {
            return 'mui';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules')) {
            return 'vendor-others';
          }
        },
      },
    },
  },
})
