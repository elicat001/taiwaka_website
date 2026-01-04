import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
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
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
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
        include: ['react', 'react-dom', '@google/genai'],
      },
    };
});
