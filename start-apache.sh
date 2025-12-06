#!/bin/bash
set -e
# Ajusta Apache a $PORT si Render lo define; si no, usa 80.
PORT_TO_USE=${PORT:-80}
# Solo tocar si es distinto de 80
if [ "$PORT_TO_USE" != "80" ]; then
  sed -ri "s/^Listen 80$/Listen ${PORT_TO_USE}/" /etc/apache2/ports.conf || true
  sed -ri "s#<VirtualHost \*:80>#<VirtualHost *:${PORT_TO_USE}>#g" /etc/apache2/sites-available/000-default.conf || true
fi

# Añadir proxy para /api hacia Node en localhost:3001
if ! grep -q "ProxyPass /api/ http://127.0.0.1:3001/" /etc/apache2/sites-available/000-default.conf; then
  printf '\n# Proxy API to Node server\nProxyPass /api/ http://127.0.0.1:3001/\nProxyPassReverse /api/ http://127.0.0.1:3001/\n' >> /etc/apache2/sites-available/000-default.conf
fi

# Añadir proxy para /health hacia Node en localhost:3001
if ! grep -q "ProxyPass /health http://127.0.0.1:3001/health" /etc/apache2/sites-available/000-default.conf; then
  printf '\n# Proxy Health to Node server\nProxyPass /health http://127.0.0.1:3001/health\nProxyPassReverse /health http://127.0.0.1:3001/health\n' >> /etc/apache2/sites-available/000-default.conf
fi

# Arrancar servidor Node (API)
export SUPABASE_URL=${SUPABASE_URL:-}
export SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY:-$SUPABASE_SERVICE_ROLE_KEY}
export API_PORT=3001
node /var/www/html/server.js &

exec apache2-foreground
