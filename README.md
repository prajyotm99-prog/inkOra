🎨 InkOra — Smart Invitation Personalization Platform

InkOra is a modern, web-based invitation customization platform that lets users design once and generate hundreds of personalized invitations effortlessly — directly in the browser.

🔗 Live App: https://ink-ora.vercel.app/

✨ What is InkOra?

InkOra allows users to:

Upload an invitation image

Mark editable text areas and cover old text using color boxes

Customize fonts, colors, alignment, opacity

Generate single or bulk invitations (CSV-based)

Download or share the final images

Do everything offline-first, with no backend required

Designed for:

Weddings 💍

Events 🎉

Corporate invites 🏢

Bulk WhatsApp sharing 📲

🚀 Core Features
🖼 Template Creation

Upload JPG / PNG images

Automatic compression for share-friendly size

Thumbnail generation

Local storage using IndexedDB

✏️ Text Boxes

Draw text boxes on the image canvas

Font family, size, weight, alignment

Text color + background color + opacity

Instant live preview

🎨 Color Boxes (Cover Old Text)

Draw filled boxes to hide existing text

Solid & gradient fills

Color picker with eyedropper

Seamless blending with original design

🧠 Smart Editor UX

Click to select & edit instantly

Properties panel auto-opens on selection

Undo-friendly interactions

Minimal, premium dark/light UI

📄 Single Generation

Fill values manually

Live preview

Download image

Share via device share sheet

📊 Bulk Generation (CSV)

Upload CSV (up to 1000 rows)

Preview headers & rows

Map CSV columns to template fields

Progress tracking

ZIP download of all generated invitations

📦 Download & Share

Download individual images

Download ZIP for bulk generation

Share generated images or ZIP

Share the InkOra app link directly

🌗 Theme Support

Dark / Light mode toggle

System theme detection

Minimalist, premium UI styling

🧩 Tech Stack

Framework: Next.js (App Router)

Language: TypeScript

Styling: Tailwind CSS

State & Storage: IndexedDB (idb)

Image Processing: Canvas API

CSV Parsing: Client-side

Deployment: Vercel

No backend. No database server.
Everything runs securely in the browser.

🖥 Run InkOra Locally
Prerequisites

Node.js 18+

npm / pnpm / yarn

Steps
# Clone the repo
git clone https://github.com/prajyotm99-prog/inkOra.git
cd inkora

# Install dependencies
npm install

# Start development server
npm run dev


Open 👉 http://localhost:3000

🌍 Deployment

InkOra is deployed on Vercel.

Automatic builds from main branch

Optimized for Next.js

Free domain used:
👉 https://ink-ora.vercel.app/

You can deploy your own fork instantly via Vercel.

📱 Mobile Friendly

Works on mobile browsers

Touch-optimized canvas interactions

Progressive Web App ready

Offline-first behavior

🛠 Project Structure (Simplified)
app/
 ├─ page.tsx            → Home
 ├─ editor/[id]         → Template editor
 ├─ generate/[id]       → Single / Bulk generation
 ├─ about               → About page
components/
 ├─ editor              → Canvas & properties
 ├─ generation          → Forms & previews
 ├─ layout              → Header, theme toggle
lib/
 ├─ db.ts               → IndexedDB logic
 ├─ imageProcessor.ts   → Canvas rendering
 ├─ zipGenerator.ts     → ZIP creation

🧠 Product Philosophy

InkOra is built with:

Zero friction

No learning curve

Professional output

Privacy-first (no uploads to servers)

Design once → generate infinitely.

🧑‍💻 Author

Built with ❤️ by Prajyot
(Initials can be branded inside the app before final release)

⭐ Feedback & Contributions

Feature ideas welcome

UX improvements encouraged

Fork & experiment freely

If you like the project, ⭐ the repo and share InkOra 🚀