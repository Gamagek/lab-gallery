import { optimizePNG, createZIP } from './codecs.mjs';
self.onmessage = ({ data }) => {
  try {
    const bytes = data.kind === 'png' ? optimizePNG(data.bytes, data.maxInflatedBytes) : createZIP(data.files);
    self.postMessage({ ok: true, bytes }, [bytes.buffer]);
  } catch (error) {
    self.postMessage({ ok: false, error: error.message || 'Unable to process this file.' });
  }
};
