#!/usr/bin/env bash
# One-time droplet provisioning for a bare-metal (no containers) Ovutor deploy — both
# APIs and all three frontends. Read this before running it — it's meant to be run
# section by section on a fresh Ubuntu 22.04/24.04 droplet, as root (or via sudo).
#
# Usage: sudo bash install.sh
# Can be scripted non-interactively by exporting REPO_URL, CLIENT_API_DOMAIN,
# ADMIN_API_DOMAIN, ADMIN_PORTAL_DOMAIN, CLIENT_PORTAL_DOMAIN, WEDDING_WEBSITE_DOMAIN
# and ACME_EMAIL beforehand (and -E to preserve them under sudo).
set -euo pipefail

# ---------------------------------------------------------------------------
# 0. Fill these in before running, or export them beforehand (see note above).
# ---------------------------------------------------------------------------
REPO_URL="${REPO_URL:-<your-git-repo-url>}"
SRC_DIR="/opt/ovutor-src"

if [[ "$REPO_URL" == "<your-git-repo-url>" ]]; then
  echo "Set REPO_URL first: REPO_URL=git@github.com:you/ovutor.git sudo -E bash install.sh"
  exit 1
fi

read -rp "Client API domain (e.g. client-api.yourdomain.com) [${CLIENT_API_DOMAIN:-}]: " input
CLIENT_API_DOMAIN="${input:-${CLIENT_API_DOMAIN:-}}"
read -rp "Admin API domain (e.g. admin-api.yourdomain.com) [${ADMIN_API_DOMAIN:-}]: " input
ADMIN_API_DOMAIN="${input:-${ADMIN_API_DOMAIN:-}}"
read -rp "Admin portal domain (e.g. admin.yourdomain.com) [${ADMIN_PORTAL_DOMAIN:-}]: " input
ADMIN_PORTAL_DOMAIN="${input:-${ADMIN_PORTAL_DOMAIN:-}}"
read -rp "Client (couple) portal domain (e.g. couples.yourdomain.com) [${CLIENT_PORTAL_DOMAIN:-}]: " input
CLIENT_PORTAL_DOMAIN="${input:-${CLIENT_PORTAL_DOMAIN:-}}"
read -rp "Wedding website domain — the bare apex, e.g. yourdomain.com [${WEDDING_WEBSITE_DOMAIN:-}]: " input
WEDDING_WEBSITE_DOMAIN="${input:-${WEDDING_WEBSITE_DOMAIN:-}}"
read -rp "Email for Let's Encrypt renewal notices [${ACME_EMAIL:-}]: " input
ACME_EMAIL="${input:-${ACME_EMAIL:-}}"
unset input

if [[ -z "$CLIENT_API_DOMAIN" || -z "$ADMIN_API_DOMAIN" || -z "$ADMIN_PORTAL_DOMAIN" || -z "$CLIENT_PORTAL_DOMAIN" || -z "$WEDDING_WEBSITE_DOMAIN" || -z "$ACME_EMAIL" ]]; then
  echo "All five domains and ACME_EMAIL are required."
  exit 1
fi

echo "== 1/10: base packages =="
apt-get update
apt-get install -y curl wget gnupg apt-transport-https software-properties-common ca-certificates lsb-release git ufw rsync

echo "== 2/9: swap =="
# The smallest DigitalOcean droplets (512MB-1GB RAM) don't have enough memory for the
# Roslyn C# compiler to build this many projects — without swap, `dotnet publish` gets
# SIGKILLed by the OOM killer partway through (MSB6006, exit code 137). 2G is enough
# headroom regardless of droplet size, and idempotent: skipped if swap already exists.
if [[ "$(swapon --show | wc -l)" -eq 0 && ! -f /swapfile ]]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "== 3/10: .NET 8 SDK (Microsoft package feed) =="
if ! command -v dotnet >/dev/null 2>&1; then
  UBUNTU_VERSION="$(lsb_release -rs)"
  wget "https://packages.microsoft.com/config/ubuntu/${UBUNTU_VERSION}/packages-microsoft-prod.deb" -O /tmp/packages-microsoft-prod.deb
  dpkg -i /tmp/packages-microsoft-prod.deb
  rm /tmp/packages-microsoft-prod.deb
  apt-get update
  apt-get install -y dotnet-sdk-8.0
fi
dotnet --version

echo "== 4/10: Node.js 20 + pnpm (builds the three frontends) =="
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node --version
corepack enable
corepack prepare pnpm@10.17.1 --activate
pnpm --version

echo "== 5/10: PostgreSQL =="
apt-get install -y postgresql postgresql-contrib
systemctl enable --now postgresql

echo "A Postgres role/database for Ovutor will be created now."
read -rsp "Choose a password for the 'ovutor' Postgres role (used in client-api.env / admin-api.env later): " PG_PASSWORD
echo
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ovutor') THEN
    CREATE ROLE ovutor LOGIN PASSWORD '${PG_PASSWORD}';
  ELSE
    ALTER ROLE ovutor WITH PASSWORD '${PG_PASSWORD}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE "Ovutor" OWNER ovutor'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'Ovutor')\gexec
SQL
echo "Remember this password — put it in the ConnectionStrings__Postgres line of both env files."

