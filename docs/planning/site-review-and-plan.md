# Savage Adventures - Site Review & Implementation Plan

**Date:** 2026-03-20
**Last updated:** 2026-03-20
**Objective:** Comprehensive site cleanup, optimisation, and BookWild integration for onboarding.

---

## Table of Contents

1. [Current State Summary](#current-state-summary)
2. [Phase 1 - Critical Fixes & Config](#phase-1---critical-fixes--config)
3. [Phase 2 - Content & Copy Fixes](#phase-2---content--copy-fixes)
4. [Phase 3 - SEO & Meta Improvements](#phase-3---seo--meta-improvements)
5. [Phase 4 - Performance Optimisation](#phase-4---performance-optimisation)
6. [Phase 5 - Accessibility & UX Improvements](#phase-5---accessibility--ux-improvements)
7. [Phase 6 - BookWild Integration](#phase-6---bookwild-integration)
8. [Phase 7 - Marketing Improvements](#phase-7---marketing-improvements)
9. [Information Needed](#information-needed)
10. [Out of Scope / Future Work](#out-of-scope--future-work)

---

## Current State Summary

| Aspect | Current State |
|--------|--------------|
| **Framework** | Jekyll 4.4.1 (Ruby 3.4.4) |
| **Styling** | Bootstrap 5.2.3 (CDN) + custom CSS/SCSS |
| **Hosting** | Netlify (moving to Cloudflare) |
| **CMS** | Decap CMS (Netlify CMS) with git-gateway |
| **Forms** | Google Apps Script -> Google Sheets + email |
| **Bot protection** | Cloudflare Turnstile |
| **Domain** | savage-adventures.com |

### Key issues identified

- **100+ issues** across SEO, content, performance, accessibility, and UX
- `_config.yml` is essentially unconfigured (all placeholder values)
- Forms currently go to Google Sheets; need to be rewired to BookWild
- 4 pages showing "Under Development" banners
- **150MB of unoptimised images** (header images 2-5MB each, some content images up to 7MB)
- No sitemap, no robots.txt, no OG tags, no structured data
- No mobile hamburger menu, minimal footer
- Multiple adventure detail pages have copy-paste errors and placeholder content
- Render-blocking scripts, duplicate CSS variables

---

## Phase 1 - Critical Fixes & Config

Priority: **HIGH** | Effort: **Low** | Impact: **High**

These are broken or embarrassing things that should be fixed immediately.

### 1.1 Fix `_config.yml` placeholder values

**File:** `_config.yml`

Replace all placeholder values with real site information:

```yaml
title: Savage Adventures
email: info@savage-adventures.com
phone: "07895 834955"
customer_email: savageadventures@bookwild.app
description: >-
  Discover your primal side. Outdoor adventures including coasteering,
  canyoning, climbing, surfing and more across South Wales.
baseurl: ""
url: "https://savage-adventures.com"
twitter_username: sav_adventures
```

Also remove the boilerplate `github_username: jekyll` placeholder.

**Why:** The current values ("Your awesome title", "your-email@example.com", "jekyll"/"jekyllrb") appear in the HTML `<head>` via the minima theme's defaults and in the RSS feed. Search engines and social platforms may use them.

### 1.2 Fix duplicate form IDs

**Files:** `_includes/contact/page-content.html`, `_includes/contact/book-now-modal.html`

Both the contact page form and book-now modal form use `id="contact-us-form"`. Every page loads both modals in the layout, so there are always duplicate IDs in the DOM. This can break JavaScript targeting and is an HTML spec violation.

**Fix:** Give each form a unique ID:
- Contact page: `id="contact-page-form"`
- Book Now modal: `id="book-now-form"`
- More Info modal: `id="more-info-form"` (already has `id="contact-us-form-2"`)

Update `form-submission-handler.js` to target all forms via the `.gform` class (which it already does).

### 1.3 Fix modal overflow on mobile

**File:** `assets/css/sav-main.css`

Both `.modal .modal-dialog` and `.modal .modal-content` have `min-width: 680px` which forces horizontal scroll on mobile. The existing mobile CSS override (`@media max-width: 576px`) only fixes `.modal-content` but not `.modal-dialog`, so the overflow persists.

**Fix:** Remove the `min-width` from both base styles and use responsive widths:

```css
.modal .modal-dialog {
  height: 450px;
}
.modal .modal-content {
  height: 450px;
}
@media (min-width: 768px) {
  .modal .modal-dialog {
    min-width: 680px;
  }
  .modal .modal-content {
    min-width: 680px;
  }
}
```

### 1.4 Fix Bootstrap 4/5 carousel mismatches

**File:** `_includes/main/slideshow.html`

The carousel has multiple Bootstrap 4 patterns that need updating to Bootstrap 5:

**a) Fix `sr-only` class:** Replace with `visually-hidden`:

```html
<span class="visually-hidden">Previous</span>
...
<span class="visually-hidden">Next</span>
```

**b) Fix `data-interval` attribute (line 3):**

Replace `data-interval="5000"` with `data-bs-interval="5000"`. The BS4 attribute is silently ignored, so the carousel falls back to the Bootstrap default interval.

**c) Fix carousel indicators (lines 4-8):**

Replace `<ol>`/`<li>` (BS4) with `<div>`/`<button>` (BS5):

```html
<!-- BS5 pattern -->
<div class="carousel-indicators">
  <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="0"
          class="active" aria-current="true"></button>
</div>
```

**d) Fix carousel controls (lines 17-24):**

Replace `<a>` controls (BS4) with `<button>` elements (BS5):

```html
<!-- BS5 pattern -->
<button class="carousel-control-prev" type="button"
        data-bs-target="#mainCarousel" data-bs-slide="prev">
  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
  <span class="visually-hidden">Previous</span>
</button>
```

**e) Add `aria-label` to carousel:**

```html
<div id="mainCarousel" class="carousel slide" ... aria-label="Adventure photo slideshow">
```

### 1.5 Remove "Under Development" banners

**Files:** `corporate.html`, `education.html`, `challenges.html`, `john-muir.html`

Remove the line `{% include main/page-under-development.html %}` from all four pages.

### 1.6 Fix `<html>` tag

**File:** `_layouts/default.html`

Add language attribute:

```html
<html lang="en">
```

### 1.7 Fix viewport meta tag

**File:** `_layouts/default.html`

Remove `maximum-scale=1` and `user-scalable=no` - these block pinch-to-zoom, which is an accessibility violation (WCAG 1.4.4) and causes SEO penalties:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### 1.8 Fix Stag & Hen page title

**File:** `stag-hen.html`

Change `title: Outdoor Activities Wales` to `title: Stag & Hen Adventures` (currently identical to the homepage title).

### 1.9 Fix Bootstrap 4/5 modal mismatches

**Files:** `_includes/contact/book-now-modal.html`, `_includes/contact/more-info-modal.html`

**a) Fix close button (BS4 -> BS5):**

The close buttons use `class="close"` with `<span>&times;</span>` (BS4). Replace with the BS5 pattern:

```html
<!-- BS4 (current) -->
<button type="button" class="close" data-bs-dismiss="modal">
  <span aria-hidden="true">&times;</span>
</button>

<!-- BS5 (fix) -->
<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
```

**b) Remove redundant BS4 role attributes:**

Remove `role="dialog"` from `.modal` and `role="document"` from `.modal-dialog` -- these are BS4 patterns that are unnecessary in BS5 (Bootstrap's JS handles ARIA roles).

### 1.10 Fix broken ARIA references on modals

**Files:** `_includes/contact/book-now-modal.html`, `_includes/contact/more-info-modal.html`

Both modals use `aria-labelledby="bookNowModalLabel"` but no element with `id="bookNowModalLabel"` exists anywhere. The more-info modal also incorrectly references the book-now modal's label instead of its own. Screen readers cannot announce a title for either modal.

**Fix:** Add modal title elements and correct the `aria-labelledby` references:

```html
<!-- Book Now modal -->
<div class="modal" id="bookNowModal" aria-labelledby="bookNowModalLabel" ...>
  <h5 class="visually-hidden" id="bookNowModalLabel">Book Now</h5>

<!-- More Info modal -->
<div class="modal" id="moreInfoModal" aria-labelledby="moreInfoModalLabel" ...>
  <h5 class="visually-hidden" id="moreInfoModalLabel">More Information</h5>
```

### 1.11 Fix CSS nesting in plain `.css` file (browser compatibility)

**File:** `assets/css/sav-main.css`

The file uses CSS Nesting syntax (`&.rust-heading`, `&.desktop`, `&.mobile`, nested `@media` inside selectors) throughout. This is loaded directly by the browser **without a preprocessor** and will break on Safari < 17.2, Firefox < 117, and Chrome < 120.

**Fix (choose one):**

1. **Rename to `.scss`** and process through Jekyll's SCSS pipeline (cleanest)
2. **Flatten the nesting** manually into standard CSS selectors
3. **Ensure minimum browser targets are acceptable** and document the requirement

Option 1 is recommended since the project already uses SCSS for `sav-themes.scss`.

### 1.12 Fix relative image paths in adventure summaries

**File:** `_includes/adventures/summary-image.html.liquid`

`src="../assets/images/{{ adventure.image }}"` uses a relative path with `../`. This can break at different URL depths (e.g. pages served from `/adventures/coasteering/`).

**Fix:** Use an absolute path:

```html
<img src="/assets/images/{{ adventure.image }}" ...>
```

### 1.13 Remove `minima` theme from `_config.yml`

**File:** `_config.yml`

`theme: minima` is specified but the site uses fully custom layouts, includes, and CSS. The minima theme is unused but still loaded as a gem dependency, potentially causing conflicts.

**Fix:** Remove `theme: minima` from `_config.yml` and `gem "minima"` from `Gemfile` (if present).

### 1.14 Remove obsolete `X-UA-Compatible` meta tag

**File:** `_layouts/default.html`

`<meta http-equiv="X-UA-Compatible" content="IE=edge">` is only relevant to Internet Explorer, which has been fully discontinued. Remove this dead meta tag.

---

## Phase 2 - Content & Copy Fixes

Priority: **HIGH** | Effort: **Low** | Impact: **Medium**

### 2.1 Fix typos

| File | Line | Current | Fix |
|------|------|---------|-----|
| `_data/team.yml` | 55 | "everythinghe does" | "everything he does" |
| `_data/team.yml` | 8 | "Pete started the company up in 2015, Pete set eyes on" | "Pete started the company in 2015 and set his eyes on" |
| `_data/adventures.yml` | 105 | "best  Mountains in wales" | "best mountains in Wales" |
| `adventures/coasteering.html` | 47 | "scrabling" | "scrambling" |
| `adventures/coasteering.html` | 49 | "not a strong swimming" | "not a strong swimmer" |
| `_includes/main/page-under-development.html` | 5 | "make it a better overall" | "make it better overall" |
| `_data/team.yml` | 22 | "easy to spotted" | "easy to spot" |
| `_includes/about/page-intro.md` | 1 | "With the goal" (capital W mid-sentence) | "with the goal" |
| `_includes/about/page-intro.md` | 2 | "though adventures" | "through adventures" |
| `_includes/about/page-intro.md` | 6 | missing period at end of paragraph | add period |
| `_includes/stag-hen/page-intro.md` | 6 | "local connection in Swansea" | "local connections in Swansea" |
| `_includes/stag-hen/page-intro.md` | 7 | missing period at end of paragraph | add period |
| `_includes/corporate/page-intro.md` | 10 | "Team building event can" | "Team building events can" |
| `_includes/age-info.md` | 2 | "please get touch to confirm" | "please get in touch to confirm" |
| `_includes/age-info.md` | 2 | "children under 17yr old" | "children under 17 years old" |
| `_includes/terms/page-content.html` | 109 | "there activity" | "their activity" |
| `_includes/terms/page-content.html` | 109 | "participant test positive" | "participant tests positive" |
| `_includes/terms/page-content.html` | 160 | stray `>` in heading: `Policy></h3>` | remove stray `>` |
| `adventures/coasteering.html` | 69 | "a good couple of great local pubs" | "a couple of great local pubs" |
| `adventures/canyoning.html` | 69 | "a good couple of great local pubs" | "a couple of great local pubs" |

### 2.2 Set Climbing and Guided Walks to `find-out-more: false`

**File:** `_data/adventures.yml`

Both Climbing and Guided Walks have `find-out-more: true` and are actively linked from the Adventures, Stag & Hen, Corporate, and Education pages. But both have incomplete/placeholder content that users can reach.

**Fix:** Set `find-out-more: false` for both to remove the "Find out more" links until the content is ready.

```yaml
  - name: Climbing
    find-out-more: false    # was true - content incomplete

  - name: Guided Walks
    find-out-more: false    # was true - content placeholder
```

### 2.3 Convert all incomplete adventure detail pages to lightweight placeholders

These pages are either not linked (SUP, Kayaking) or will be unlinked after 2.2 (Climbing, Guided Walks). They should still be cleaned up since they exist in the build and could be found via direct URL or search engines.

**Pages to convert to placeholders (add `noindex` meta tag to all):**

| Page | Current state | Notes |
|------|--------------|-------|
| `adventures/sup.html` | Copy-pasted canyoning content, wrong headings, wrong image | Not linked (`find-out-more: false`) |
| `adventures/sit-on-top-kayaking.html` | "More info coming very soon", detail commented out | Not linked (`find-out-more: false`) |
| `adventures/climbing.html` | Section headings only, "more detail soon" | Will be unlinked after 2.2 |
| `adventures/guided-walks.html` | "More info coming very soon", detail commented out | Will be unlinked after 2.2 |

Note: No `surfing.html` file exists - Surfing has no detail page at all.

**Placeholder template** - each should follow a consistent pattern:

```html
---
layout: default
title: [Activity Name]
tagline: [Activity Name]
noindex: true
---
<section class="container-fluid page-intro text-center">
  <p>[Brief description from adventures.yml]</p>
  <p>Get in touch to find out more about this activity.</p>
  <button type="button" class="book-now-button btn btn-primary"
          data-bs-toggle="modal" data-bs-target="#moreInfoModal">
    Enquire Now
  </button>
</section>
```

Add `noindex` support in `_layouts/default.html`:
```html
{% if page.noindex %}<meta name="robots" content="noindex, nofollow">{% endif %}
```

### 2.4 Clean up orphaned adventure pages

Three adventure detail pages exist on disk but are **not in `_data/adventures.yml`** at all - completely orphaned. They should be cleaned up to the same lightweight placeholder pattern as 2.3 with `noindex: true`:

| Page | Current state |
|------|--------------|
| `adventures/mountain-biking.html` | Incomplete (headings only, "more detail soon"), references non-existent `header-mtb.png` |
| `adventures/canoeing.html` | Empty (front matter only) |
| `adventures/bushcraft.html` | Copy-pasted canyoning content, wrong headings, wrong image |

### 2.5 Fix duplicate intro text on adventure detail pages

**Files:** `adventures/coasteering.html`, `adventures/canyoning.html`

Both full-content pages share identical generic intro text ("We offer a range of activities at Savage Adventures..."). This hurts SEO (duplicate content) and feels repetitive.

**Recommendation:** Remove the generic paragraphs from detail pages entirely - this text already appears on the main adventures listing page. Each detail page should go straight to activity-specific content.

### 2.6 Fix inconsistent email addresses

**Files:** `_includes/about/page-intro.md`, `_includes/header.html`, all contact forms

Two different emails are used across the site:
- About page: `Info@savage-adventures.com`
- Header: `bookings@savage-adventures.com`

**Policy (confirmed):**
- **Site/internal references** (about page, footer, etc.): `info@savage-adventures.com`
- **Customer-facing email** (contact forms, booking confirmation, header mailto link): `savageadventures@bookwild.app`

**Changes:**
- `_includes/about/page-intro.md` line 14: Change to `info@savage-adventures.com` (lowercase)
- `_includes/header.html` line 39-42: Change mailto and display text to `savageadventures@bookwild.app`
- `_config.yml`: Set `email: info@savage-adventures.com`
- Footer (Phase 5.6): Use `savageadventures@bookwild.app` for customer contact
- `_includes/terms/page-content.html` lines 33, 213, 238: Three different email addresses with inconsistent casing (`info@savage-adventures.com`, `Bookings@savage-adventures.com`, `Info@savage-adventures.com`). Standardise and make clickable `<a href="mailto:...">` links.

### 2.7 Centralise hardcoded form action URL

**Files:** `_includes/contact/page-content.html`, `_includes/contact/book-now-modal.html`, `_includes/contact/more-info-modal.html`

The Google Apps Script URL is duplicated across 3 files. This will be replaced with the BookWild endpoint in Phase 6, but centralising now into `_config.yml` prevents future duplication issues.

### 2.8 Fix wrong `bodyclass` values on multiple pages

**Files:** `education.html`, `challenges.html`, `john-muir.html`, `terms.html`

All four pages have `bodyclass: corporate` (copy-paste from the corporate page). This causes them to inherit corporate-specific CSS styling.

**Fix:** Set appropriate bodyclass values:

- `education.html`: `bodyclass: education`
- `challenges.html`: `bodyclass: challenges`
- `john-muir.html`: `bodyclass: john-muir`
- `terms.html`: `bodyclass: terms`

### 2.9 Fix non-existent header image references

**Files:** `education.html`, `challenges.html`, `john-muir.html`

All three pages reference `header-14-all-weather.png` in their front matter `header-images`. This file does not exist -- the actual file is `header-15-all-weather.png` (numbering error: `header-14-surfing.png` exists alongside `header-15-all-weather.png`). The slideshow silently skips the missing image.

**Fix:** Change `header-14-all-weather.png` to `header-15-all-weather.png` in all three files.

Also consider whether these pages should have activity-relevant header images rather than the generic set they currently share (all three use identical images copy-pasted from each other).

### 2.10 Fix missing team member image

**File:** `_data/team.yml` (line 26)

Craig Ritz references `image: guide-craig.jpg` which does not exist on disk. He is currently `visible: false`, but if enabled the image would be broken.

**Fix:** Either obtain the correct image, or remove the image field until one is available.

### 2.11 Add content to empty pages

**Files:**

- `_includes/education/page-intro.md` -- completely empty (0 lines)
- `_includes/education/page-content.html.liquid` -- contains only an empty `<section>` and an empty `<p></p>` tag
- `_includes/challenges/page-content.html.liquid` -- completely empty `<section>`
- `_includes/john-muir/page-content.html.liquid` -- completely empty `<section>`

After removing the "Under Development" banners (1.5), these pages will have no visible content at all. At minimum, add placeholder intro text and a "get in touch" CTA for each.

### 2.12 Fix terms page HTML issues

**File:** `_includes/terms/page-content.html`

**a) Stray `>` in heading (line 160):**

```html
<!-- Current (broken) -->
<h3>Smoking, Alcohol & Drugs Policy></h3>
<!-- Fix -->
<h3>Smoking, Alcohol & Drugs Policy</h3>
```

**b) Bare text inside `<ul>` (line 216):**

Text "By agreeing to this you accept that:" is placed directly as a child of `<ul>`, which is invalid HTML. Move it to a `<p>` before the list:

```html
<p>By agreeing to this you accept that:</p>
<ul>
  <li>...</li>
</ul>
```

**c) Broken anchor link -- `#liability` vs `id="liablity"` (line 18 vs 119):**

The table of contents links to `<a href="#liability">` but the target div has `id="liablity"` (typo). Fix to `id="liability"`.

### 2.13 Make terms page emails and phone numbers clickable

**File:** `_includes/terms/page-content.html` (lines 33, 213, 238)

Email addresses and phone numbers are plain text. Mobile users cannot tap to call or email.

**Fix:** Wrap in appropriate link tags:

```html
<a href="mailto:info@savage-adventures.com">info@savage-adventures.com</a>
<a href="tel:+447895834955">07895 834955</a>
```

Also standardise the inconsistent email casing across all three instances (see 2.6).

### 2.14 Review COVID cancellation clause

**File:** `_includes/terms/page-content.html` (line 109)

"Cancellation due to covid if a participant test positive within the duration of there activity" is grammatically broken (see 2.1 typo fixes) and may be outdated policy for 2026. It also doesn't state the outcome (refund? reschedule?).

**Action:** Review with the business owner whether this clause is still needed, and if so, rewrite it as a complete policy statement.

### 2.15 Fix outdated Brecon Beacons links

**Files:** `_data/adventures.yml` (line 5-6), `adventures/canyoning.html` (line 40)

Links go to `breconbeacons.org` which was the old Brecon Beacons National Park website. The park was renamed to Bannau Brycheiniog in 2023. The URLs may still redirect but could become stale.

Also note `adventures/canyoning.html` uses `http://` instead of `https://`.

**Fix:** Verify the links still work. Update to current URLs and ensure `https://` is used.

### 2.16 Standardise CTA button text and styles

Inconsistent "Book Now" button text and classes across the site:

| Location | Current text | Current class |
|----------|-------------|---------------|
| Adventures listing | "Book Now!" | `btn-orange` |
| Coasteering detail (top) | "Book Your Adventure Now!" | `btn-primary` |
| Coasteering detail (bottom) | "Book Now!" | `btn-primary` |
| Canyoning detail (bottom) | "Heard Enough? Book Now!" | `btn-primary` |
| Training intro | "Book Your Course Now!" | `btn-primary` |
| Training content | "Book Now!" | `btn-orange` |

**Fix:** Standardise to a consistent CTA text per context (e.g. "Book Now" everywhere, or "Book Your Adventure" on adventure pages) and a single button class for booking actions.

### 2.17 Fix `contact-us.html` title mismatch

**File:** `contact-us.html`

Front matter has `title: Contact` but the nav link says "Contact Us". The `<title>` tag renders as "Savage Adventures | Contact" which is less descriptive.

**Fix:** Change to `title: Contact Us` for consistency.

### 2.18 Clean up commented-out code in forms

**Files:** `_includes/contact/page-content.html`, `_includes/contact/book-now-modal.html`, `_includes/contact/more-info-modal.html`

All three files contain:

- Commented-out `data-email` attributes (`<!--data-email="bookings@savage-adventures.com"-->`)
- Scaffold/template comments (`<!-- You can customize the thankyou message... -->`)

Remove all dead commented-out code.

### 2.19 Fix Bushcraft placeholder data

**File:** `_data/adventures.yml`

Bushcraft entry has:

- `image: canyoning-waterfall-group.jpg` -- same image as Canyoning (copy-paste)
- `description: "Learn to survive like Ray Mears"` -- throwaway placeholder text

While `visible: false`, these should be cleaned up or the entry removed entirely until real content is available.

### 2.20 Fix redundant/duplicate taglines

**Files:** `terms.html`, `john-muir.html`

Both pages have `tagline:` identical to `title:` -- the tagline banner just repeats the page title. Other pages use distinct taglines (e.g. "Meet the team", "Find your adventure").

**Fix:**

- `terms.html`: e.g. `tagline: The important stuff`
- `john-muir.html`: e.g. `tagline: Connect with nature`

---

## Phase 3 - SEO & Meta Improvements

Priority: **HIGH** | Effort: **Medium** | Impact: **High**

### 3.1 Add XML Sitemap

**No sitemap exists.** This is a critical SEO gap.

Add the `jekyll-sitemap` plugin:

**File:** `Gemfile`
```ruby
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-sitemap"
end
```

**File:** `_config.yml`
```yaml
plugins:
  - jekyll-feed
  - jekyll-sitemap

url: "https://savage-adventures.com"
```

This auto-generates `/sitemap.xml` at build time with all pages.

### 3.2 Add robots.txt

**No robots.txt exists.** Create one:

**File:** `robots.txt` (in project root)
```
---
---
User-agent: *
Allow: /

Sitemap: {{ site.url }}/sitemap.xml
```

(The front matter dashes ensure Jekyll processes the Liquid tag.)

### 3.3 Add Open Graph and Twitter Card meta tags with page-specific images

**File:** `_layouts/default.html`

Use page-specific OG images instead of just the logo. Activity pages should share with their hero images:

```html
<!-- Open Graph -->
<meta property="og:title" content="Savage Adventures | {{ page.title }}">
<meta property="og:description" content="{{ page.description | default: site.description }}">
<meta property="og:type" content="website">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">
{% if page.og_image %}
<meta property="og:image" content="{{ site.url }}/assets/images/{{ page.og_image }}">
{% else %}
<meta property="og:image" content="{{ site.url }}/assets/images/og-default.jpg">
{% endif %}
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="Savage Adventures">
<meta property="og:locale" content="en_GB">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@sav_adventures">
<meta name="twitter:title" content="Savage Adventures | {{ page.title }}">
<meta name="twitter:description" content="{{ page.description | default: site.description }}">
{% if page.og_image %}
<meta name="twitter:image" content="{{ site.url }}/assets/images/{{ page.og_image }}">
{% else %}
<meta name="twitter:image" content="{{ site.url }}/assets/images/og-default.jpg">
{% endif %}
```

Then add `og_image` to page front matter. Suggested image mappings:

| Page | OG Image | Source |
|------|----------|--------|
| Default / Homepage | `og-default.jpg` | Create from logo + action shots composite (1200x630) |
| Adventures | `coasteering-jump-together.jpg` | Existing - good group action shot |
| Coasteering | `coasteering-run-jump.jpg` | Existing - dynamic coasteering image |
| Canyoning | `canyoning-waterfall-group.jpg` | Existing - group in waterfall |
| Climbing | `guide-pete-climbing.jpg` | Existing - climbing action |
| Stag & Hen | `coasteering-big-splash.jpg` | Existing - fun group energy |
| Corporate | Use a corporate header image | From header_images |
| About Us | `guide-phil-coasteering-point-crop.jpg` | Existing - team member in action |
| Training | Use a first aid header image | From header_images |

**Note:** OG images should ideally be 1200x630px. The existing images may need cropping/resizing. Consider creating optimised OG-specific versions in a `/assets/images/og/` directory.

### 3.4 Add canonical URLs

**File:** `_layouts/default.html`

```html
<link rel="canonical" href="{{ site.url }}{{ page.url }}">
```

### 3.5 Add JSON-LD structured data

#### 3.5a Site-wide LocalBusiness schema

**File:** new `_includes/structured-data.html` (included from `_layouts/default.html`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  "name": "Savage Adventures",
  "description": "{{ site.description }}",
  "url": "https://savage-adventures.com",
  "telephone": "+447895834955",
  "email": "savageadventures@bookwild.app",
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "South Wales",
    "addressCountry": "GB"
  },
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": { "@type": "GeoCoordinates", "latitude": 51.6, "longitude": -3.9 },
    "geoRadius": "50000"
  },
  "sameAs": [
    "https://www.facebook.com/Savage.Adventures",
    "https://www.instagram.com/savage.adventures/",
    "https://www.youtube.com/channel/UC23cqj-gvRmK4-nGjWLRo6w",
    "https://www.tripadvisor.co.uk/Attraction_Review-g186463-d12964875-Reviews-Savage_Adventures",
    "https://maps.app.goo.gl/wXL2aFqgBiYuL4JV7"
  ]
}
</script>
```

#### 3.5b FAQ schema on adventure detail pages

The coasteering and canyoning pages already have Q&A-style content ("What Is Coasteering?", "Where is it?", "Who's it best for?", "What we'll provide?", "How much is it?"). This is a perfect fit for FAQ structured data, which can generate rich search results.

Add to each adventure detail page:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is coasteering?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Coasteering is a physical activity that encompasses movement along the intertidal zone of a rocky coastline on foot or by swimming..."
      }
    }
  ]
}
</script>
```

