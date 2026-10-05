#!/bin/sh
# QA preview without `shopify app dev`: an App Automation Token may only deploy
# (shopify.dev/docs/apps/build/dev-dashboard/app-automation-tokens), so serve the app
# behind a quick tunnel and deploy a config whose URLs point at it.
set -e
# A restarted container keeps /tmp: drop the old tunnel URL first.
: > /tmp/tunnel.log
PORT=3000 node server.js &
npx --yes cloudflared@0.7.3 tunnel --no-autoupdate --url http://localhost:3000 >> /tmp/tunnel.log 2>&1 &
until URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/tunnel.log | head -1) && [ -n "$URL" ]; do sleep 1; done
sed -e "s|https://example.com|$URL|g" shopify.app.toml > shopify.app.qa.toml
CI=1 npx --yes @shopify/cli@4.8.3 app deploy --config qa --allow-updates --message "QA preview"
echo "Preview URL: $URL"
wait
