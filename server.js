import { createApp } from './app.js';

// In a QA preview the API runs in a sibling container reachable by its repository name.
const apiUrl = process.env.API_URL ?? 'http://qa-demo-api:3001';
const port = Number(process.env.PORT ?? 3000);
createApp({ apiUrl, apiKey: process.env.SHOPIFY_API_KEY ?? '' })
  .listen(port, () => console.log(`App listening on ${port}`));
