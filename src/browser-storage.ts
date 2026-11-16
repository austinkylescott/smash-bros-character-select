/** The browser's storage, or undefined where the browser refuses it, as some private windows do. */
export function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
