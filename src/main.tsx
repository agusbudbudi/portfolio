import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { preloadHomePage } from './features/home/homePageLoader'
import { preloadProgramsPage } from './features/programs/programsPageLoader'
import { normalizePath } from './lib/pagePreloader'
import { initAnalytics } from './lib/analytics'

// On "/" (and the /programs ad landing), wait for the code-split page chunk
// before the first render so the landing paints without a Suspense fallback
// (avoids CLS before the LCP). A failed preload falls back to the normal lazy
// path inside App.
const PRELOAD: Record<string, () => Promise<unknown>> = {
  '/': preloadHomePage,
  '/programs': preloadProgramsPage,
}
const preload = PRELOAD[normalizePath(window.location.pathname)]
const ready = preload ? preload().catch(() => undefined) : Promise.resolve()

ready.then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>,
  )
  initAnalytics()
})
