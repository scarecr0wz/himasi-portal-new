# Nginx — HIMASI Portal

Konfigurasi Nginx untuk **dev** dan **prod**.

## Dev (development)

- **Frontend:** Vite dev server (port 5173) — HMR tetap jalan.
- **Backend:** API (port 3001).
- Nginx hanya sebagai reverse proxy di port 80.

**Aktifkan:**

```bash
sudo ln -sf /apps/himasi-portal/nginx/himasi-portal-dev.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Jalankan app (tanpa nginx, langsung akses dev):

- Frontend: `cd frontend && npm run dev` → http://localhost:5173
- Backend: `cd backend && npm run dev` → http://localhost:3001

Atau akses lewat nginx (setelah di-enable): http://localhost/ atau http://himasi-portal.local/ (jika `himasi-portal.local` di-point ke 127.0.0.1 di `/etc/hosts`).

---

## Prod (production)

- **Frontend:** File static dari `frontend/dist` (hasil `npm run build`).
- **Backend:** Jalan sebagai service di 127.0.0.1:3001 (systemd/PM2).

**1. Build:**

```bash
cd /apps/himasi-portal/frontend && npm run build
cd /apps/himasi-portal/backend && npm run build
```

**2. Set `app_root` di config (kalau path beda):**

Edit `himasi-portal-prod.conf`, ubah:

```nginx
set $app_root /apps/himasi-portal;
```

**3. Domain (opsional):**

Ganti `server_name _;` jadi domain kamu, misalnya:

```nginx
server_name himasi.utb.ac.id;
```

**4. Aktifkan & reload:**

```bash
sudo ln -sf /apps/himasi-portal/nginx/himasi-portal-prod.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**5. HTTPS (disarankan):**

Pakai Certbot:

```bash
sudo certbot --nginx -d himasi.utb.ac.id
```

Certbot akan mengubah config dan menambah `listen 443 ssl`.

---

## Ringkasan

| Environment | Config file              | Frontend              | Backend        |
|-------------|--------------------------|------------------------|----------------|
| Dev         | `himasi-portal-dev.conf` | Proxy → localhost:5173 | Proxy → :3001  |
| Prod        | `himasi-portal-prod.conf`| Serve `frontend/dist`  | Proxy → :3001  |

Backend di prod harus jalan sendiri (mis. PM2 atau systemd), Nginx hanya proxy ke `http://127.0.0.1:3001`.
