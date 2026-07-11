/** Small, dependency-free validation helpers. */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isNonEmpty(value: string | undefined | null): boolean {
  return !!value && value.trim().length > 0;
}