echo "== 6/10: Redis (localhost only) =="
apt-get install -y redis-server
sed -i 's/^# *bind .*/bind 127.0.0.1 -::1/' /etc/redis/redis.conf
sed -i 's/^bind .*/bind 127.0.0.1 -::1/' /etc/redis/redis.conf
sed -i 's/^protected-mode .*/protected-mode yes/' /etc/redis/redis.conf
systemctl enable --now redis-server
systemctl restart redis-server

echo "== 7/10: Nginx + Certbot =="
apt-get install -y nginx certbot python3-certbot-nginx
rm -f /etc/nginx/sites-enabled/default
systemctl enable --now nginx

echo "== 8/10: app directories =="
# Runs as www-data (the user Nginx already runs as) rather than a dedicated custom
# user — no home directory quirks to work around, and one less account to manage.
# The three frontend dirs hold static Vite builds only — no logs subdir, no systemd
# unit, since Nginx serves the files directly rather than proxying to a process.
mkdir -p /var/www/ovutor/client-api/logs /var/www/ovutor/admin-api/logs
mkdir -p /var/www/ovutor/admin-portal /var/www/ovutor/client-portal /var/www/ovutor/wedding-website
chown -R www-data:www-data /var/www/ovutor
mkdir -p /etc/ovutor
chmod 700 /etc/ovutor

echo "== 9/10: clone source, install service/proxy config =="
if [[ ! -d "$SRC_DIR/.git" ]]; then
  git clone "$REPO_URL" "$SRC_DIR"
fi

install -m 644 "$SRC_DIR/backend/deploy/ovutor-client-api.service" /etc/systemd/system/ovutor-client-api.service
install -m 644 "$SRC_DIR/backend/deploy/ovutor-admin-api.service" /etc/systemd/system/ovutor-admin-api.service

sed \
  -e "s/__CLIENT_API_DOMAIN__/${CLIENT_API_DOMAIN}/g" \
  -e "s/__ADMIN_API_DOMAIN__/${ADMIN_API_DOMAIN}/g" \
  -e "s/__ADMIN_PORTAL_DOMAIN__/${ADMIN_PORTAL_DOMAIN}/g" \
  -e "s/__CLIENT_PORTAL_DOMAIN__/${CLIENT_PORTAL_DOMAIN}/g" \
  -e "s/__WEDDING_WEBSITE_DOMAIN__/${WEDDING_WEBSITE_DOMAIN}/g" \
  "$SRC_DIR/backend/deploy/nginx.conf" > /etc/nginx/sites-available/ovutor
ln -sf /etc/nginx/sites-available/ovutor /etc/nginx/sites-enabled/ovutor
nginx -t

for f in client-api admin-api; do
  target="/etc/ovutor/${f}.env"
  if [[ ! -f "$target" ]]; then
    install -m 600 "$SRC_DIR/backend/deploy/${f}.env.example" "$target"
    echo "Created $target from the example — edit it before starting services."
  fi
done

# Frontend env is baked in at Vite *build* time, not read at runtime like the APIs'
# — so it lives as a gitignored `.env.production.local` file inside the checkout
# itself (picked up automatically by `vite build`), not under /etc/ovutor. Created
# once here from the tracked `.example` template; `git pull` in deploy.sh never
# touches it since it's untracked, so your real values survive every redeploy.
for f in admin-portal client-portal wedding-website; do
  target="$SRC_DIR/apps/${f}/.env.production.local"
  if [[ ! -f "$target" ]]; then
    install -m 644 "$SRC_DIR/apps/${f}/.env.production.local.example" "$target"
    echo "Created $target from the example — edit it before your first frontend deploy."
  fi
done

systemctl daemon-reload
# `WantedBy=multi-user.target` in the unit files only takes effect once explicitly
# enabled — without this, the services would work fine right after deploy.sh but
# silently not come back on a droplet reboot. Not started here (--now) since nothing's
# published to /var/www/ovutor yet; deploy.sh's `systemctl restart` does that part.
systemctl enable ovutor-client-api ovutor-admin-api
systemctl reload nginx

echo "== 10/10: firewall =="
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
echo "Run 'ufw enable' yourself once you've confirmed the SSH rule above is correct."

cat <<EOF

Provisioning done. Remaining manual steps:
  1. Edit /etc/ovutor/client-api.env and /etc/ovutor/admin-api.env (JWT keys,
     the Postgres password you just set, Spaces keys, CORS origins). See
     backend/deploy/*.env.example for what each key means.
  2. Edit apps/{admin-portal,client-portal,wedding-website}/.env.production.local
     under $SRC_DIR (API base URLs — see each app's .env.production.local.example).
  3. Point all five domains' DNS A records at this droplet's IP, then confirm with
     \`dig <domain>\` for each.
  4. Run 'ufw enable' if you haven't already.
  5. Run backend/deploy/deploy.sh to build and start everything.
  6. Once DNS resolves, get certificates (also sets up auto-renewal):
       certbot --nginx -d ${CLIENT_API_DOMAIN} -d ${ADMIN_API_DOMAIN} \\
         -d ${ADMIN_PORTAL_DOMAIN} -d ${CLIENT_PORTAL_DOMAIN} \\
         -d ${WEDDING_WEBSITE_DOMAIN} -d www.${WEDDING_WEBSITE_DOMAIN} \\
         -m ${ACME_EMAIL} --agree-tos -n --redirect
EOF