This can be automated via Liquid by structuring the adventure detail pages to use data-driven content sections.

#### 3.5c Breadcrumb schema on sub-pages

Add BreadcrumbList structured data for adventure detail and other sub-pages:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://savage-adventures.com/" },
    { "@type": "ListItem", "position": 2, "name": "Adventures", "item": "https://savage-adventures.com/adventures" },
    { "@type": "ListItem", "position": 3, "name": "Coasteering", "item": "https://savage-adventures.com/adventures/coasteering" }
  ]
}
</script>
```

### 3.6 Improve carousel image alt text

**File:** `_includes/main/slideshow.html`

Currently: `alt="{{ image.basename }}"` -> produces `alt="header-01-coasteering.png"`.

**Fix:** Create a data file `_data/header_images.yml` mapping filenames to descriptive alt text:

```yaml
header-01-coasteering: "Group coasteering along the Gower coastline"
header-02-canyoning: "Canyoning through a waterfall in the Brecon Beacons"
# etc.
```

This also allows controlling slideshow order and which images appear.

### 3.7 Add page-specific meta descriptions

**All page files** - add `description:` to front matter:

| Page | Suggested description |
|------|----------------------|
| `index.html` | "Outdoor adventures in South Wales - coasteering, canyoning, climbing, surfing and more. Discover your primal side with Savage Adventures." |
| `adventures.html` | "Explore our full range of outdoor adventure activities across South Wales, from coasteering and canyoning to climbing and surfing." |
| `about-us.html` | "Meet the Savage Adventures team - passionate outdoor instructors based in South Wales." |
| `contact-us.html` | "Get in touch with Savage Adventures to book your outdoor adventure in South Wales." |
| `stag-hen.html` | "Plan the ultimate stag or hen do with outdoor adventures in South Wales - coasteering, canyoning, climbing and more." |
| `corporate.html` | "Corporate team building events and outdoor adventures in South Wales with Savage Adventures." |
| `training.html` | "First aid training courses - outdoor first aid, paediatric first aid, and first aid at work with Savage Adventures." |
| `education.html` | "Outdoor education programmes for schools and youth groups across South Wales." |
| `challenges.html` | "Welsh 3 Peaks Challenge - conquer the titans of Wales with Savage Adventures." |
| `john-muir.html` | "John Muir Award programmes - discover, explore, conserve and share with Savage Adventures." |
| `adventures/coasteering.html` | "Coasteering adventures on the Gower Peninsula, South Wales. Cliff jumping, cave exploring and swimming from £60pp." |
| `adventures/canyoning.html` | "Canyoning in the Brecon Beacons Waterfall Country. Waterfalls, plunge pools and natural water slides from £60pp." |
| `adventures/climbing.html` | "Rock climbing adventures in Pembrokeshire and the Gower. Indoor and outdoor climbing for all levels from £60pp." |

### 3.8 Update `<meta name="description">` to use page-level data

**File:** `_layouts/default.html`

Currently the description meta tag is hardcoded. Make it dynamic:

```html
<meta name="description"
      content="{{ page.description | default: site.description }}">
