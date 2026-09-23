#!/usr/bin/env bash
# Builds and (re)deploys both APIs and all three frontends from source already on the
# droplet. Run this for the first deploy (after install.sh) and for every subsequent
# update.
#
# Usage: sudo bash /opt/ovutor-src/backend/deploy/deploy.sh
set -euo pipefail

SRC_DIR="/opt/ovutor-src"
CLIENT_OUT="/var/www/ovutor/client-api"
ADMIN_OUT="/var/www/ovutor/admin-api"

wait_healthy() {
  local url="$1" name="$2" tries=30
  echo "Waiting for $name to report healthy at $url ..."
  for ((i = 1; i <= tries; i++)); do
    if curl -fs "$url" >/dev/null 2>&1; then
      echo "$name is healthy."
      return 0
    fi
    sleep 2
  done
  echo "$name did not become healthy after $((tries * 2))s — check: journalctl -u $name -n 100 --no-pager"
  return 1
}

echo "== pulling latest source =="
cd "$SRC_DIR"
git pull

# install.sh only renders nginx.conf once, at first provisioning — a later change to
# the template (e.g. raising client_max_body_size) never reached already-provisioned
# droplets, because deploy.sh never re-applied it and re-rendering the whole file here
# would destroy the HTTPS blocks certbot edits directly into it (see the warning at the
# top of nginx.conf). Instead, just keep this one directive in sync in place: patch the
# live file's client_max_body_size to match the repo's template, leaving every other
# certbot-managed line untouched.
NGINX_SITE=/etc/nginx/sites-available/ovutor
if [[ -f "$NGINX_SITE" ]]; then
  DESIRED_LIMIT=$(grep -o 'client_max_body_size [^;]*;' "$SRC_DIR/backend/deploy/nginx.conf" | head -1)
  if [[ -n "$DESIRED_LIMIT" ]] && ! grep -qF "$DESIRED_LIMIT" "$NGINX_SITE"; then
    echo "== syncing nginx client_max_body_size =="
    sed -i.bak -E "s/client_max_body_size [^;]*;/${DESIRED_LIMIT}/" "$NGINX_SITE"
    nginx -t && systemctl reload nginx
  fi
  # The client API's server block (proxying :5000) originally shipped with no
  # client_max_body_size at all, so the sed above has nothing to patch there and nginx's
  # 1MB default silently rejects couples' photo uploads. Add the directive to any
  # :5000 server block that lacks it.
  if [[ -n "${DESIRED_LIMIT:-}" ]]; then
    awk -v limit="$DESIRED_LIMIT" '
      function flush() { if (inblk) { if (blk ~ /127\.0\.0\.1:5000/ && blk !~ /client_max_body_size/) sub(/server_name[^\n]*\n/, "&\t" limit "\n", blk); printf "%s", blk; inblk=0; blk="" } }
      /^server[ \t]*\{/ { flush(); inblk=1 }
      { if (inblk) blk = blk $0 "\n"; else print }
      END { flush() }
    ' "$NGINX_SITE" > "$NGINX_SITE.new" && cp "$NGINX_SITE" "$NGINX_SITE.bak2" && mv "$NGINX_SITE.new" "$NGINX_SITE"
    nginx -t && systemctl reload nginx
  fi
fi

# Publishing into a directory the running app is still serving from can fail outright
# (dotnet publish tries to overwrite the live .dll/.pdb, which the running process has
# open — "The process cannot access the file ... because it is being used by another
# process") rather than just risking a half-updated app. Stop both services first;
# `systemctl restart` below brings them back up on the freshly published build. Safe
# to run even before either service has ever started (stopping an inactive/nonexistent
# unit is a no-op, not an error).
echo "== stopping services before publish =="
systemctl stop ovutor-client-api ovutor-admin-api 2>/dev/null || true

echo "== publishing client-api =="
dotnet publish "$SRC_DIR/backend/src/APIs/Ovutor.Client.Api/Ovutor.Client.Api.csproj" \
  -c Release -o "$CLIENT_OUT"

echo "== publishing admin-api =="
dotnet publish "$SRC_DIR/backend/src/APIs/Ovutor.Admin.Api/Ovutor.Admin.Api.csproj" \
  -c Release -o "$ADMIN_OUT"

chown -R www-data:www-data "$CLIENT_OUT" "$ADMIN_OUT"

echo "== starting client-api (applies any new EF migrations on boot) =="
systemctl restart ovutor-client-api
wait_healthy "http://127.0.0.1:5000/health" ovutor-client-api

echo "== starting admin-api =="
systemctl restart ovutor-admin-api
wait_healthy "http://127.0.0.1:5001/health" ovutor-admin-api

echo "== installing frontend dependencies =="
cd "$SRC_DIR"
pnpm install --frozen-lockfile

publish_frontend() {
  local app="$1" out="/var/www/ovutor/$1"
  echo "== building $app =="
  # Each app reads its own gitignored .env.production.local (created once by
  # install.sh from the tracked .example) automatically — Vite loads it for any
  # `vite build` run without NODE_ENV=development, no flag needed.
  pnpm --filter "@ovutor/${app}" build
  # --delete matters here, not just for tidiness: Vite content-hashes every filename
  # under dist/assets/, so a stale file from a previous build left behind wouldn't
  # just be dead weight, it would sit there forever since nothing ever names it again.
  rsync -a --delete "$SRC_DIR/apps/${app}/dist/" "$out/"
  chown -R www-data:www-data "$out"
}

publish_frontend admin-portal
publish_frontend client-portal
publish_frontend wedding-website

echo "Deploy complete."
