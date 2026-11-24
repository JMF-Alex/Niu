# Niu · Project document

> **Niu** is a managed hosting service for Node.js apps with a MongoDB database

## 1. Access to everything

| What | Where |
|---|---|
| GitHub repository | `{{repository URL}}` |
| Running site (Docker) | http://localhost:8080 after `docker compose up -d --build` |
| Style guide | `/styleguide.html` (code in `apps/web/styleguide.html` and `apps/web/src/styles.css`) |
| Prototype | The site in `apps/web` is the working, high fidelity prototype. Low fidelity prototype: `{{Figma or Penpot link}}` |
| Technical setup | [README.md](../README.md) |

## 2. The idea

### Problem
Students, freelancers and small teams who build JavaScript apps have to choose between:
- **A VPS**, which is cheap but means setting up Nginx, certificates, firewalls, backups and updates by hand.
- **Large foreign platforms**, which are complex, often bill in dollars and keep data outside the EU.

### Solution
Niu connects a GitHub repository and publishes the app with HTTPS in about 90 seconds. Every project includes a managed MongoDB database with nightly backups. The servers are in Madrid and support is offered in Spanish and English.

### Target audience
1. Web and app development students (DAW/DAM) and bootcamp students, who start on the free plan.
2. Freelance developers who host client sites.
3. Small companies and agencies with their own Node apps.

### Business model (freemium)
| Plan | Price | For whom |
|---|---|---|
| Hobby | Free | Personal and course projects. The app sleeps after 30 minutes without traffic. |
| Pro | 7.49 € / month | Sites that must always be online. Custom domains. |
| Team | 23.90 € / month | Agencies and teams, with 5 seats and priority support. |

Every paid plan starts with 30 free days and no card. A student who starts for free becomes a paying customer once they start working.

### Competition and differentiation
Competitors: Render, Railway, Heroku, DigitalOcean App Platform. Niu stands out by keeping data in the EU (Madrid), pricing in euros with VAT included, offering support in Spanish and a free plan designed for schools.

## 3. What was built

### Landing page (goal: one action, reserve the free trial)
Structure (type A, hero plus sections, because the product is explained well by a deploy demo):
1. Hero: headline, subheadline, "Start free for 30 days" button, proof line and a terminal that types out a sample deploy
2. Customer logos
3. Problem to solution (VPS versus Niu)
4. Features (6)
5. Large tagline whose words light up as you scroll
6. How it works: an animated deploy pipeline and 3 steps
7. Testimonials
8. FAQ (6 questions)
9. Final call to action with the signup form (saved to MongoDB)
10. Footer with style guide, privacy and terms links

Other pages: **Features** (feature detail and deploy process), **Pricing** (plans from the API, comparison table and billing FAQ), **About** (story, numbers, values and team), **Contact** (form saved to MongoDB), style guide, legal and a custom 404.

### Visual design
Inspired by the Vercel look, without copying its brand: black background, Geist, 1px lines framing the sections and cell grids. On top of the monochrome base there is a premium accent palette (blue, violet, pink, amber, green, teal) that gives each section, icon and step its own tone.

### Logo
An egg resting in a nest: a bowl, a rim and a dot on a 32px grid. It is a single colour SVG that inherits the text colour, so the same mark works in the nav, the footer, the favicon and on light backgrounds. The large wordmark at the bottom of every page uses the same shapes.

### Animations (GSAP 3 with ScrollTrigger, SplitText, TextPlugin and ScrambleTextPlugin)
- Page transitions: content fades in on load and fades out before following an internal link.
- Scroll progress bar at the top of the page.
- Hero headline rises line by line inside a mask; section headings do the same as they scroll into view.
- Section labels decode with a scramble effect.
- The hero terminal types the command, then prints each step; on desktop it tilts in 3D and flattens as you scroll.
- Icons and avatars pop in with a small rotation; groups of cards appear one after another.
- The tagline lights up word by word, with the last words in blue.
- Deploy pipeline: nodes turn on in order, wires fill, and light pulses travel along them in a loop that pauses off screen.
- Counters on the About page, a progress bar and active step on the Features page.
- Magnetic primary buttons and pricing cards that tilt with the pointer (mouse only).
- Large footer wordmark whose letters rise when the footer appears.
- The nav hides when scrolling down and comes back when scrolling up.
- With `prefers-reduced-motion` turned on, nothing moves and all content is shown in its final state.

### Style guide (summary)
- **Type:** Geist (Geist Mono only for code). Weights 400, 500 and 600. Named styles: `heading-1…6`, `title-1…5`, `body-1…6`, `button-*`, `caption-1…5`.
- **Colours:** background `#000000`, surfaces `#181818`/`#1F1F1F`, lines `#272727`/`#313131`, text `#EDEDED`/`#A1A1A1`. Accents: blue `#52A8FF`, violet `#BF7AF0`, pink `#F75F8F`, amber `#FFB224`, green `#4CC38A`, teal `#0AC7B4`. Red `#FF6166` only for errors.
- **Spacing:** fixed scale of 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80 and 96 px.
- **Radius:** 6px for buttons, 12px for cards and the nav, fully round for pills.
- **Icons:** Phosphor.
- **Motion:** curve `cubic-bezier(0.22, 1, 0.36, 1)` (in GSAP, `power4.out`). Only transform and opacity are animated.

### Technical architecture
- Monorepo with **pnpm workspaces** and **Turborepo** (`apps/web`, `apps/api`).
- **Frontend:** plain JavaScript and CSS without a framework, bundled with Vite.
- **Backend:** Node.js with Express and Mongoose. Endpoints `/api/plans`, `/api/signups` and `/api/messages`, with validation in the API and tests (`pnpm test`).
- **Database:** MongoDB, with the collections `plans`, `signups` and `messages`.
- **Deployment:** Docker Compose with three services: `mongo`, `api` and `web` (nginx serves the site and forwards `/api` to the API).

## 4. SEO
The landing page is indexable (permanent offer): it has a `title`, a `meta description` and Open Graph tags, and the FAQ is written as questions and answers. The 404 and the style guide are `noindex`.

## 5. Note
Prices, uptime figures, customers and testimonials are fictional and exist only for the demo.
