# qa-demo-app

Minimal embedded Shopify admin app (demo project for the AI Dev Platform QA gate).
It shows the products served by `qa-demo-api`.

- QA preview: the AI Dev Platform's **Shopify app** mode (tunnel + `shopify app deploy`, then the `dev` command of `shopify.web.toml`)
- `npm test` — `node --test`
- `API_URL` — the API base URL (default `http://qa-demo-api:3001`, the API's container in a QA preview)

No dependencies: Node's `http`, App Bridge from Shopify's CDN.
