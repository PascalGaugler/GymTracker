import { useEffect, useState } from "react"
import { RouterProvider } from "react-router-dom"

import { Providers } from "./providers"
import { router } from "./router"
import { runStartup } from "./startup"

// Gate the router on the one-time bootstrap so the seed (and durable-storage
// request) completes before any route reads from the database.
export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    void runStartup().finally(() => {
      if (active) setReady(true)
    })
    return () => {
      active = false
    }
  }, [])

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background text-subtle">
        <span className="font-mono text-micro tracking-[0.16em] uppercase">Gym Tracker</span>
      </div>
    )
  }

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
