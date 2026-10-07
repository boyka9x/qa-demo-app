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

test('renders the search form and forwards q to the API', async () => {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(url);
    return ok([{ id: 1, title: 'Classic Tee', price: 19, stock: 42 }])();
  };
  const { html } = await get('/?q=tee%20%26%20co', fetchImpl);
  assert.deepEqual(urls, ['http://api/api/products?q=tee%20%26%20co']);
  assert.match(html, /<form method="get" action="\/">/);
  assert.match(html, /<label for="q">Search products<\/label>/);
  assert.match(html, /<input id="q" name="q" type="search" value="tee &#38; co">/);
  assert.match(html, /<button type="submit">Search<\/button>/);
  assert.ok(html.indexOf('Search products') < html.indexOf('<table>'));
});

test('does not send q to the API without a search', async () => {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(url);
    return ok([])();
  };
  const { html } = await get('/?q=', fetchImpl);
  assert.deepEqual(urls, ['http://api/api/products']);
  assert.match(html, /<input id="q" name="q" type="search" value="">/);
});

test('lists only the products returned by the API for the search', async () => {
  const { html } = await get('/?q=tee', ok([{ id: 1, title: 'Classic Tee', price: 19, stock: 42 }]));
  assert.match(html, /<td>Classic Tee<\/td>/);
  assert.equal(html.match(/<tr><td>/g).length, 1);
  assert.doesNotMatch(html, /No products match/);
});

test('shows a no-match message with a Clear search link instead of the table', async () => {
  const { html } = await get('/?q=%3Cb%3E', ok([]));
  assert.match(html, /<p>No products match &#60;b&#62;\.<\/p>/);
  assert.match(html, /<a href="\/">Clear search<\/a>/);
  assert.doesNotMatch(html, /<table>/);
  assert.doesNotMatch(html, /No products yet\./);
});

test('unknown path is 404', async () => {
  const { status } = await get('/nope', ok([]));
  assert.equal(status, 404);
});
