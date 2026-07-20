const MODEL_URL = `${import.meta.env.BASE_URL}models/vosk-model-small-en-us-0.15.tgz`;
const CACHE_NAME = "vosk-model-v1";
const GZIP_MAGIC = [0x1f, 0x8b];

async function isValidGzip(response: Response): Promise<boolean> {
  const bytes = new Uint8Array(await response.clone().arrayBuffer());
  return bytes.length > GZIP_MAGIC.length && bytes[0] === GZIP_MAGIC[0] && bytes[1] === GZIP_MAGIC[1];
}

export async function getModelUrl(onProgress?: (pct: number) => void): Promise<string> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(MODEL_URL);
  if (cached) {
    if (await isValidGzip(cached)) {
      onProgress?.(100);
      return MODEL_URL;
    }
    await cache.delete(MODEL_URL);
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
  if (!(await isValidGzip(cachedResponse))) {
    throw new Error(
      "Downloaded speech model is not a valid archive. The model asset may be missing on the server — run `npm run fetch-model` and rebuild."
    );
  }
  await cache.put(MODEL_URL, cachedResponse);
  onProgress?.(100);
  return MODEL_URL;
}

export async function clearModelCache(): Promise<void> {
  await caches.delete(CACHE_NAME);
}
