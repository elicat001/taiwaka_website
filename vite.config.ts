import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Gzip 压缩
        viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240, // 10KB 以上才压缩
          algorithm: 'gzip',
          ext: '.gz',
        }),
      ],
      // API Key 已移至后端，不再编译到前端代码中
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Rollup 配置
        rollupOptions: {
          output: {
            // 自动代码分割
            manualChunks(id) {
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            },
          },
        },
        // 压缩优化
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // 生产环境移除 console
            drop_debugger: true,
          },
        },
        // 启用 CSS 代码分割
        cssCodeSplit: true,
        // 设置 chunk 大小警告限制
        chunkSizeWarningLimit: 1000,
        // 生成 source map
        sourcemap: mode === 'development',
      },
      // 优化依赖预构建
      optimizeDeps: {
        include: ['react', 'react-dom'],
      },
    };
});
