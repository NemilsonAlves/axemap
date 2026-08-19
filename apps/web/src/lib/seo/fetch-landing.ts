const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchLanding<T>(path: string, revalidate = 3600): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/landing${path}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
