# Digital Wishing Wall

A full-stack, mobile-first web application that lets organizers create unique shareable links for occasions (birthdays, farewells, anniversaries, weddings, etc.). 

The app cleanly separates **two distinct experiences**:
1. **For Friends & Family**: A quick, frictionless upload link (photos + short message, zero signup required).
2. **For the Celebrated Person**: A dedicated **Gift Reveal View** showing only their finished, interactive theme with no upload buttons or clutter!

---

## 🚀 Two Distinct Links for Every Wall

```
1. 👥 The Contributor Link (Send to friends before the party):
   👉 /wall/{slug}/contribute
   • Mobile-friendly form where loved ones upload their photos and memories.
   • Automatic client-side canvas compression for fast mobile uploads.
   • No account creation or login required.

2. 🎁 The Gift Reveal Link (Send to the person on their special day):
   👉 /wall/{slug}/gift
   • Pure, magical celebration presentation.
   • ZERO "Add Wish" or "Contribute" buttons.
   • ZERO admin/theme switcher clutter.
   • NO floating mobile upload pills.
   • Greets them with: "A surprise gift for you, [Recipient]! 💝"
   • Interactive theme experience: unfold the broadsheet, scratch off the metallic foil, flip the magazine pages!
```

---

## 🌟 Interactive Themes Included

1. **Vintage Gazette (`newspaper`)**:
   - Arrives as a folded broadsheet newspaper (*"The Daily Chronicle"*).
   - Recipient's photo and opening wish become the **Front Page Lead Headline Story**.
   - Animated 3D unfolding reveal with celebration confetti!
   - Masthead, archive photographic clippings, dropped initial caps, and print support (`window.print()`).
2. **Scratch & Reveal (`scratch_card`)**:
   - Interactive metallic silver scratch card canvas.
   - Recipient's portrait crowned at the top.
   - Touch & swipe on mobile or click & drag on desktop to scratch off the foil and reveal hidden photos and messages.
   - Live percentage tracker and confetti pop upon unlocking!
3. **Birthday Magazine (`magazine`)**:
   - Glossy commemorative issue cover featuring the recipient as the cover star.
   - Interactive flip spreads and luxury editorial presentation.
4. **Sealed Envelope (`envelope`)**:
   - Vintage parchment envelope with a wax seal.
   - Tap the wax seal to crack open and cascade letters.

---

## 🧭 Live Demo URLs

- **Gift Reveal (Arthur's 80th)**: `http://localhost:3000/wall/arthur-80th-birthday/gift`
- **Gift Reveal (Sarah's Farewell)**: `http://localhost:3000/wall/sarah-farewell-2025/gift`
- **Contributor Form**: `http://localhost:3000/wall/arthur-80th-birthday/contribute`
- **Interactive Wall with Mode Switcher**: `http://localhost:3000/wall/arthur-80th-birthday`

---

## ☁️ Going Live to Production (Supabase + Vercel)

When you're ready to deploy to production:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Go to the **SQL Editor** and run the script in [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Storage**, create a public bucket named `wishing-wall-photos`.

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` or set them in your Vercel deployment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

The app automatically detects these environment variables and seamlessly switches from local disk storage to Supabase PostgreSQL and Supabase Storage!
