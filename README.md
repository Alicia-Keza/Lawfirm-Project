# Rutabanks Notary & Legal Services – Website

Website for **Rutabanks Notary and Legal Services Ltd**, a registered notarial and legal services firm in Kigali, Rwanda.

> *"Precision in Law. Trust in Service."*

## Pages

| URL | Description |
|---|---|
| `/` | Home: hero, key stats, services preview, why choose us |
| `/about` | Firm background, credentials, mission, vision and core values |
| `/services` | Notarial, legal and specialized services |
| `/contact` | Contact details, office hours, contact form and appointment booking |
| `/disclaimer` | Legal disclaimer |

## Tech stack

- **Node.js** + **Express** server
- **EJS** templates with shared partials (head, navbar, footer)
- CSS3 and vanilla JavaScript on the front end
- Google Fonts: Playfair Display and Open Sans

## Project structure

```
├── server.js              # Express app and routes
├── views/
│   ├── pages/             # one template per page
│   └── partials/          # head, navbar, footer (shared by all pages)
└── public/
    ├── css/styles.css     # design system and all page styles
    └── js/main.js         # navigation, animations and form handling
```

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev     # http://localhost:3000, restarts on file changes
```

Use `npm start` to run without file watching.

## Roadmap

- Save and deliver contact and appointment requests
- Admin dashboard for managing messages and appointments
- Accessibility, SEO and performance improvements
- Privacy policy page

## License

© Rutabanks Notary and Legal Services Ltd. All rights reserved.