```

This is already the pattern used for OG tags - just ensure the main description meta tag matches.

### 3.9 Fix title tag ordering

**File:** `_layouts/default.html`

Currently: `<title>Savage Adventures | {{ page.title }}</title>` -- brand name comes first.

For SEO, the page-specific title should come first so it appears prominently in search results and browser tabs:

```html
<title>{{ page.title }} | Savage Adventures</title>
```

---

## Phase 4 - Performance Optimisation

Priority: **HIGH** (elevated from Medium) | Effort: **Medium** | Impact: **Critical**

### 4.1 Image optimisation (CRITICAL)

**This is the single biggest performance issue on the site.**

Current state:
- **Total images:** ~150MB
- **Header images:** 26 PNG files, 2-5MB each, totalling **90MB**
- **Content images:** several JPGs at 4-7MB each
- **SUP image:** 5.4MB animated GIF (`guide-pete-paddleboard-swim.gif`)

The homepage carousel loads ALL 26 header images = **90MB page weight on first load**.

**Action plan:**

1. **Convert header PNGs to optimised JPG/WebP** - PNGs are needlessly large for photographic content. Converting to JPG at 85% quality + WebP would reduce each image from ~3-5MB to ~100-200KB.

2. **Resize to appropriate dimensions** - Header images likely don't need to be more than 1920px wide. Current images may be at original camera resolution.

3. **Compress content images** - Many content JPGs are 2-7MB uncompressed. Target <200KB each.

4. **Replace GIF with video or static image** - `guide-pete-paddleboard-swim.gif` at 5.4MB should be either:
   - A short MP4/WebM video (far smaller and better quality)
   - A static JPG with a play button overlay
   - An animated WebP (~80% smaller than GIF)

5. **Add lazy loading** to below-fold images (see 4.4).

6. **Consider using `<picture>` with WebP + JPG fallback:**
```html
<picture>
  <source srcset="/assets/images/optimised/image.webp" type="image/webp">
  <img src="/assets/images/optimised/image.jpg" alt="..." loading="lazy">
