# Rutabanks Notary & Legal Services – Website

Website and booking system for **Rutabanks Notary and Legal Services Ltd**, a registered notarial and legal services firm in Kigali, Rwanda.

> *"Precision in Law. Trust in Service."*

## Features

- Public site: home, about, services (with a page for each of the 12 services), FAQ, contact, disclaimer, privacy policy and a custom 404 page
- Contact form that saves messages and emails the firm
- Appointment booking that only offers free slots within office hours (Kigali time)
- Email notifications to the firm, and confirmations to visitors when a booking is received, confirmed or cancelled
- Admin area: secure sign-in, appointments (confirm, cancel, complete) and a messages inbox
- Spam protection (honeypot), rate limiting and privacy consent on all forms
- Accessibility: skip link, landmarks, keyboard focus, reduced-motion support, WCAG AA colour contrast
- SEO: canonical links, Open Graph tags, schema.org structured data, sitemap.xml and robots.txt
- Security headers with a strict Content Security Policy

## Pages

| URL | Description |
|---|---|
| `/` | Home: hero, key stats, services preview, why choose us |
| `/about` | Firm background, credentials, mission, vision and core values |
| `/services` | Notarial, legal and specialized services |
| `/services/:slug` | One page per service, with a booking link that pre-selects the service |
| `/faq` | Frequently asked questions |
| `/contact` | Contact details, office hours, contact form and appointment booking |
| `/disclaimer` | Legal disclaimer |
| `/privacy` | Privacy policy |
| `/admin` | Admin area (sign-in required) |
| `/sitemap.xml`, `/robots.txt` | For search engines |
| `/healthz` | Health check for hosting platforms |

## Tech stack

- **Node.js** + **Express 5**
- **EJS** templates with shared partials
- **SQLite** via better-sqlite3, with SQL migrations
- **Nodemailer** for email
- Vanilla JavaScript and CSS on the front end
- **helmet** security headers
- Tests with Node's built-in test runner, Supertest and html-validate; ESLint and Prettier; GitHub Actions CI
- Docker for deployment

## Project structure

```
├── server.js                 # starts the app
├── src/
│   ├── app.js                # Express app setup
│   ├── config.js             # settings from environment variables
│   ├── booking.js            # office hours and slot availability
│   ├── validation.js         # form validation
│   ├── mailer.js             # email notifications
│   ├── auth.js, passwords.js # admin sessions and password hashing
│   ├── format.js             # Kigali date formatting
│   ├── data/                 # services and FAQ content
│   ├── db/                   # database connection and migrations
│   └── routes/               # pages, SEO, /api and /admin routes
├── views/
│   ├── pages/                # public page templates
│   ├── partials/             # head, navbar, footer
│   └── admin/                # admin templates
├── public/                   # CSS and browser JavaScript
├── scripts/create-admin.js   # create or reset an admin account
├── docs/                     # admin guide and deployment guide
├── tests/
└── Dockerfile
```

## Getting started

Requires Node.js 20.12 or newer.

```bash
npm install
cp .env.example .env          # then edit the values
npm run dev                   # http://localhost:3000
```

The SQLite database is created automatically in `data/` on first start.
Without `SMTP_HOST`, emails are printed to the console instead of being sent.

### Create an admin account

```bash
npm run admin:create -- --email you@example.com --name "Your Name"
```

You will be asked for a password (at least 10 characters). Then sign in at `/admin`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with automatic restart on changes |
| `npm start` | Start the server |
| `npm test` | Run the test suite |
| `npm run lint` | Check code with ESLint |
| `npm run format` | Format code with Prettier |
| `npm run admin:create` | Create or reset an admin account |

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/contact` | Send a contact message |
| `GET` | `/api/slots?date=YYYY-MM-DD` | Appointment times for a day and whether each is free |
| `POST` | `/api/appointments` | Request an appointment |

Validation errors return `422` with an `errors` object keyed by field name. A slot booked in the meantime returns `409`.

## Documentation

- [Admin guide](docs/ADMIN-GUIDE.md): for staff managing appointments and messages
- [Deployment guide](docs/DEPLOYMENT.md): settings, Docker, backups and updates

## Before going live

These texts were written from information already on the site and should be reviewed by the firm:

- Privacy policy (`views/pages/privacy.ejs`)
- FAQ answers (`src/data/faq.js`)
- "How it works" and "what to bring" on the service pages (`views/pages/service.ejs`)

## License

© Rutabanks Notary and Legal Services Ltd. All rights reserved.
