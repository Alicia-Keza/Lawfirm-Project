# Changelog

## 1.0.0 – 2026-10-08

First complete release of the Rutabanks Notary and Legal Services website.

### Website

- Home, about, services, contact, disclaimer, privacy policy, FAQ and 404 pages
- A page for each of the 12 services, with a booking link that pre-selects the service
- Shared templates (EJS) for the navbar, footer and page head

### Forms and booking

- Contact form saved to the database, with validation in the browser and on the server
- Appointment booking that only offers free one-hour slots within office hours, in Kigali time, from tomorrow up to 60 days ahead
- Privacy consent checkbox, honeypot spam trap and rate limiting on all forms
- Email to the firm for every new message or appointment request, and confirmations to visitors

### Admin area

- Secure sign-in (scrypt password hashing, database sessions, CSRF protection, rate-limited sign-in)
- Appointments list with filters; confirm, cancel, complete and reopen, with emails to the client
- Messages inbox with unread, read and archived views

### Quality

- Accessibility: skip link, landmarks, real lists, visible focus, reduced-motion support, AA colour contrast, correct heading levels
- SEO: canonical links, Open Graph tags, schema.org LegalService and FAQPage data, sitemap.xml, robots.txt
- Security headers and a strict Content Security Policy
- 80+ automated tests, including HTML validation of every page; ESLint, Prettier and GitHub Actions CI

### Deployment

- Dockerfile, `/healthz` health check and graceful shutdown
- Admin guide and deployment guide in `docs/`
