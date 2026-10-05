# qa-demo-app

Minimal embedded Shopify admin app (demo project for the AI Dev Platform QA gate).
It shows the products served by `qa-demo-api`.

- `sh scripts/qa-preview.sh` — QA preview: server + quick tunnel + `shopify app deploy` (needs `SHOPIFY_APP_AUTOMATION_TOKEN` or `SHOPIFY_CLI_PARTNERS_TOKEN`), then prints `Preview URL`
- `npm test` — `node --test`
- `API_URL` — the API base URL (default `http://qa-demo-api:3001`, the API's container in a QA preview)

No dependencies: Node's `http`, App Bridge from Shopify's CDN.
