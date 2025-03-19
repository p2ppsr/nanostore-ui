import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    assetsInclude: ['**/*.PNG'],
    server: {
        port: 8090,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        outDir: 'build',
        assetsInlineLimit: 0, // Ensure fonts are not inlined
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.')
                    const ext = info[info.length - 1]
                    if (/\.(woff|woff2)$/.test(assetInfo.name)) {
                        return `assets/fonts/[name][extname]`
                    }
                    return `assets/[name]-[hash][extname]`
                }
            }
        }
    }
})