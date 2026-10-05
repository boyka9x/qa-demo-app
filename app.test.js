import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';

async function get(path, fetchImpl) {
  const server = createApp({ apiUrl: 'http://api', apiKey: 'key-1', fetchImpl }).listen(0);
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`);
    return { status: res.status, html: await res.text() };
  } finally {
    server.close();
  }
}

const ok = (products) => async () => ({ ok: true, json: async () => ({ products }) });

test('renders the products from the API', async () => {
  const { status, html } = await get('/?shop=x.myshopify.com', ok([{ id: 1, title: 'Tee <b>', price: 19, stock: 3 }]));
  assert.equal(status, 200);
  assert.match(html, /<meta name="shopify-api-key" content="key-1">/);
  assert.match(html, /<td>Tee &#60;b&#62;<\/td><td>\$19<\/td><td>3<\/td>/);
});

test('shows an empty state without products', async () => {
  const { html } = await get('/', ok([]));
  assert.match(html, /No products yet\./);
});

test('shows an error when the API fails', async () => {
  const { html } = await get('/', async () => ({ ok: false, status: 502 }));
  assert.match(html, /role="alert">Could not load products: API 502/);
});

test('unknown path is 404', async () => {
  const { status } = await get('/nope', ok([]));
  assert.equal(status, 404);
});
