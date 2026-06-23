import { useEffect } from "react"

let allowNextNavigation = false

/** Call before programmatic navigation that should not trigger the leave warning. */
export function allowCheckoutNavigation() {
  allowNextNavigation = true
}

export function useBeforeUnload(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const handler = (event: BeforeUnloadEvent) => {
      if (allowNextNavigation) {
        allowNextNavigation = false
        return
      }

      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [enabled])
}