</picture>
```

**Tools:** Could use a Jekyll plugin (`jekyll-responsive-image`), a build script (e.g. `sharp` or `imagemagick`), or rely on Cloudflare Polish/Image Resizing if available on the hosting plan.

**Estimated impact:** Page weight reduction from ~100MB+ to ~2-3MB. First Contentful Paint improvement of 10-20x.

### 4.2 Move render-blocking scripts

**File:** `_layouts/default.html`

Move Bootstrap JS, Popper.js, and Font Awesome from `<head>` to before `</body>`, or add `defer` attribute:

```html
<!-- In <head> - keep CSS only -->
<link href="...bootstrap.min.css" rel="stylesheet" ...>

<!-- Before </body> - move JS here -->
<script src="...popper.min.js" defer ...></script>
<script src="...bootstrap.min.js" defer ...></script>
<script src="https://kit.fontawesome.com/30fa2950fc.js" crossorigin="anonymous" defer></script>
```

### 4.3 Remove Decap CMS and Netlify Identity entirely

The site is moving to Cloudflare and Decap CMS (Netlify CMS) is no longer needed.

**Remove from `_layouts/default.html`:**
- Line 44: `<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>`
- Lines 60-70: The `netlifyIdentity` init script block

**Delete files:**
- `admin/config.yml` (Decap CMS configuration)
- `admin/index.html` (CMS admin panel entry point)
- The entire `admin/` directory

### 4.4 Add image lazy loading

**Files:** `_includes/adventures/summary-image.html.liquid`, adventure detail pages, team cards

Add `loading="lazy"` to images below the fold:

```html
<img src="..." alt="..." loading="lazy">
```

Keep the first carousel image as eager (above the fold). Other carousel images can be lazy.

### 4.5 Consolidate duplicate CSS variables

**Files:** `assets/css/sav-main.css`, `assets/css/sav-themes.scss`

The same colour palette is defined twice - once as CSS custom properties in `sav-main.css` and again as SCSS variables in `sav-themes.scss`.

**Recommendation:** Remove the CSS custom properties block from `sav-main.css` (lines 1-54) and let the SCSS-compiled output be the single source of truth for theming. If CSS custom properties are needed elsewhere, generate them from SCSS.

### 4.6 Remove console.log statements

**Files:** `assets/js/form-submission-handler.js`, `assets/js/themeToggle.js`

Remove or wrap in a debug flag:

- `form-submission-handler.js:4` - "Robot Detected!"
- `form-submission-handler.js:8` - "Welcome Human!"
- `form-submission-handler.js:59` - logs form data (potential data leak)
- `form-submission-handler.js:110` - "Contact form submission handler loaded successfully."
- `themeToggle.js:12` - "Setting theme to: ..."

### 4.7 Preload critical fonts

**File:** `_layouts/default.html`

Add preload hints for the custom Zing Rust font used in navigation:

```html
<link rel="preload" href="/assets/fonts/zing-rust-grunge2-base.otf" as="font" type="font/otf" crossorigin>
```

### 4.8 Remove unused images (~25 MB)

**Directory:** `assets/images/`

31 of 53 root images (58%) are not referenced anywhere in HTML, includes, or data files. Key unused files:

| File | Size |
|------|------|
| `mountain-biking-tom-snow.jpg` | 7.2 MB |
| `mountain-biking-tom-snow-crop.jpg` | 6.1 MB |
| `walking-mountain-cloud.jpg` | 6.0 MB |
| `climbing-abseiling-pembs.jpg` | 4.3 MB |
| `climbing-abseiling-pembs-crop.jpg` | 2.3 MB |
| `canyoning-old-group.jpg` | 2.3 MB |
| `guide-simon-view.jpg` | 2.2 MB |
| ...and 24 more files | |

Also: `273149558_10158460805866024_2233738839153048924_n.jpg` is an unprocessed Facebook download filename -- should be deleted or renamed.

**Action:** Review the list with the business owner and delete confirmed unused images. This saves ~25 MB from the repo and build output.

### 4.9 Remove dead CSS selectors

**File:** `assets/css/sav-main.css`

The following selectors have no matching HTML anywhere in the project:

- `.upcoming-events`, `.upcoming-events h1`, `.upcoming-events .card`, `.upcoming-events .card img` (lines 215-230)
- `.modal-heading-blue` (lines 480-482)
- `.modal-heading-middle` (lines 465-467)
- `.background-tom`, `.background-runjump`, `.background-jumpnervous`, `.background-waterfallslide`, `.background-philcoasteeringjump` (lines 425-443)
- `.text-runjump` (lines 484-486)
- `.quick-links .card-deck` (lines 164-168) -- `card-deck` is a BS4 class removed in BS5
- Empty rule: `.upcoming-events h1 { }` (lines 220-221)
- Commented-out `.our-team .card` background styles (lines 277-288)

### 4.10 Fix CSS colour system conflicts between files

**Files:** `assets/css/sav-main.css`, `assets/css/sav-themes.scss`

The two files define the same semantic colour names with **different values**:

| Name | `sav-main.css` (CSS var) | `sav-themes.scss` (SCSS var) |
|------|--------------------------|------------------------------|
| white | `#ffffff` | `#f6f8f9` |
| light-gradient-green | ends in `#191654` (purple!) | ends in `$green` (`#18b600`) |
| light-gradient-blue | `#0575E6 -> #021B79` (dark blue) | `$white -> #99e9ff` (white-to-light-blue) |

