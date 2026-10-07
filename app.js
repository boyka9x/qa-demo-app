import { createServer } from 'node:http';
import { renderPage } from './page.js';

export function createApp({ apiUrl, apiKey, fetchImpl = fetch }) {
  return createServer(async (req, res) => {
    const { pathname, searchParams } = new URL(req.url, 'http://localhost');
    if (req.method !== 'GET' || pathname !== '/') {
      res.writeHead(404, { 'content-type': 'text/plain' });
      return res.end('Not found');
    }
    const q = searchParams.get('q') ?? '';
    let products = [];
    let error;
    try {
      const r = await fetchImpl(q ? `${apiUrl}/api/products?q=${encodeURIComponent(q)}` : `${apiUrl}/api/products`);
      if (!r.ok) throw new Error(`API ${r.status}`);
      ({ products } = await r.json());
    } catch (err) {
      error = err.message;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(renderPage({ apiKey, products, error, q }));
  });
}
