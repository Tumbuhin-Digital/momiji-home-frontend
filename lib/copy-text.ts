export class CopyFailedError extends Error {
  readonly text: string

  constructor(text: string) {
    super("Could not copy to the clipboard.")
    this.name = "CopyFailedError"
    this.text = text
  }
}

function copyWithExecCommand(text: string): boolean {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.top = "0"
  textarea.style.left = "0"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, text.length)
  let copied = false
  try {
    copied = document.execCommand("copy")
  } catch {
    copied = false
  }
  document.body.removeChild(textarea)
  return copied
}

function canWriteClipboardPromise(): boolean {
  return (
    window.isSecureContext &&
    typeof ClipboardItem !== "undefined" &&
    typeof navigator.clipboard?.write === "function"
  )
}

/**
 * Starts a clipboard write in the same turn as the click.
 * writeText fails after an await because the browser drops the user gesture.
 * ClipboardItem accepts a Promise, so the text can arrive after the API call.
 */
function startClipboardWrite(textPromise: Promise<string>): Promise<void> {
  if (!canWriteClipboardPromise()) {
    return Promise.reject(new Error("async clipboard unavailable"))
  }
  try {
    const item = new ClipboardItem({
      "text/plain": textPromise.then(
        (text) => new Blob([text], { type: "text/plain" })
      ),
    })
    return navigator.clipboard.write([item])
  } catch (error) {
    return Promise.reject(error)
  }
}

export function copyTextFromPromise(
  pendingText: Promise<string>
): Promise<string> {
  const textPromise = pendingText.then((text) => {
    const value = text.trim()
    if (!value) {
      throw new Error("Nothing to copy.")
    }
    return value
  })

  return startClipboardWrite(textPromise).then(
    () => textPromise,
    async () => {
      const text = await textPromise
      if (copyWithExecCommand(text)) return text
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text)
          return text
        } catch {
          // The browser blocked every clipboard path.
        }
      }
      throw new CopyFailedError(text)
    }
  )
}

export function copyText(text: string): Promise<string> {
  return copyTextFromPromise(Promise.resolve(text))
}