This creates unpredictable styling where different elements get different "whites" or completely different gradients depending on which system is used.

**Fix:** As part of 4.5 (consolidating duplicate CSS variables), ensure the SCSS values are the canonical source and remove or align the CSS custom properties.

### 4.11 Fix SCSS variable issues

**File:** `assets/css/sav-themes.scss`

- **`$ink-light` defined twice with different values:** Line 5 (`#ece9e6` warm beige) silently overridden by line 14 (`#606074` dark gray). Remove the unused first definition.
- **`$white` defined twice** (lines 7 and 15) with the same value (`#f6f8f9`). Remove the duplicate.
- **Unused variables:** `$dark` (line 2), `$dark-gray` (line 9) are defined but never referenced in any selector. Remove them.
- **Trailing comma in gradient value** (line 67): `$light-gradient-yellow: linear-gradient(to bottom, $white, $medium-gray 80%, $yellow,);` -- remove trailing comma.

### 4.12 Clean up Gemfile

**File:** `Gemfile`

- **Pin Jekyll version:** `gem "jekyll"` has no constraint. Pin to `gem "jekyll", "~> 4.4"` to prevent surprise major version upgrades.
- **Remove Windows-only gems:** `wdm` and `tzinfo`/`tzinfo-data` are boilerplate from the Jekyll scaffold, only needed on Windows/JRuby. Platform is `x86_64-linux` and deployment is Cloudflare (Linux). Safe to remove.
- **Remove boilerplate comments:** "Hello! This is where you manage which Jekyll version...", "Happy Jekylling!", etc.

### 4.13 Stop committing compiled CSS alongside SCSS source

**Files:** `assets/css/sav-themes.css`, `assets/css/sav-themes.css.map`

The compiled CSS and source map are committed alongside the SCSS source. If someone edits the `.css` directly or forgets to recompile after editing `.scss`, the files drift out of sync.

**Fix:** Add `assets/css/sav-themes.css` and `assets/css/sav-themes.css.map` to `.gitignore` and let the Jekyll build pipeline generate them.

### 4.14 Eliminate duplicate adventure DOM rendering

**File:** `_includes/adventures/summaries.html.liquid` (and stag-hen, corporate, education equivalents)

Each adventure listing renders the full list **twice** -- once for desktop layout and once for mobile -- and toggles visibility with CSS `display: none`/`display: block`. This doubles the DOM size, image downloads, and parse cost.

**Fix:** Use a single responsive layout with Bootstrap's grid breakpoints instead of duplicating the entire list.

### 4.15 Remove dead JavaScript code

**File:** `assets/js/form-submission-handler.js`

- `validateHuman()` (lines 3-10): defined but never called; the honeypot check on line 70 directly tests `formData.honeypot`. Also has inverted return logic (returns `true` for bots).
- Commented-out `xhr.withCredentials = true;` (line 85)

Remove both.

### 4.16 Fix theme toggle flash of unstyled content (FOUC)

**Files:** `assets/js/themeToggle.js`, `_layouts/default.html`

`themeToggle.js` is loaded at the end of `<body>` (line 73). Since it sets theme classes on `<body>`, there is a visible flash of default-theme content on every page load before the script executes.

**Fix:** Move the theme detection and body class logic to a small inline `<script>` in `<head>` (before any CSS renders). This ensures the correct theme class is applied before the first paint:

```html
<head>
  <script>
    (function() {
      var theme = null;
      try { theme = localStorage.getItem('theme'); } catch(e) {}
      if (!theme) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.classList.add('theme-' + theme);
    })();
  </script>
  <!-- CSS loads after theme class is already set -->
</head>
```

### 4.17 Fix image file permissions

**Directory:** `assets/images/`

10 image files have executable permissions (`rwxrwxr-x`) that are unnecessary for images (likely from a FAT/exFAT copy). Fix with:

```bash
find assets/images -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.gif" \) -exec chmod 644 {} \;
```

---

## Phase 5 - Accessibility & UX Improvements

Priority: **MEDIUM** | Effort: **Medium-High** | Impact: **High**

### 5.1 Add mobile hamburger menu

**File:** `_includes/header.html`

The current nav is just a `<ul>` with no responsive collapse. On mobile, links wrap awkwardly. Replace with Bootstrap 5's navbar component with collapse/toggler:

```html
<nav class="navbar navbar-expand-md">
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#mainNav" aria-controls="mainNav"
          aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="mainNav">
    <ul class="navbar-nav">
      <!-- existing nav items -->
    </ul>
  </div>
</nav>
```

This requires careful styling work to maintain the current aesthetic while adding responsive behaviour.

### 5.2 Add active state to nav links

**File:** `_includes/header.html`

Highlight the current page in the nav:

