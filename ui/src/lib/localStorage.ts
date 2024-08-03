export function setLocalStorage(
  key: string,
  value: string,
  skipCurrentFrame = false
) {
  localStorage.setItem(key, value);

  window.dispatchEvent(new Event("local-storage"));
  if (!skipCurrentFrame)
    window.dispatchEvent(
      new CustomEvent("mantine-local-storage", {
        detail: { key, value },
      })
    );
}
