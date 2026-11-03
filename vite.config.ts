import react from '@vitejs/plugin-react'
import { statSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

// Content modules replaced by their public half, so no answer reaches the bundle (qa-api grades and reveals, M2).
// Dev runs the same way, so a screen that still reads an answer breaks locally, not in production.
function answerSplit(): Plugin {
  // ?v=<mtime>: Node caches imports, so an edited file is re-read
  const importFresh = (file: string) => import(`${pathToFileURL(file).href}?v=${statSync(file).mtimeMs}`)
  const split = import('./scripts/content-split.ts')
  return {
    name: 'qa-answer-split',
    enforce: 'pre',
    async load(id) {
      const file = id.split('?')[0]
      const { splitTopic, splitCoding, splitCompanyQuestions } = await split
      if (/\/src\/content\/topics\/[^/]+\.ts$/.test(file)) {
        return `export default ${JSON.stringify(splitTopic((await importFresh(file)).default).publicTopic)};`
      }
      if (/\/src\/content\/coding\/[^/]+\.ts$/.test(file)) {
        return `export const PROBLEMS = ${JSON.stringify(splitCoding((await importFresh(file)).PROBLEMS).publicProblems)};`
      }
      if (/\/src\/content\/company\/[^/]+\.ts$/.test(file)) {
        return `export const QUESTIONS = ${JSON.stringify(splitCompanyQuestions((await importFresh(file)).QUESTIONS).publicQuestions)};`
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), answerSplit()],
  // relative asset URLs so the build works from any sub-path, e.g. GitHub Pages' /qa-learn/
  base: './',
  build: {
    // source maps would carry the original content (answers included) into the build
    sourcemap: false,
    // keep font subsets as separate files: browsers fetch only the unicode-range subsets a page uses,
    // so inlining one into the CSS would make every visitor download it
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined),
  },
  // same-origin /api in dev, like the production rewrite, so login cookies are first-party; 3001 so SDL's api (3000) can run too
  server: { proxy: { '/api': process.env.API_URL ?? 'http://127.0.0.1:3001' } },
})
