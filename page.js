const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function renderPage({ apiKey, products, error }) {
  const body = error
    ? `<p role="alert">Could not load products: ${escape(error)}</p>`
    : products.length === 0
      ? '<p>No products yet.</p>'
      : `<p>${products.length} ${products.length === 1 ? 'product' : 'products'}</p>
<table>
  <thead><tr><th>Product</th><th>Price</th><th>Stock</th></tr></thead>
  <tbody>${products.map((p) => `<tr><td>${escape(p.title)}</td><td>$${escape(p.price)}</td><td>${escape(p.stock)}</td></tr>`).join('')}</tbody>
</table>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="shopify-api-key" content="${escape(apiKey)}">
<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
<title>QA Demo</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; color: #303030; background: #f1f1f1; }
  main { background: #fff; border-radius: 12px; padding: 16px; max-width: 720px; }
  h1 { font-size: 20px; margin: 0 0 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e3e3e3; }
</style>
</head>
<body>
<main>
<h1>Products</h1>
${body}
</main>
</body>
</html>`;
}
