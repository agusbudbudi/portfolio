import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { preloadHomePage } from './features/home/homePageLoader'

// On "/", wait for the code-split HomePage chunk before the first render so the
// landing page paints without a Suspense fallback (avoids CLS before the LCP).
// A failed preload falls back to the normal lazy path inside App.
const ready = window.location.pathname === '/' ? preloadHomePage().catch(() => undefined) : Promise.resolve()

ready.then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>,
  )
})
