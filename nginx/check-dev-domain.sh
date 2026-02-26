#!/bin/bash
# Cek deploy dev domain — jalankan di server (di folder project atau dari mana saja).
# Usage: bash nginx/check-dev-domain.sh

set -e
ROOT="${1:-/apps/himasi-portal}"
echo "=== Cek path: $ROOT"
echo ""

echo "1. Cek dist/index.html..."
if [ -f "$ROOT/frontend/dist/index.html" ]; then
  echo "   OK: $ROOT/frontend/dist/index.html ada"
else
  echo "   GAGAL: $ROOT/frontend/dist/index.html tidak ada. Jalankan: cd $ROOT/frontend && npm run build"
  exit 1
fi

echo ""
echo "2. Cek isi index.html (harus ada <div id=\"root\">)..."
if grep -q 'id="root"' "$ROOT/frontend/dist/index.html"; then
  echo "   OK: root div ada"
else
  echo "   GAGAL: root div tidak ditemukan"
  exit 1
fi

echo ""
echo "3. Cek nginx config..."
if sudo nginx -t 2>/dev/null; then
  echo "   OK: nginx config valid"
else
  echo "   GAGAL: nginx -t error"
  exit 1
fi

echo ""
echo "4. Cek response GET / (localhost)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/ -H "Host: dev.himasi-utbogor.com" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
  echo "   OK: HTTP 200"
else
  echo "   Perhatian: HTTP $STATUS (200 = OK). Pastikan server_name dev.himasi-utbogor.com dipakai untuk request ini."
fi

echo ""
echo "Selesai. Buka https://dev.himasi-utbogor.com/ di browser."
