/**
 * @file vite.config.ts
 * @description
 * Vite构建配置文件。
 *
 * 主要配置包括：
 * - 插件(plugins): 引入`@vitejs/plugin-react`以支持React。
 * - 路径别名(resolve.alias): 设置`@`、`@components`等别名，简化模块导入路径。
 * - 开发服务器(server): 配置端口、主机、自动打开浏览器及API代理。
 *   - 代理(proxy): 将开发环境中的`/api`请求转发到`https://wxcrawl.touchturing.com`，解决跨域问题。
 * - 构建(build): 配置输出目录、SourceMap及手动分块(manualChunks)，将常用库分离打包以优化加载性能。
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url))
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'https://wxcrawl.touchturing.com',
        changeOrigin: true,
        secure: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
})