```liquid
<a class="nav-link {% if page.url == '/about-us' %}active{% endif %}" href="/about-us">About Us</a>
```

Or use a more dynamic approach comparing `page.url` to the link href.

### 5.3 Add aria-labels to social links

**File:** `_includes/header.html`

```html
<a class="social-link" href="..." aria-label="Visit us on TripAdvisor">
<a class="social-link" href="..." aria-label="Visit us on Facebook">
<a class="social-link" href="..." aria-label="Visit us on X (formerly Twitter)">
<a class="social-link" href="..." aria-label="Visit us on Instagram">
<a class="social-link" href="..." aria-label="Visit us on YouTube">
```

### 5.4 Add `target="_blank"` and `rel` to external links

**File:** `_includes/header.html`

Social links should open in new tabs:

```html
<a ... target="_blank" rel="noopener noreferrer">
```

### 5.5 Update Twitter to X branding

**File:** `_includes/header.html`

- Update icon class from `fa-twitter` to `fa-x-twitter` (Font Awesome 6)
- Update aria-label to mention X
- Verify the twitter URL still resolves (twitter.com -> x.com redirect)

### 5.6 Expand the footer

**File:** `_includes/footer.html`

The footer currently only has a T&Cs link. For a business site this is inadequate. Add:

- Customer contact email: `savageadventures@bookwild.app`
- Phone: `07895 834955`
- Social media links (mirror header)
- "South Wales" region
- Copyright notice with dynamic year
- "Powered by BookWild" link
- Quick nav links to key pages (Adventures, Contact, Gift Cards)

### 5.7 Add phone number field to contact form

**File:** `_includes/contact/contact-form-fields.html`

The BookWild enquiry API accepts a `phone` field. Add it to the form:

```html
<div class="row">
  <div class="col name">
    <input type="text" name="name" class="form-control" placeholder="Name *" required>
  </div>
  <div class="col email">
    <input type="email" name="email" class="form-control" placeholder="Email *" required>
  </div>
</div>
<div class="row">
  <input type="tel" name="phone" class="form-control" placeholder="Phone number">
</div>
```

### 5.8 Normalise link formats

**File:** `_includes/main/quick-links.html`

Change relative links (`./about-us`) to absolute paths (`/about-us`) for consistency with nav links.

### 5.9 Improve 404 page

**File:** `404.html`

The current 404 page is very plain. Add:
- Link back to homepage
- Links to main sections (Adventures, Contact Us)
- Match site styling and branding
- Friendly messaging in the brand voice

### 5.10 Add visual breadcrumbs on adventure detail pages

**Files:** `adventures/*.html`

Currently there's no way to navigate back from an adventure detail page to the adventures listing. Add a simple breadcrumb trail:

```
Home > Adventures > Coasteering
```

### 5.11 Add `<label>` elements to form inputs

**File:** `_includes/contact/contact-form-fields.html`

All form inputs (name, email, subject, message) use placeholder text as the only label, with no `<label>` elements or `id` attributes. Placeholders disappear on input and are not a substitute for labels. This fails WCAG 2.1 SC 1.3.1 (Info and Relationships) and SC 3.3.2 (Labels or Instructions).

**Fix:** Add `id` attributes to inputs and associate `<label>` elements. Use visually-hidden labels if the placeholder-only aesthetic is desired:

```html
<label for="contact-name" class="visually-hidden">Name</label>
<input type="text" id="contact-name" name="name" class="form-control"
       placeholder="Name *" required>
```

### 5.12 Add `aria-hidden="true"` to decorative icons

**Files:** `_includes/header.html`, `_includes/main/quick-links.html`

All Font Awesome `<i>` elements (social link icons, email icon, quick-link card icons, theme toggle icons) are missing `aria-hidden="true"`. Screen readers may announce gibberish for these decorative icons.

**Fix:** Add `aria-hidden="true"` to every `<i class="fas ...">` / `<i class="fab ...">` element:

```html
<i class="fab fa-tripadvisor" aria-hidden="true"></i>
```

### 5.13 Add accessible name to theme toggle button

**File:** `_includes/header.html`

The theme toggle button (lines 22-24) has no `aria-label` or accessible text. Keyboard and screen reader users cannot determine its purpose.

**Fix:**

```html
<button id="theme-toggle" aria-label="Toggle colour theme">
```

### 5.14 Fix heading hierarchy across site

Multiple pages have heading hierarchy issues:

| Page | Issue | Fix |
|------|-------|-----|
| About Us (`_includes/about/page-content.liquid:6`) | `<h1>{{ member.name }}</h1>` inside a loop creates multiple `<h1>` per page | Change to `<h2>` |
| Corporate (`corporate.html:12`) | Has `<h1>` in body AND `<h1>` tagline in header = two `<h1>` elements | Change body heading to `<h2>` |
| Challenges (`challenges.html:15`) | Has `<h1>` in body AND `<h1>` tagline in header = two `<h1>` elements | Change body heading to `<h2>` |
| Terms (`_includes/terms/page-content.html`) | Starts at `<h2>` with no page-level `<h1>` beyond the tagline | Acceptable if tagline serves as `<h1>` |

Best practice: one `<h1>` per page (the tagline in the header layout). All page-level headings should be `<h2>` or below.

### 5.15 Add `title` attribute to LightWidget iframe

**File:** `_includes/lightwidget.html`

The Instagram feed iframe has no `title` attribute, which is required for WCAG 2.1 SC 4.1.2.

**Fix:**

```html
<iframe src="..." title="Savage Adventures Instagram Feed" ...></iframe>
```

Also remove the deprecated `allowtransparency="true"` attribute (IE-era, ignored by modern browsers).

### 5.16 Add visible focus styles for keyboard navigation

**File:** `assets/css/sav-themes.scss`

Focus and hover styles are grouped together with identical styling (just a colour change, no outline):

```css
&:focus, &:hover { text-decoration: none; color: $ink-light; }
```

The theme toggle button has hover styles but zero `:focus` or `:focus-visible` styles. Modal close buttons also lack `:focus` styles.

**Fix:** Add distinct focus-visible styles throughout:

```css
a:focus-visible, button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

### 5.17 Add `prefers-reduced-motion` support

**Files:** `assets/css/sav-themes.scss`, `assets/css/sav-main.css`

The CSS includes `transition: all 3s` (theme toggle) and `transition: all 0.2s` (buttons) with no `@media (prefers-reduced-motion)` query. Users who prefer reduced motion still get all transitions.

**Fix:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Also change `transition: all` to target specific properties (e.g. `transition: background-color 0.3s, border-radius 0.3s`) to avoid unexpected animations.

### 5.18 Scope Turnstile callback per form

**File:** `assets/js/form-submission-handler.js`

`window.onTurnstileSuccess` (lines 166-170) enables **all** disabled submit buttons on the page via `document.querySelectorAll('button[type="submit"][disabled]')`. Since there are 2-3 forms on every page (contact + book-now modal + more-info modal), completing the Turnstile challenge on one form incorrectly enables submit buttons on all other forms.

**Fix:** Scope the callback to only the form whose Turnstile widget was completed. Use the Turnstile widget's container element to find the parent form:

```javascript
window.onTurnstileSuccess = function(token) {
  const widget = document.querySelector('.cf-turnstile iframe[name*="' + token.substring(0, 8) + '"]');
  if (widget) {
    const form = widget.closest('form');
    if (form) {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  }
};
```

### 5.19 Fix 404 page front matter and styling

**File:** `404.html`

- Missing `title` and `tagline` fields (browser tab shows "Savage Adventures |" with nothing after the pipe; header tagline area renders empty)
- Missing `bodyclass`
- Contains an inline `<style>` block that conflicts with Bootstrap's `.container` class

**Fix:** Add proper front matter and remove inline styles:

```yaml
---
layout: default
title: Page Not Found
tagline: Page Not Found
bodyclass: error-page
permalink: /404.html
---
```

### 5.20 Use separate favicon images for each size

**File:** `_layouts/default.html`

All three favicon `<link>` elements (16x16, 32x32, 96x96) point to the same file `/assets/favicon/favicon.png`. The browser scales a single image for all sizes, which can look blurry.

**Fix:** Generate size-specific favicons and an ICO file:

```html
<link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon/favicon-96x96.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png">
```

### 5.21 Move hardcoded values to site config

**File:** `_layouts/default.html`

Several values are hardcoded in the layout that should be site config variables:

| Current | Line | Suggested config key |
|---------|------|---------------------|
| `content="Phil Reynolds"` (meta author) | 13 | `site.author` |
| `content="#ff3300"` (theme colour) | 14 | `site.theme_color` |
| `data-sitekey="0x4AAAAAAABbnffUqgcrqQAD"` | (cf-turnstile.html) | `site.turnstile_sitekey` |
| `https://kit.fontawesome.com/30fa2950fc.js` | 38 | `site.fontawesome_kit_url` |

### 5.22 Fix theme toggle null safety and localStorage handling

**File:** `assets/js/themeToggle.js`

**a) Null safety crash (lines 1-2):**

