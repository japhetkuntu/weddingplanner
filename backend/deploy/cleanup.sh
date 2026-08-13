#!/usr/bin/env bash
# Wipes a previous Ovutor deployment attempt off this droplet so install.sh can start
# clean. Run this once before re-running install.sh if you've deployed before and want
# a genuine fresh start.
#
# This DROPS THE POSTGRES DATABASE AND ROLE and FLUSHES REDIS — only run this if
# there's no real data on the droplet worth keeping.
#
# IMPORTANT: this script deletes /opt/ovutor-src, which is where it lives if you
# cloned the repo — run it from a copy outside that tree instead:
#   curl -o /tmp/cleanup.sh https://raw.githubusercontent.com/<you>/ovutor/main/backend/deploy/cleanup.sh
#   sudo bash /tmp/cleanup.sh
set -euo pipefail

echo "== stopping/disabling services =="
systemctl stop ovutor-client-api ovutor-admin-api 2>/dev/null || true
systemctl disable ovutor-client-api ovutor-admin-api 2>/dev/null || true
rm -f /etc/systemd/system/ovutor-client-api.service /etc/systemd/system/ovutor-admin-api.service
systemctl daemon-reload

echo "== removing Nginx site =="
rm -f /etc/nginx/sites-enabled/ovutor /etc/nginx/sites-available/ovutor
systemctl reload nginx 2>/dev/null || true

echo "== removing published app + logs =="
rm -rf /var/www/ovutor

echo "== removing env files (JWT keys, API tokens, etc — you'll re-fill these) =="
rm -rf /etc/ovutor

echo "== removing source checkout =="
rm -rf /opt/ovutor-src

echo "== dropping the ovutor Postgres role/database =="
sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DROP DATABASE IF EXISTS "Ovutor";
DROP ROLE IF EXISTS ovutor;
SQL

echo "== flushing Redis =="
redis-cli FLUSHALL 2>/dev/null || true

cat <<'EOF'

Cleanup done. The droplet is back to a bare state (dependencies like .NET, Postgres,
Redis, Nginx, and Certbot are still installed — only the Ovutor app/config/data was
removed). Run install.sh next for a fresh setup.
EOF
