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

**2. Domain (opsional):**

Ganti `server_name _;` jadi domain kamu, misalnya:

```nginx
server_name himasi.utb.ac.id;
```

**3. Aktifkan & reload:**

```bash
sudo ln -sf /apps/himasi-portal/nginx/himasi-portal-prod.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**4. HTTPS (disarankan):**

Pakai Certbot:

```bash
sudo certbot --nginx -d himasi.utb.ac.id
```

Certbot akan mengubah config dan menambah `listen 443 ssl`.

---

## Dev domain (dev.himasi-utbogor.com)

Untuk **dev.himasi-utbogor.com** (deploy build, bukan Vite dev server). Config: `himasi-portal-dev-domain.conf`.

**1. Sesuaikan path (kalau beda):**

Edit baris `set $app_root` di `himasi-portal-dev-domain.conf`:

```nginx
set $app_root /apps/himasi-portal;
```

**2. Build frontend:**

```bash
cd /apps/himasi-portal/frontend && npm run build
```

Cek ada `index.html`:

```bash
ls -la /apps/himasi-portal/frontend/dist/index.html
```

**3. Pastikan backend jalan di 3001** (PM2/systemd).

**4. Pasang config & reload nginx:**

```bash
sudo ln -sf /apps/himasi-portal/nginx/himasi-portal-dev-domain.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**5. Cek response dari server (di server atau dari laptop):**

```bash
curl -I http://dev.himasi-utbogor.com/
# Harus: HTTP/1.1 200 OK (atau 301/302 ke HTTPS)
# Dan isi GET / harus HTML (tag <!DOCTYPE html> atau <html)
curl -s http://dev.himasi-utbogor.com/ | head -5
```

**6. HTTPS (opsional):**

```bash
sudo certbot --nginx -d dev.himasi-utbogor.com
```

**Kalau portal masih blank:**

- Pastikan **tidak** pakai `himasi-portal-dev.conf` untuk domain ini (itu proxy ke port 5173; kalau Vite tidak jalan, halaman kosong).
- Cek log: `sudo tail -50 /var/log/nginx/error.log`
- Cek root path: `ls /apps/himasi-portal/frontend/dist/`

---

## Ringkasan

| Environment | Config file                     | Frontend              | Backend        |
|-------------|----------------------------------|------------------------|----------------|
| Dev (local) | `himasi-portal-dev.conf`         | Proxy → localhost:5173 | Proxy → :3001  |
| Dev domain  | `himasi-portal-dev-domain.conf`  | Serve `frontend/dist`  | Proxy → :3001  |
| Prod        | `himasi-portal-prod.conf`        | Serve `frontend/dist`  | Proxy → :3001  |

Backend di prod/dev-domain harus jalan sendiri (mis. PM2 atau systemd), Nginx hanya proxy ke `http://127.0.0.1:3001`.