`const btn = document.querySelector("#theme-toggle")` followed by `btn.querySelector(...)` -- if `#theme-toggle` is missing from the DOM, this throws `TypeError`. Add a null check:

```javascript
const btn = document.querySelector("#theme-toggle");
if (!btn) return;
```

**b) localStorage not wrapped in try-catch (line 9):**

`localStorage.getItem("theme")` can throw in private browsing mode on some browsers. Wrap in try-catch.

**c) Auto-detected theme not persisted (line 56):**

`localStorage.setItem("theme", currentTheme)` only fires on click. If the OS preference is auto-detected on first visit, it is not saved -- the detection re-runs on every page load. Consider persisting after initial detection.

---

## Phase 6 - BookWild Integration

Priority: **HIGH** | Effort: **Medium** | Impact: **Critical**

### BookWild Details (Confirmed)

| Detail | Value |
|--------|-------|
| **Organisation slug** | `savageadventures` |
| **Base URL** | `https://bookwild.app` |
| **Enquiry API endpoint** | `https://bookwild.app/savageadventures/api/v1/enquiries` |
| **Activities listing** | `https://bookwild.app/savageadventures/activities` |
| **Sessions calendar** | `https://bookwild.app/savageadventures/sessions` |
| **Turnstile site key** | Reuse existing: `0x4AAAAAAABbnffUqgcrqQAD` |
| **Customer-facing email** | `savageadventures@bookwild.app` |
| **Phone** | `07895 834955` |
| **Gift cards URL** | `https://bookwild.app/savageadventures/gift_cards/new` |
| **Google Business Profile** | https://maps.app.goo.gl/wXL2aFqgBiYuL4JV7 |

### Activity Mapping

