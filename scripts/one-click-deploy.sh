#!/usr/bin/env bash
set -euo pipefail

# =============================
# One-click deploy (test + prod)
# =============================
# Usage: bash scripts/one-click-deploy.sh
# Customize variables below before running on a fresh Ubuntu 22.04 server.

# --- Customize here ---
REPO_URL="<你的Git仓库URL>"
TEST_DOMAIN="testmbti.juejing.cc"
PROD_DOMAIN="mbti.juejing.cc"
ADMIN_EMAIL="admin@example.com"

DB_TEST_NAME="mbti_test"
DB_TEST_USER="mbti_test_u"
DB_TEST_PASS="StrongPass_Test"
DB_PROD_NAME="mbti_prod"
DB_PROD_USER="mbti_prod_u"
DB_PROD_PASS="StrongPass_Prod"

TEST_PORT=3002
PROD_PORT=3003

# --- Paths ---
TEST_DIR="/srv/mbti-test"
PROD_DIR="/srv/mbti-prod"
PAY_TEST_DIR="/etc/mbti/pay/test"
PAY_PROD_DIR="/etc/mbti/pay/prod"

# --- Helpers ---
log() { echo -e "\033[32m[+] $*\033[0m"; }
warn() { echo -e "\033[33m[!] $*\033[0m"; }
err() { echo -e "\033[31m[!] $*\033[0m"; }

require_root() {
  if [ "${EUID:-$(id -u)}" -ne 0 ]; then
    err "Please run as root (sudo)."
    exit 1
  fi
}

pkg_install() {
  apt update
  DEBIAN_FRONTEND=noninteractive apt install -y git nginx mysql-server ufw build-essential curl unzip jq || true
}

install_node() {
  if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
  fi
  npm i -g pm2@latest pnpm@9
}

setup_fw() {
  timedatectl set-timezone Asia/Shanghai || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw --force enable || true
}

create_dirs() {
  mkdir -p "$TEST_DIR" "$PROD_DIR" "$PAY_TEST_DIR" "$PAY_PROD_DIR"
}

clone_repo() {
  if [ ! -d "$TEST_DIR/.git" ]; then
    git clone "$REPO_URL" "$TEST_DIR"
  else
    (cd "$TEST_DIR" && git pull)
  fi
  if [ ! -d "$PROD_DIR/.git" ]; then
    git clone "$REPO_URL" "$PROD_DIR"
  else
    (cd "$PROD_DIR" && git pull)
  fi
}

mysql_exec() {
  mysql -uroot -e "$1"
}

setup_mysql() {
  log "Configuring MySQL users and databases"
  mysql_exec "CREATE DATABASE IF NOT EXISTS \`$DB_TEST_NAME\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql_exec "CREATE USER IF NOT EXISTS '$DB_TEST_USER'@'localhost' IDENTIFIED BY '$DB_TEST_PASS';"
  mysql_exec "GRANT ALL PRIVILEGES ON \`$DB_TEST_NAME\`.* TO '$DB_TEST_USER'@'localhost';"

  mysql_exec "CREATE DATABASE IF NOT EXISTS \`$DB_PROD_NAME\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql_exec "CREATE USER IF NOT EXISTS '$DB_PROD_USER'@'localhost' IDENTIFIED BY '$DB_PROD_PASS';"
  mysql_exec "GRANT ALL PRIVILEGES ON \`$DB_PROD_NAME\`.* TO '$DB_PROD_USER'@'localhost';"

  mysql_exec "FLUSH PRIVILEGES;"
}

