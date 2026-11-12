/**
 * Copies text to the clipboard and resolves whether it worked. Never rejects: a browser without the Clipboard API, an
 * insecure page or a denied permission resolves false, so callers show their "copied" state only on success.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
