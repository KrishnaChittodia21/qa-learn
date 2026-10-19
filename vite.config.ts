import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // relative asset URLs so the build works from any sub-path, e.g. GitHub Pages' /qa-learn/
  base: './',
  build: {
    // keep font subsets as separate files: browsers fetch only the unicode-range subsets a page uses,
    // so inlining one into the CSS would make every visitor download it
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined),
  },
})