write_envs() {
  cat >"$TEST_DIR/.env" <<EOF
NODE_ENV=production
SERVER_PORT=$TEST_PORT
HOST=127.0.0.1
FRONTEND_URL=https://$TEST_DOMAIN
CORS_ORIGIN=https://$TEST_DOMAIN
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=$DB_TEST_USER
DB_PASSWORD=$DB_TEST_PASS
DB_NAME=$DB_TEST_NAME
JWT_SECRET=$(openssl rand -hex 24)
PAYMENT_ENABLED=true
WECHAT_APP_ID=
WECHAT_MCH_ID=
WECHAT_API_V3_KEY=
WECHAT_MCH_PRIVATE_KEY_PATH=$PAY_TEST_DIR/apiclient_key.pem
WECHAT_MCH_CERT_SERIAL=
WECHAT_PLATFORM_CERT_PATH=$PAY_TEST_DIR/wechat_platform_cert.pem
WECHAT_NOTIFY_URL=https://$TEST_DOMAIN/api/wechatpay/notify
VITE_API_BASE_URL=/api
EOF

  cat >"$PROD_DIR/.env" <<EOF
NODE_ENV=production
SERVER_PORT=$PROD_PORT
HOST=127.0.0.1
FRONTEND_URL=https://$PROD_DOMAIN
CORS_ORIGIN=https://$PROD_DOMAIN
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=$DB_PROD_USER
DB_PASSWORD=$DB_PROD_PASS
DB_NAME=$DB_PROD_NAME
JWT_SECRET=$(openssl rand -hex 24)
PAYMENT_ENABLED=true
WECHAT_APP_ID=
WECHAT_MCH_ID=
WECHAT_API_V3_KEY=
WECHAT_MCH_PRIVATE_KEY_PATH=$PAY_PROD_DIR/apiclient_key.pem
WECHAT_MCH_CERT_SERIAL=
WECHAT_PLATFORM_CERT_PATH=$PAY_PROD_DIR/wechat_platform_cert.pem
WECHAT_NOTIFY_URL=https://$PROD_DOMAIN/api/wechatpay/notify
VITE_API_BASE_URL=/api
EOF
}

install_build() {
  (cd "$TEST_DIR" && (pnpm i --frozen-lockfile || npm ci) && npm run init-db && npm run build)
  (cd "$PROD_DIR" && (pnpm i --frozen-lockfile || npm ci) && npm run init-db && npm run build)
}

setup_pm2() {
  cat >/srv/ecosystem.config.js <<EOF
module.exports = { apps: [
  { name: 'mbti-test', cwd: '$TEST_DIR', script: 'server.js', env: { NODE_ENV: 'production' } },
  { name: 'mbti-prod', cwd: '$PROD_DIR', script: 'server.js', env: { NODE_ENV: 'production' } }
]}
EOF
  pm2 start /srv/ecosystem.config.js || pm2 restart all
  pm2 save
  pm2 startup systemd -u $(whoami) --hp $HOME || true
}

setup_nginx() {
  cat >/etc/nginx/sites-available/mbti-test.conf <<EOF
server {
  listen 80;
  server_name $TEST_DOMAIN;
  root $TEST_DIR/dist;
  index index.html;
  location / { try_files \$uri \$uri/ /index.html; }
  location /health { proxy_pass http://127.0.0.1:$TEST_PORT/health; }
  location /api/ {
    proxy_pass http://127.0.0.1:$TEST_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
  location = /api/wechatpay/notify { proxy_pass http://127.0.0.1:$TEST_PORT/api/wechatpay/notify; }
}
EOF

  cat >/etc/nginx/sites-available/mbti-prod.conf <<EOF
server {
  listen 80;
  server_name $PROD_DOMAIN;
  root $PROD_DIR/dist;
  index index.html;
  location / { try_files \$uri \$uri/ /index.html; }
  location /health { proxy_pass http://127.0.0.1:$PROD_PORT/health; }
  location /api/ {
    proxy_pass http://127.0.0.1:$PROD_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
  location = /api/wechatpay/notify { proxy_pass http://127.0.0.1:$PROD_PORT/api/wechatpay/notify; }
}
EOF

  rm -f /etc/nginx/sites-enabled/default
  ln -sf /etc/nginx/sites-available/mbti-test.conf /etc/nginx/sites-enabled/
  ln -sf /etc/nginx/sites-available/mbti-prod.conf /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
}

setup_https() {
  if ! command -v certbot >/dev/null 2>&1; then
    apt install -y certbot python3-certbot-nginx
  fi
  certbot --non-interactive --nginx -d "$TEST_DOMAIN" -d "$PROD_DOMAIN" --redirect --agree-tos -m "$ADMIN_EMAIL" || warn "Certbot failed; check DNS and ports."
}

health_check() {
  log "Health checks"
  sleep 2
  curl -sS "https://$TEST_DOMAIN/health" || true
  echo
  curl -sS "https://$PROD_DOMAIN/health" || true
  echo
}

main() {
  require_root
  log "Installing base packages"
  pkg_install
  log "Installing Node/PM2"
  install_node
  log "Configuring firewall/timezone"
  setup_fw
  log "Creating directories"
  create_dirs
  log "Cloning repository"
  clone_repo
  log "Setting up MySQL"
  setup_mysql
  log "Writing .env files"
  write_envs
  log "Installing and building"
  install_build
  log "Setting up PM2"
  setup_pm2
  log "Configuring Nginx"
  setup_nginx
  log "Setting up HTTPS"
  setup_https
  log "Deployment finished"
  health_check
  log "Done."
}

main "$@"
