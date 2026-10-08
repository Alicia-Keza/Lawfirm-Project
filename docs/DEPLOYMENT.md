# Deployment Guide

The site is a single Node.js app with a SQLite database file. Any host that can run Node.js 20.12+ (or a Docker container) **and keep a persistent disk** will work.

> **Important:** the database is a file in `data/`. Hosts whose disk is wiped on every deploy (for example the free tiers of some platforms) will lose all messages and appointments. Always attach a persistent disk or volume.

## 1. Settings

Copy `.env.example` to `.env` (or set the same variables in your host's dashboard):

| Variable | Production value |
|---|---|
| `NODE_ENV` | `production`: turns on secure cookies, HSTS and HTTPS-only requests |
| `PORT` | The port your host expects (often set automatically) |
| `SITE_URL` | The public address, e.g. `https://www.rutabanks.rw` (no trailing slash) |
| `DATABASE_PATH` | A path on the persistent disk, e.g. `/app/data/rutabanks.db` |
| `TRUST_PROXY` | `1` when running behind the host's proxy or load balancer (most platforms) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Your email provider's SMTP details |
| `MAIL_FROM` | Sender shown on emails, e.g. `Rutabanks Website <no-reply@rutabanks.rw>` |
| `FIRM_EMAIL` | Where new messages and appointment requests are sent |

The site must be served over **HTTPS** in production: the admin session cookie is only sent over HTTPS.

## 2a. Deploy with Docker

```bash
docker build -t rutabanks-website .
docker run -d --name rutabanks \
  -p 3000:3000 \
  --env-file .env \
  -v rutabanks-data:/app/data \
  --restart unless-stopped \
  rutabanks-website
```

The `rutabanks-data` volume keeps the database between updates. The container reports its health from `/healthz`.

To create the first admin account inside the container:

```bash
docker exec -it rutabanks npm run admin:create -- --email you@example.com --name "Your Name"
```

## 2b. Deploy without Docker (VPS)

```bash
git clone https://github.com/Alicia-Keza/Lawfirm-Project.git
cd Lawfirm-Project
npm ci --omit=dev
cp .env.example .env    # edit the values
npm run admin:create -- --email you@example.com --name "Your Name"
npm start
```

Keep it running with a process manager (for example `systemd` or `pm2`) and put a reverse proxy such as Nginx or Caddy in front for HTTPS. Set `TRUST_PROXY=1`.

## 3. After deploying

- [ ] Open `/healthz`. It should show `{"ok":true}`.
- [ ] Send a test message and book a test appointment; check both emails arrive.
- [ ] Sign in at `/admin`, confirm then cancel the test appointment, and archive the test message.
- [ ] Open `/robots.txt` and `/sitemap.xml` and check they use the real `SITE_URL`.
- [ ] Submit the sitemap in Google Search Console.

## Backups

Everything the site stores is in the SQLite file at `DATABASE_PATH`. Back it up regularly, for example once a day, with:

```bash
sqlite3 /app/data/rutabanks.db ".backup '/backups/rutabanks-$(date +%F).db'"
```

## Updating

Pull the new version and restart (or rebuild the Docker image). Database migrations in `src/db/migrations` run automatically on start.
