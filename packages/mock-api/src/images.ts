/**
 * Product and category imagery bundled with the mock backend.
 * Vite resolves these to hashed asset URLs; Vitest resolves them to file paths.
 * Missing files resolve to an empty string so the UI's image fallback kicks in.
 */
const files = import.meta.glob<string>('./assets/images/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})

export function imageUrl(key: string): string {
  return files[`./assets/images/${key}.jpg`] ?? ''
}
