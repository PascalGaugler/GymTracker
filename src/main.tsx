import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@fontsource-variable/space-grotesk"
import "@fontsource-variable/jetbrains-mono"
import "./index.css"
import App from "./app/App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Dev-only demo-data console hooks; the dynamic import keeps them out of production builds.
if (import.meta.env.DEV) {
  void import("./data/demoData").then(({ loadDemoData, clearDemoData }) => {
    Object.assign(window, {
      loadDemoData: () =>
        loadDemoData().then((counts) => {
          console.info("[demo] loaded", counts)
          return counts
        }),
      clearDemoData: () => clearDemoData().then(() => console.info("[demo] cleared")),
    })
    console.info(
      "[demo] call loadDemoData() to seed ~16 weeks of sessions + measurements, clearDemoData() to wipe them",
    )
  })
}
