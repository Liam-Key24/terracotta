export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function escapeHtmlWithBreaks(value: string): string {
  // Escape first, then allow newlines to render as <br>
  return escapeHtml(value).replace(/\r?\n/g, '<br>')
}

export function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export function isValidEmail(value: string): boolean {
  // Intentionally simple: prevents obvious garbage and header injection.
  if (value.length > 254) return false
  if (/[^\S\r\n]/.test(value) && /\r|\n/.test(value)) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function clampLength(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value
}


