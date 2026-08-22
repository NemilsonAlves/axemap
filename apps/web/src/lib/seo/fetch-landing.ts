const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function hasValidApiUrl(): boolean {
  return API_URL.startsWith('http://') || API_URL.startsWith('https://');
}

export async function fetchLanding<T>(path: string, revalidate = 3600): Promise<T | null> {
  if (!hasValidApiUrl()) return null;
  try {
    const res = await fetch(`${API_URL}/api/v1/landing${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
