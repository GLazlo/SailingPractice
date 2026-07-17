const MODEL_URL = "/models/vosk-model-small-en-us-0.15.tar.gz";
const CACHE_NAME = "vosk-model-v1";

export async function getModelUrl(onProgress?: (pct: number) => void): Promise<string> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(MODEL_URL);
  if (cached) {
    onProgress?.(100);
    return MODEL_URL;
  }

  const response = await fetch(MODEL_URL);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
  }

  const total = Number(response.headers.get("Content-Length") ?? 0);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total > 0) onProgress?.(Math.min(100, Math.round((received / total) * 100)));
  }

  const blob = new Blob(chunks as BlobPart[]);
  const cachedResponse = new Response(blob, {
    headers: { "Content-Type": "application/gzip", "Content-Length": String(received) }
  });
  await cache.put(MODEL_URL, cachedResponse);
  onProgress?.(100);
  return MODEL_URL;
}

export async function clearModelCache(): Promise<void> {
  await caches.delete(CACHE_NAME);
}