| Adventure (site) | BookWild short_name | Activity page | Private booking link | Status |
|-------------------|---------------------|---------------|---------------------|--------|
| Canyoning | `canyoning-gorge-walking` | [Activity page](https://bookwild.app/savageadventures/activities/canyoning-gorge-walking) | [Book](https://bookwild.app/savageadventures/bookings/new?activity_id=canyoning-gorge-walking&booking_type=private_booking) | Ready |
| Climbing | `climbing` | [Activity page](https://bookwild.app/savageadventures/activities/climbing) | [Book](https://bookwild.app/savageadventures/bookings/new?activity_id=climbing&booking_type=private_booking) | Ready |
| Coasteering | `coasteering` | [Activity page](https://bookwild.app/savageadventures/activities/coasteering) | [Book](https://bookwild.app/savageadventures/bookings/new?activity_id=coasteering&booking_type=private_booking) | Ready |
| First Aid (Training) | `first-aid` | [Activity page](https://bookwild.app/savageadventures/activities/first-aid) | [Book](https://bookwild.app/savageadventures/bookings/new?activity_id=first-aid&booking_type=private_booking) | Ready |
| Surfing | - | - | - | Not on BookWild yet |
| Sit-on-Top Kayaking | - | - | - | Not on BookWild yet |
| Guided Walks | - | - | - | Not on BookWild yet |
| SUP | - | - | - | Not on BookWild yet |
| Bushcraft | - | - | - | Not on BookWild yet |

**Strategy:** Activities on BookWild link to their **activity page** (not the direct booking form) so customers can see full details, pricing, and availability before booking. Activities NOT on BookWild get the enquiry modal (as now). Remaining activities will be added to BookWild soon - the data structure should make adding new `bookwild_short_name` values trivial.

### 6.1 Update `_config.yml` with BookWild configuration

```yaml
# BookWild Integration
bookwild:
  base_url: "https://bookwild.app"
  org_slug: "savageadventures"
  enquiry_endpoint: "https://bookwild.app/savageadventures/api/v1/enquiries"
  activities_url: "https://bookwild.app/savageadventures/activities"
  sessions_url: "https://bookwild.app/savageadventures/sessions"
```

### 6.2 Rewire contact/enquiry forms to BookWild API

**Files:** `_includes/contact/page-content.html`, `_includes/contact/book-now-modal.html`, `_includes/contact/more-info-modal.html`, `assets/js/form-submission-handler.js`

**BookWild API details:**
- **Endpoint:** `POST https://bookwild.app/savageadventures/api/v1/enquiries`
- **Content-Type:** `application/json`
- **CORS:** Open (`Access-Control-Allow-Origin: *`)
- **Rate limit:** 5 requests / 10 minutes per IP
- **Required fields:** `name`, `email`, `message`
- **Optional fields:** `subject`, `phone`, `cf-turnstile-response`, `honeypot`
- **Anti-spam:** Turnstile validation (server-side) + honeypot (returns `204` silently)

**Responses:**
| Status | Body | Meaning |
|--------|------|---------|
| `201` | `{ "status": "ok", "message": "Thanks — your enquiry has been sent. We'll be in touch soon." }` | Success |
| `204` | (empty) | Honeypot triggered (silent success) |
| `403` | `{ "error": "Verification failed. Please complete the challenge and try again." }` | Turnstile failed |
| `404` | `{ "error": "Organisation not found" }` | Bad slug |
| `422` | `{ "error": "Please provide your name. Please provide your email." }` | Validation |
| `429` | `{ "error": "..." }` | Rate limited |

**Changes needed:**

1. Update form `action` attributes to BookWild endpoint (or use `data-action` + JS)
2. Rewrite `form-submission-handler.js`:
   - Replace XHR with `fetch()`
   - Send JSON body instead of form-encoded
   - Handle new response format
   - Remove the 5-second timeout
   - Remove Google Sheets-specific logic (`formGoogleSheetName`, `formGoogleSend`, `formDataNameOrder`)
   - Display server success/error messages to the user
   - Handle `429` rate limit
3. Keep existing Turnstile integration (field name matches: `cf-turnstile-response`)
4. Keep existing honeypot field (BookWild handles it)

**New form handler (outline):**

```javascript
const BOOKWILD_ENQUIRY_URL = 'https://bookwild.app/savageadventures/api/v1/enquiries';

async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = getFormData(form);

  if (formData.honeypot) return false;

  disableAllButtons(form);
  showSpinner(form);

  try {
    const response = await fetch(BOOKWILD_ENQUIRY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.data)
    });

    if (response.status === 204) {
      // Honeypot triggered - show fake success
      showSuccess(form, 'Thanks for your enquiry!');
      return;
    }

    const result = await response.json();

    if (response.ok) {
      showSuccess(form, result.message);
    } else if (response.status === 429) {
      showError(form, 'Too many requests. Please try again in a few minutes.');
    } else if (response.status === 403) {
      showError(form, 'Verification failed. Please complete the challenge and try again.');
    } else {
      showError(form, result.error || 'Something went wrong. Please try again.');
    }
  } catch (error) {
    showError(form, 'Network error. Please check your connection and try again.');
  }
}
```

### 6.3 Add BookWild activity links to adventures data

**File:** `_data/adventures.yml`

Add `bookwild_short_name` and `price_per_person` fields to each adventure:

```yaml
adventures:
  - name: Canyoning
    bookwild_short_name: canyoning-gorge-walking
    price_per_person: 60
    # ... existing fields

  - name: Coasteering
    bookwild_short_name: coasteering
    price_per_person: 60
    # ...

  - name: Climbing
    bookwild_short_name: climbing
    price_per_person: 60
    # ...

  - name: Surfing
    price_per_person: 60
    # no bookwild_short_name yet - will be added when set up on BookWild
    # ...

  - name: Training and Courses
    bookwild_short_name: first-aid
    # price varies by course - don't add price_per_person
    # ...
```

This allows price rendering from data rather than hardcoded HTML, and makes adding new BookWild activities trivial (just add a `bookwild_short_name` value).

### 6.4 Update "Book Now" buttons on adventures listing

**File:** `_includes/adventures/summary-description.html.liquid`

Three tiers of booking CTAs:

```liquid
{% if adventure.bookwild_short_name %}
  <!-- Activity exists on BookWild - link to activity page -->
  <a class="book-now-button btn btn-orange"
     href="{{ site.bookwild.activities_url }}/{{ adventure.bookwild_short_name }}"
     target="_blank" rel="noopener noreferrer">
    Book Now
  </a>
{% elsif adventure.available %}
  <!-- Activity available but not on BookWild - use enquiry modal -->
  <button type="button" class="book-now-button btn btn-orange"
          data-bs-toggle="modal" data-bs-target="#bookNowModal">
    Enquire Now
  </button>
{% else %}
  <button type="button" class="book-now-button btn btn-orange" disabled>
    Coming Soon
  </button>
{% endif %}

{% if adventure.find-out-more %}
  <a class="btn btn-green find-out-more-button"
     href="/adventures/{{ adventure.name | replace: ' ', '-' | downcase }}">Find out more</a>
{% endif %}
```

### 6.5 Update "Book Now" buttons on adventure detail pages

**Files:** `adventures/coasteering.html`, `adventures/canyoning.html`, `adventures/climbing.html`

Replace the modal-trigger Book Now buttons with direct BookWild links:

```html
<!-- Coasteering -->
<a class="book-now-button btn btn-primary"
   href="https://bookwild.app/savageadventures/activities/coasteering">
  Book Your Adventure Now!
</a>

<!-- Canyoning -->
<a class="book-now-button btn btn-primary"
   href="https://bookwild.app/savageadventures/activities/canyoning-gorge-walking">
  Book Your Adventure Now!
</a>
```

Also update the bottom "Book Now" buttons and the training page to link to the `first-aid` activity on BookWild.

### 6.6 Update training page Book Now buttons

**File:** `_includes/training/page-content.html`

Replace modal-trigger buttons with BookWild link:

```html
<a class="book-now-button btn btn-orange"
   href="https://bookwild.app/savageadventures/activities/first-aid"
   target="_blank" rel="noopener noreferrer">
  Book Now!
</a>
```

### 6.7 Remove Google Apps Script dependency

Once BookWild integration is confirmed working:

1. Remove `data-sheet` attributes from all forms
2. Remove `form-apps-script.js` from the repo (it runs on Google's side, not the site)
3. Clean `form-submission-handler.js` of all Sheet-specific logic

---

## Phase 7 - Marketing Improvements

Priority: **MEDIUM** | Effort: **Medium** | Impact: **Medium-High**

These are suggestions to improve the marketing effectiveness of the site.

### 7.1 Add "View Availability & Book" CTA to homepage

Add a prominent section or banner on the homepage linking to the BookWild sessions calendar:

```
https://bookwild.app/savageadventures/sessions
```

This gives visitors immediate access to see what's available and when, reducing friction to booking. Consider placing this between the hero slideshow and the quick links.

### 7.2 Add internal cross-links between activities

Adventure detail pages currently exist in isolation. Add "You might also like..." or "More adventures" sections at the bottom of each detail page, linking to related activities.

For example, at the bottom of the Coasteering page:
```
Looking for more adventures?
[Canyoning] [Climbing] [Surfing]
```

This improves time on site, reduces bounce rate, and helps SEO through internal linking.

### 7.3 Add social proof section (confirmed)

The site links to TripAdvisor in the header but doesn't showcase any reviews. Both a Google Business Profile and TripAdvisor listing exist:

- **Google:** https://maps.app.goo.gl/wXL2aFqgBiYuL4JV7
- **TripAdvisor:** https://www.tripadvisor.co.uk/Attraction_Review-g186463-d12964875-Reviews-Savage_Adventures-Newport_South_Wales_Wales.html

**Implementation:**

1. **Embed Google reviews widget** or a "See our reviews" CTA linking to the Google Maps listing
2. **Add a testimonials section** to the homepage or about page with curated quotes from Google/TripAdvisor
3. **Add AggregateRating structured data** if a specific star rating can be referenced (e.g. "4.9 stars from 120 reviews")
4. **Make TripAdvisor/Google links more prominent** - currently TripAdvisor is just an icon in the header; consider a "Rated 5 stars on TripAdvisor" badge or similar

### 7.4 Add "Gift an Adventure" section (confirmed)

Adding a "Gift an Adventure" link/section. This drives additional revenue through pre-paid gift cards and taps into seasonal buying (Christmas, birthdays, Valentine's).

**Link:** `https://bookwild.app/savageadventures/gift_cards/new`

**Implementation:**
- Add a "Gift an Adventure" quick link card on the homepage (see 7.5)
- Add a "Gift Cards" link in the nav or footer
- Consider a seasonal banner/section on the homepage when appropriate

### 7.5 Improve homepage quick links section

The current quick links (About, Corporate, Stag & Hen, Training, Contact) are functional but miss the primary action: **booking an adventure**. Changes:

1. Add an "Adventures" quick link card (currently missing - the main product isn't in the quick links!)
2. Add a "Gift Cards" card linking to `https://bookwild.app/savageadventures/gift_cards/new`
3. Reorder to lead with the primary conversion actions (Adventures, Gift Cards first)

### 7.6 Consider adding a blog

`jekyll-feed` is already installed but no blog posts exist. A blog with content like:

- "Best coasteering spots in South Wales"
- "What to expect on your first canyoning adventure"
- "5 team building ideas that don't involve trust falls"
- Seasonal activity guides

...would drive organic search traffic and establish authority. Jekyll makes this very easy with the `_posts/` directory convention.

This is a longer-term play and not essential for launch.

### 7.7 Email capture / newsletter signup

There's no way to capture visitor emails beyond the contact form. Consider adding a lightweight email signup form:

- "Get notified about new adventures and special offers"
- Could integrate with Mailchimp, Buttondown, or even BookWild if it adds this feature

---

## Information Needed

| # | Question | Status |
|---|----------|--------|
| 1 | BookWild organisation slug | **DONE** - `savageadventures` |
| 2 | BookWild activity short names | **DONE** - 4 activities mapped (see Phase 6) |
| 3 | Turnstile site key preference | **DONE** - reuse existing key |
| 4 | Incomplete adventure detail pages | **DONE** - set `find-out-more: false` on Climbing/Walks, convert all to placeholders with `noindex` |
| 5 | Orphaned adventure pages | **DONE** - keep as placeholders with `noindex` (mountain-biking, canoeing, bushcraft) |
| 6 | Preferred email | **DONE** - `info@savage-adventures.com` (internal), `savageadventures@bookwild.app` (customer-facing) |
| 7 | Business address | **DONE** - Use "South Wales" (no specific address) |
| 8 | Business phone | **DONE** - `07895834955` |
| 9 | Activity pricing | **DONE** - Coasteering/Canyoning/Climbing: £60pp. Training: varies by course |
| 10 | Decap CMS | **DONE** - Remove entirely (including admin/, Netlify Identity, git-gateway config) |
| 11 | BookWild "Book Now" link target | **DONE** - Link to activity page (not direct booking form) |
| 12 | Remaining activities on BookWild | **DONE** - Planned but not immediately. Design for easy addition later |
| 13 | Social proof / reviews | **DONE** - Google: https://maps.app.goo.gl/wXL2aFqgBiYuL4JV7 / TripAdvisor: existing header link |
| 14 | Gift card integration | **DONE** - Yes, add section linking to `https://bookwild.app/savageadventures/gift_cards/new` |

**All questions answered. No blockers remain.**

---

## Out of Scope / Future Work

These items are noted but not planned for this phase:

1. **Migrate from Jekyll to a different framework** - The current stack works fine for a marketing site
2. **Full redesign** - Current design is functional; only incremental improvements planned
3. **Automated pricing sync with BookWild** - Requires a new BookWild API endpoint; manual data file updates for now
4. **Internationalisation** - Welsh language support could be added later
5. **Cookie consent banner** - May be needed depending on analytics/tracking plans
6. **Analytics integration** - No Google Analytics or similar is currently installed; consider adding if needed
7. **Newsletter platform setup** - Depends on chosen provider (see 7.7)

---

## Implementation Order

Recommended execution order:

```
Phase 1 (Critical Fixes)        ~2-3 hours   <- Do first (carousel/modal BS4->BS5, CSS nesting, config)
Phase 2 (Content Fixes)         ~2-3 hours   <- Quick wins (typos, bodyclass, empty pages, terms page)
Phase 4 (Performance + CMS)     ~3-4 hours   <- Images, dead CSS/JS, FOUC, Decap CMS, Gemfile
Phase 3 (SEO & Meta)            ~2-3 hours   <- Sitemap, OG, schema, robots.txt, title tag
Phase 5 (Accessibility/UX)      ~4-6 hours   <- Nav, footer, forms, labels, focus styles, a11y
Phase 6 (BookWild)              ~3-4 hours   <- Forms, activity links, gift cards
Phase 7 (Marketing)             ~2-3 hours   <- Social proof, CTAs, cross-links
```

**Total estimated effort:** ~20-28 hours

**All questions answered. All phases unblocked. Ready to implement.**
