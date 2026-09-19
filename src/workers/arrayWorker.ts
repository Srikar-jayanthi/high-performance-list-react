// Web Worker for offloading Uint8Array allocation to background thread
self.onmessage = (event: MessageEvent<{ size: number }>) => {
  const size = event.data.size;
  // Allocate buffer in worker thread
  const buffer = new ArrayBuffer(size);
  const array = new Uint8Array(buffer);
  
  // Transfer ArrayBuffer ownership back to main thread (zero-copy)
  // @ts-ignore
  self.postMessage({ buffer: array.buffer }, [array.buffer]);
};
