# Rutabanks Notary & Legal Services Website

Website and appointment-booking system for **Rutabanks Notary and Legal Services Ltd**, a notarial and legal services firm in Kigali, Rwanda.

> “Precision in Law. Trust in Service.”

This guide covers local setup, configuration, functionality, testing, administration, deployment, and launch checks. For operational procedures, see the [Admin Guide](docs/ADMIN-GUIDE.md) and [Deployment Guide](docs/DEPLOYMENT.md).

## Contents

- [Project overview](#project-overview)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Configuration](#configuration)
- [Create an admin account](#create-an-admin-account)
- [Features and routes](#features-and-routes)
- [Booking rules](#booking-rules)
- [API](#api)
- [Database and stored data](#database-and-stored-data)
- [Commands and checks](#commands-and-checks)
- [Project layout](#project-layout)
- [Production deployment](#production-deployment)
- [Pre-launch checklist](#pre-launch-checklist)
- [Troubleshooting](#troubleshooting)
- [Legal and content review](#legal-and-content-review)
- [License](#license)

## Project overview

The site combines public information pages, contact and appointment forms, an SQLite database, email notifications, and a password-protected staff dashboard.

### Main capabilities

- Public home, about, services, FAQ, contact, disclaimer, privacy, and custom 404 pages.
- Twelve service detail pages, each with a link to book that service.
- Contact enquiries and appointment requests saved in SQLite.
- Kigali-time appointment availability, with protection against double booking.
- Email notifications for new enquiries and appointments, plus appointment confirmation and cancellation emails.
- Admin dashboard to manage appointments and contact messages.
- Input validation, privacy consent, a honeypot field, rate limits, secure sessions, CSRF protection, security headers, and a Content Security Policy.
- Search metadata, structured data, `robots.txt`, and `sitemap.xml`.
- Accessibility support including semantic landmarks, keyboard focus, a skip link, and reduced-motion handling.

## Requirements

- Node.js **20.12 or newer** (the Docker image uses Node.js 22).
- npm, included with Node.js.
- For production: a Node-capable host or Docker, HTTPS, a persistent writable disk for the SQLite database, and SMTP credentials for email delivery.

## Run locally

From the repository root, install the dependencies and make a local environment file:

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` as needed, then start the development server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin sign-in is at [http://localhost:3000/admin](http://localhost:3000/admin).

To run without the file watcher, use `npm start`. The server uses the configured `PORT` (3000 by default). If PowerShell blocks the `npm` script due to its execution policy, invoke `npm.cmd` instead, for example `npm.cmd run dev`.

The SQLite database and migrations are created automatically when the app starts. The default database path is `data/rutabanks.db`.

## Configuration

Copy `.env.example` to `.env`. Never commit `.env` or put secrets in source control. The app loads this file outside test mode; deployment platforms can supply the same values through their environment settings.

| Variable | Default / example | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | Use `production` for a live deployment. |
| `PORT` | `3000` | HTTP port provided by the host; must be an integer from 1 to 65535. |
| `SITE_URL` | `http://localhost:3000` | Public base URL used for canonical links, Open Graph metadata, and the sitemap. Set the production HTTPS URL without a trailing slash. |
| `DATABASE_PATH` | `./data/rutabanks.db` | SQLite database file. In production, point it to persistent storage. |
| `TRUST_PROXY` | `0` | Set to `1` when deployed behind a trusted reverse proxy so client IPs are read correctly for rate limiting. |
| `FORM_RATE_LIMIT` | `10` | Maximum form submissions per visitor in a 15-minute window. |
| `SMTP_HOST` | empty | SMTP server. If empty, messages are not delivered and the mailer logs that SMTP is not configured. |
| `SMTP_PORT` | `587` | SMTP server port. |
| `SMTP_SECURE` | `false` | Set to `true` when the SMTP provider requires implicit TLS. |
| `SMTP_USER` | empty | SMTP authentication username, if required. |
| `SMTP_PASS` | empty | SMTP authentication password, if required. Keep it secret. |
| `MAIL_FROM` | `Rutabanks Website <no-reply@rutabanks.rw>` | Sender shown on website emails. The address should be authorized by the mail provider. |
| `FIRM_EMAIL` | Configured default | Destination for new contact and appointment notifications. Set this to the monitored firm mailbox. |

In production, startup logs warnings when the site URL is invalid or not HTTPS, the firm email is invalid, or SMTP is not configured. These warnings do not prevent the server from starting. The admin session cookie is secure-only in production, so serve the site through HTTPS.

## Create an admin account

Create the initial staff account from the project directory:

```powershell
npm run admin:create -- --email staff@example.com --name "Full Name"
```

The script prompts for a password of at least 10 characters. It stores a password hash, not the original password. Running the command for an existing email updates that account’s name and password and invalidates its active sessions.

The script also accepts `ADMIN_PASSWORD` from the process environment, but an interactive prompt is preferable to avoid exposing a password in shell history or process configuration. Do not share admin credentials. Sign in at `/admin`; sessions last up to 8 hours, and repeated failed sign-ins are rate-limited.

See the [Admin Guide](docs/ADMIN-GUIDE.md) for dashboard workflows, appointment statuses, and message management.

## Features and routes

| Route | Description |
|---|---|
| `/` | Home page and service overview |
| `/about` | Firm background, mission, vision, and values |
| `/services` | Service catalogue |
| `/services/:slug` | Detail page for one service, with a preselected booking link |
| `/faq` | Frequently asked questions |
| `/contact` | Contact details, office hours, contact form, and booking form |
| `/disclaimer` | Legal disclaimer |
| `/privacy` | Privacy policy |
| `/admin` | Staff dashboard; sign-in required |
| `/admin/appointments` | Appointment management |
| `/admin/messages` | Contact message inbox |
| `/sitemap.xml` | Search-engine sitemap |
| `/robots.txt` | Crawler rules and sitemap location |
| `/healthz` | Application/database health check; responds with `{"ok":true}` when healthy |

The service pages cover document certification, signature authentication, notarization of agreements, affidavits, legal consultation, contract drafting, company registration, property transactions, powers of attorney, due diligence, court document preparation, and legal interpretation/documentation support.

## Booking rules

- Dates and displayed times use the **Africa/Kigali** timezone.
- Visitors can request appointments from tomorrow up to 60 days ahead.
- Sundays are closed.
- Weekday slots: 08:00–12:00 and 14:00–17:00 (one-hour appointments; 13:00 is the lunch break).
- Saturday slots: 09:00–13:00.
- Pending and confirmed appointments hold their slot. Cancelled appointments release it.
- The database enforces one active booking per date and time, so simultaneous requests cannot both claim the same slot.
- A new appointment is a request, not a confirmation. Staff should contact the visitor and confirm it from the admin dashboard.

## API

All endpoints are same-origin JSON endpoints. Form submissions require privacy consent (`consent: "yes"`); the hidden `website` honeypot is reserved for spam detection.

### `POST /api/contact`

Required fields: `first_name`, `last_name`, `email`, and `message` (at least 10 characters). Optional fields: `phone` and `service_inquiry`.

```json
{
  "first_name": "Aline",
  "last_name": "Example",
  "email": "aline@example.com",
  "phone": "+250 788 000 000",
  "service_inquiry": "contract",
  "message": "I would like to ask about reviewing a contract.",
  "consent": "yes"
}
```

### `GET /api/slots?date=YYYY-MM-DD`

Returns the selected date, whether it is open for booking, and each appointment time’s availability. Invalid, past, Sunday, or out-of-window dates return no available slots and an explanatory reason.

### `POST /api/appointments`

Required fields: `full_name`, `phone`, `service`, `date`, `time`, and privacy consent. `email` and `notes` are optional.

```json
{
  "full_name": "Aline Example",
  "phone": "+250 788 000 000",
  "email": "aline@example.com",
  "service": "contract",
  "date": "2026-12-01",
  "time": "10:00",
  "notes": "Please advise which documents to bring.",
  "consent": "yes"
}
```

The date in this example is illustrative; it must fall in the current booking window and not be a Sunday.

### Form service values

| Value | Service |
|---|---|
| `notarial` | Notarial services |
| `legal-advisory` | Legal consultation and advisory |
| `contract` | Contract drafting and review |
| `company-reg` | Company registration |
| `property` | Property and land transactions |
| `power-of-attorney` | Power of attorney |
| `due-diligence` | Legal due diligence |
| `court-docs` | Court document preparation |
| `other` | Other / specialized services |

Successful submissions return HTTP `201` with `{ "ok": true }` and a record ID. Invalid submissions return `422` with field errors. A slot taken between availability lookup and submission returns `409`. Rate-limited submissions return `429`; unknown API routes return JSON `404`.

## Database and stored data

The SQLite database stores contact messages, appointment requests, staff accounts, and admin sessions. Schema migrations are in `src/db/migrations` and are applied automatically on startup. SQLite uses write-ahead logging; keep the database, its WAL files, and shared-memory files together while the app is running.

The database contains personal information. Restrict access to the host and backups, use persistent storage, back it up regularly, and periodically test restoration. Do not manually delete database files while the server is running. The privacy policy states an enquiry retention period; have the firm review and follow its retention and deletion procedures.

## Commands and checks

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server with Node’s file watcher |
| `npm start` | Start the server |
| `npm test` | Run the automated tests with Node’s built-in test runner |
| `npm run lint` | Check JavaScript with ESLint |
| `npm run format:check` | Check formatting without modifying files |
| `npm run format` | Format project files with Prettier |
| `npm run admin:create -- --email ... --name ...` | Create or reset an admin account |

Before sharing changes or deploying:

```powershell
npm test
npm run lint
npm run format:check
```

## Project layout

```text
server.js                 HTTP server, configured port, graceful shutdown
src/
  app.js                  Express middleware, security headers, and route setup
  config.js               Environment loading and runtime settings
  auth.js                 Admin sessions, cookies, and CSRF validation
  passwords.js            Password hashing and verification
  booking.js              Kigali office hours, booking window, and slot availability
  validation.js           Contact and appointment form validation
  mailer.js               Email transport and notification content
  format.js               Date and time formatting
  data/                   Service catalogue and FAQ content
  db/                     SQLite connection and SQL migrations
  routes/                 Public pages, API, admin, and SEO routes
views/
  pages/                  Public page templates
  admin/                  Staff dashboard templates
  partials/               Shared page components
public/
  css/                    Site and admin styles
  js/                     Browser-side form and admin behavior
scripts/
  create-admin.js         Admin account setup/reset utility
tests/                    Automated test suite
docs/
  ADMIN-GUIDE.md          Staff and account-management guide
  DEPLOYMENT.md           Hosting, Docker, backup, and update guide
Dockerfile                Production container definition
```

## Production deployment

The application can run in Docker or directly on a Node.js host. A production deployment needs HTTPS and durable storage for `DATABASE_PATH`; ephemeral storage can permanently lose appointments and messages during redeployment. Configure SMTP to deliver email notifications and use the correct public `SITE_URL`.

The Docker image listens on port 3000 by default and stores SQLite data under `/app/data`. Mount a persistent volume at that path. The image includes a `/healthz` health check.

For complete Docker/VPS instructions, SMTP setup, reverse proxy guidance, database backup examples, and post-deployment checks, follow the [Deployment Guide](docs/DEPLOYMENT.md).

## Pre-launch checklist

- [ ] Confirm the firm’s legal name, registration details, phone number, address, office hours, and service descriptions.
- [ ] Have the firm review the privacy policy, disclaimer, FAQ, and all statements about legal services and expected response times.
- [ ] Set `NODE_ENV=production`, the real HTTPS `SITE_URL`, a valid `FIRM_EMAIL`, SMTP settings, and the host-provided `PORT`.
- [ ] Set `DATABASE_PATH` to a persistent, writable disk and configure backups with a tested restore procedure.
- [ ] Set `TRUST_PROXY=1` only when the app is behind the correctly configured trusted proxy.
- [ ] Create named admin accounts with strong unique passwords; do not use shared accounts.
- [ ] Verify `/healthz`, `/robots.txt`, and `/sitemap.xml` after deployment.
- [ ] Submit a contact enquiry and appointment request; verify database persistence and delivery of notification/confirmation emails.
- [ ] Verify admin sign-in, appointment confirmation/cancellation, message handling, and sign-out.
- [ ] Remove test enquiries/appointments and confirm privacy, retention, and access procedures with the firm.
- [ ] Run `npm test`, `npm run lint`, and `npm run format:check` before release.

## Troubleshooting

| Symptom | Check |
|---|---|
| The site opens on a different port than expected | Check `PORT` in `.env` or the hosting environment. The default is 3000. |
| Emails do not arrive | Configure `SMTP_HOST`, port, TLS, credentials, and sender; confirm `FIRM_EMAIL` and check server logs and provider delivery logs. |
| Appointments/messages disappear after deployment | Move `DATABASE_PATH` to persistent storage and mount/preserve that storage between deployments. |
| Admin session does not persist in production | Serve through HTTPS and ensure the reverse proxy forwards HTTPS information correctly. |
| Rate limiting treats visitors as one IP | If behind a trusted reverse proxy, configure `TRUST_PROXY` appropriately and verify forwarded IP handling. |
| A slot is no longer available | Another visitor may have booked it after the availability lookup; select another time. |
| `npm` is blocked in Windows PowerShell | Use `npm.cmd` or adjust the local PowerShell execution policy according to your organization’s policy. |

## Legal and content review

The privacy policy, disclaimer, service descriptions, and FAQ are site copy—not a substitute for review by the firm. In particular, verify the privacy and data-retention claims, local legal requirements, and any promises about response times or documents clients should bring before launch.

## License

© Rutabanks Notary and Legal Services Ltd. All rights reserved. This project is private and is not licensed for redistribution.
