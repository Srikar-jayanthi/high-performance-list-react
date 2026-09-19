/**
 * Utility to allocate a Uint8Array off the main thread via Web Worker.
 * If Workers are unavailable (e.g. during SSR or in test environments),
 * it gracefully falls back to direct synchronous allocation.
 */
export async function createUint8ArrayWithWorker(size: number): Promise<Uint8Array> {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return new Uint8Array(size);
  }

  return new Promise((resolve) => {
    try {
      const worker = new Worker(new URL('../workers/arrayWorker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (event: MessageEvent<{ buffer: ArrayBuffer }>) => {
        const array = new Uint8Array(event.data.buffer);
        worker.terminate();
        resolve(array);
      };

      worker.onerror = () => {
        worker.terminate();
        resolve(new Uint8Array(size));
      };

      worker.postMessage({ size });
    } catch {
      resolve(new Uint8Array(size));
    }
  });
}
