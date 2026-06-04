import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import App from './app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Dev-only: expose demo-data helpers on the console so the charts can be tried
// against a realistic dataset. Dynamically imported under a DEV guard so it is
// dropped from production builds.
if (import.meta.env.DEV) {
  void import('./data/demoData').then(({ loadDemoData, clearDemoData }) => {
    Object.assign(window, {
      loadDemoData: () =>
        loadDemoData().then((counts) => {
          console.info('[demo] loaded', counts)
          return counts
        }),
      clearDemoData: () => clearDemoData().then(() => console.info('[demo] cleared')),
    })
    console.info('[demo] call loadDemoData() to seed ~16 weeks of sessions + measurements, clearDemoData() to wipe them')
  })
}
