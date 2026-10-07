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

test('renders the search form above the table', async () => {
  const { html } = await get('/', ok([{ id: 1, title: 'Classic Tee', price: 19, stock: 3 }]));
  assert.match(html, /<form method="get" action="\/">/);
  assert.match(html, /<label for="q">Search products<\/label>/);
  assert.match(html, /<input id="q" name="q" type="search" value="">/);
  assert.match(html, /<button type="submit">Search<\/button>/);
  assert.ok(html.indexOf('<form') < html.indexOf('<table>'));
});

test('forwards q to the API and keeps it in the input', async () => {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(url);
    return { ok: true, json: async () => ({ products: [{ id: 2, title: 'Canvas Tote', price: 24, stock: 0 }] }) };
  };
  const { html } = await get('/?q=tote', fetchImpl);
  assert.deepEqual(urls, ['http://api/api/products?q=tote']);
  assert.match(html, /<input id="q" name="q" type="search" value="tote">/);
});

test('without q requests the API without a query string', async () => {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(url);
    return { ok: true, json: async () => ({ products: [] }) };
  };
  await get('/', fetchImpl);
  assert.deepEqual(urls, ['http://api/api/products']);
});

test('URL-encodes q for the API and escapes it in the input', async () => {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(url);
    return { ok: true, json: async () => ({ products: [{ id: 1, title: 'A&B', price: 1, stock: 1 }] }) };
  };
  const { html } = await get(`/?q=${encodeURIComponent('"a&b')}`, fetchImpl);
  assert.deepEqual(urls, [`http://api/api/products?q=${encodeURIComponent('"a&b')}`]);
  assert.match(html, /value="&#34;a&#38;b"/);
});

test('the table lists only the products returned by the API', async () => {
  const { html } = await get('/?q=tee', ok([{ id: 1, title: 'Classic Tee', price: 19, stock: 42 }]));
  const rows = [...html.matchAll(/<tr><td>([^<]*)<\/td>/g)].map((m) => m[1]);
  assert.deepEqual(rows, ['Classic Tee']);
});

test('shows a no-match state with a Clear search link when a search finds nothing', async () => {
  const { html } = await get(`/?q=${encodeURIComponent('<hoodie>')}`, ok([]));
  assert.match(html, /<p>No products match &#60;hoodie&#62;\.<\/p>/);
  assert.match(html, /<a href="\/">Clear search<\/a>/);
  assert.doesNotMatch(html, /<table>/);
  assert.doesNotMatch(html, /No products yet\./);
});

test('unknown path is 404', async () => {
  const { status } = await get('/nope', ok([]));
  assert.equal(status, 404);
});
