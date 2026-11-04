import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// GitHub Pages can't send headers, so the build carries its CSP as a <meta> (security audit L1).
// 'unsafe-eval' and blob: workers: the Playground and coding problems run learner code with `new Function` in a Worker.
const PAGES_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval'",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')
const pagesCsp = (): Plugin => ({
  name: 'qa-pages-csp',
  apply: 'build',
  transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: PAGES_CSP }, injectTo: 'head-prepend' }],
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pagesCsp()],
  // relative asset URLs so the build works from any sub-path, e.g. GitHub Pages' /qa-learn/
  base: './',
  build: {
    sourcemap: false,
    // keep font subsets as separate files: browsers fetch only the unicode-range subsets a page uses,
    // so inlining one into the CSS would make every visitor download it
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined),
  },
})
