/**
 * Check if a JWT token is valid (properly formatted and not expired).
 * Returns false for expired, malformed, or non-JWT tokens.
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode payload (base64url → base64 → JSON)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    // Check expiration if present
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
