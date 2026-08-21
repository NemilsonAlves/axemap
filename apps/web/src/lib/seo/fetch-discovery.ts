const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function fetchDiscovery<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function postDiscovery<T>(path: string, body: unknown, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate },
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}
