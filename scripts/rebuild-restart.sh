#!/usr/bin/env bash
# Rebuild frontend + backend, then restart backend & frontend dev servers (in background).
# Run from repo root: ./scripts/rebuild-restart.sh

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
LOGDIR="${ROOT}/logs"
mkdir -p "$LOGDIR"

echo "==> Rebuilding frontend..."
(cd frontend && npm run build)

echo "==> Rebuilding backend..."
(cd backend && npm run build 2>/dev/null || true)

echo "==> Stopping existing servers (ports 3001, 5173)..."
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
sleep 1

echo "==> Starting backend in background (http://localhost:3001)..."
nohup sh -c "cd '$ROOT/backend' && npm run dev" >> "$LOGDIR/backend.log" 2>&1 &
sleep 2

echo "==> Starting frontend in background (http://localhost:5173)..."
nohup sh -c "cd '$ROOT/frontend' && npm run dev" >> "$LOGDIR/frontend.log" 2>&1 &

echo ""
echo "Done. Services running in background."
echo "  Backend:  http://localhost:3001  (log: logs/backend.log)"
echo "  Frontend: http://localhost:5173   (log: logs/frontend.log)"
echo "  Stop:     fuser -k 3001/tcp 5173/tcp"
