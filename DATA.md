# data/ schema reference

Data files behind **[ukraineaidnexus.org](https://ukraineaidnexus.org)**: organisations,
volunteers, fundraisers, creators, and accounts worth following.

**License: `data/orgs/`, `data/fundraisers/`, `data/creators/`, and `data/follow/` are CC0 (public domain).**
Use this data however you like, no permission needed. See [LICENSE-DATA](LICENSE-DATA).

`data/scammers/` is **not** CC0. It's covered by the repository's main
[LICENSE](LICENSE) (all rights reserved) and is not open to public pull
requests, since it carries legal exposure and every entry is manually reviewed.
Report a scammer through the
[submission form](https://ukraineaidnexus.org/submit/?type=scammer) instead.

## Structure
data/orgs/<id>.yaml Ukrainian/foreign NGOs and volunteers
data/fundraisers/<year>/<file>.yaml Live and past fundraisers, linked to an org
data/creators/<id>.yaml Ukrainian creators with a storefront or vouch
data/follow/<id>.yaml Accounts worth following (OSINT, journalists, official)
data/scammers/<id>.yaml Documented scammers (maintainer-only, not CC0)

## Submitting a change

Entries are added and edited by the maintainer. Suggest a new entry or a
correction through the [submission form](https://ukraineaidnexus.org/submit/).

## Universal rules

- `id`: lowercase-hyphens. Not just a style preference: Hugo lowercases
  generated page URLs by default, so a mixed-case `id` creates a real
  mismatch between the card's links (which use the raw `id`) and the
  actual page path, resulting in a 404 on the entry's own detail page.
- `dates`: YYYY-MM-DD.
- `draft: true` hides an entry from the live site without deleting it. Works on
  every entry type (orgs, fundraisers, creators, follow, scammers).
- `history`: optional, markdown, works on every entry type. Renders as a "History"
  section on the entry's detail page only (not on cards). Detail pages are English-
  only regardless of site language, see below.
- `location`: coarse only (city or country, never finer), and only what the person or
  org has published themselves. Precise locations for in-country volunteers are a
  doxxing risk.
- Strip tracking parameters before adding any link: X `?s=20`, Facebook `&rdid=...`,
  `utm_*` everywhere.
- Never suggest PayPal `webscr` donate links. They're not used on this site.
- `payment_note`, `warning`, `notes`, and `verified_by` accept markdown.
- **Per-field language overrides**: most free-text fields across all entry types
  (listed per-schema below) can each have a `_ua`, `_fr`, `_pl`, `_de`, `_ru`, `_nl`,
  or `_en` suffixed sibling, e.g. `description_ua: "..."`. Priority: the visitor's
  own site language suffix wins if present, otherwise `_en` wins if present,
  otherwise the plain field is used (also assumed English). The plain field and
  `_en` are interchangeable as the English baseline, use whichever you prefer, but
  if both exist on one entry, `_en` wins. This only applies on **cards** (the
  listing pages under /ngos/, /volunteers/, /fundraisers/, /creators/, /follow/,
  /scammers/). Individual entry detail pages (e.g. /volunteers/some-id/) now
  also respoect these overrides, including the page title and the history field.
  EnableAllLanguages in each _content.gotmpl now generates one page per language.
  List-form fields (like `category` on follow entries) work the
  same way, e.g. `category_ua: ["Журналіст", "OSINT / аналітика"]`.
- `name_ua` (on orgs) does double duty: it's the primary name shown when the site
  language is Ukrainian, AND it's still always shown as a secondary "/ Ukrainian
  name" annotation on every other language, same as before this feature existed.
  It only shows once, not twice, when Ukrainian is both the primary and the
  annotation. This dual behaviour is specific to `name_ua` on orgs; it doesn't
  apply to `name_ua` on creators, follow, or scammers, or to any other language
  suffix on any field.
- **Why `category` (follow) uses this mechanism instead of central `i18n` keys,
  unlike `type`/`tags` on orgs**: `type` and `tags` on orgs are small, fixed, closed
  vocabularies, so they're translated once centrally via `i18n/*.toml` keys
  (`tag_military` etc.) and reused across every entry. `category` on follow entries
  is open-ended in practice (10+ distinct values already in use, e.g. Journalist,
  OSINT / analysis, Fact-checking, Official, News outlet, On the ground, Advocacy,
  Culture, Fundraising, War updates, often combined per entry) and keeps growing.
  Centralising that would mean editing all 7 language files every time a new
  category appears, with a real risk of a missed key silently rendering an empty
  badge (a known gotcha with this site's `i18n` system). Using `category_ua` etc.
  per entry avoids that risk entirely: a missing translation just falls back to
  English instead of vanishing.
- `links.registration` (orgs only) can be a bare URL string, OR an object with
  `url` and `note`, for registries that are just a search portal with no direct
  per-org link:
```yaml
  registration:
    url: "https://www.handelsregister.de/"
    note: "Search for \"UA-DE e.V.\" or use registration number VR 12567 to verify."
```
  The link still goes to `url`; `note` renders as a small line underneath it,
  always visible, not a hover tooltip, since it's necessary information, not a
  minor caveat. Markdown allowed in `note`. `note` itself supports the same
  `_ua`/`_fr`/etc language overrides as everything else, e.g. `note_de: "..."`.

## Schema: data/orgs/&lt;id&gt;.yaml

```yaml
id: example-org                # required, lowercase-hyphens
name: "Name"                   # required. name_en/_fr/etc supported, see below.
name_ua: "Українська назва"    # optional. Used as the primary name on the Ukrainian
                                # site (like any other _ua override), AND always shown
                                # as a "/ Ukrainian name" annotation on every other
                                # language too. See "Per-field language overrides" above.
type: ua-ngo                   # required: ua-ngo | ua-volunteer | foreign-ngo | foreign-volunteer
                                # Single value, never a list. Decides which listing
                                # page the entry lives on AND which section its
                                # detail page is generated into.
also: [foreign-ngo]             # optional, list. EXTRA listing pages this entry
                                # should also appear on, for orgs registered in more
                                # than one place (e.g. type: ua-ngo + also:
                                # [foreign-ngo] shows on /ngos/ and /foreign-ngos/).
                                # Same vocabulary as `type`. Does NOT create a second
                                # detail page: the entry keeps one canonical URL,
                                # decided by `type`. Cards only.
status: active                 # required: active | inactive
description: "..."             # required, English (or use description_en).
                                # description_ua/_fr/etc supported.
email: address@example.com     # optional, top-level only (not under handles)
location: "Kyiv, Ukraine"      # optional, coarse only, self-published info only.
                                # location_ua/_fr/etc supported.
warning: "..."                 # optional, red flag box, markdown allowed.
                                # warning_ua/_fr/etc supported.
notes: "..."                   # optional, markdown allowed. notes_ua/_fr/etc supported.
verified_by: "..."             # optional, markdown allowed, who vouches and why.
                                # verified_by_ua/_fr/etc supported.
payment_note: "..."            # optional, markdown allowed, only shows if a payment
                                # field exists. payment_note_ua/_fr/etc supported.
draft: true                    # optional, hides the entry
tags: [military]                # optional, list. Fixed vocabulary, translated via
                                # i18n/*.toml (tag_military etc.), not per-entry.
                                # Renders as small badges on the card.
featured: true                  # optional. Pins the entry first, full-width gold-
                                # border card treatment.
featured_note: "..."            # optional, markdown, only shown when featured: true.
                                # featured_note_ua/_fr/etc supported.
logo: /img/example-org.png      # optional, path under static/, shown on the detail page only.
history: >                      # optional, markdown. See "History" note above.
  ...
featured_posts:                 # optional, list. Self-hosted quote cards of X posts,
                                # shown on the detail page only (not on cards).
  - user: handle_without_at     # required
    id: "1234567890123456789"   # required, quoted, the X post's status ID
    text: "Pasted post text, markdown allowed."   # optional
    date: "2026-07-01"           # optional, freeform display string
team:                           # optional, list, shown on the detail page only.
  - id: other-org-id            # optional, links to another entry in data/orgs;
                                # if set, that entry's name/handles are used and
                                # this member's own name/handles below are ignored
    name: "Name"                # used only if id isn't set
    role: "Coordinator"          # optional, free text
    handles: { x: handle }       # used only if id isn't set
transparency_flag: true         # optional, manual only. Forces the reputation
                                # meter (detail page only) to its lowest tier,
                                # regardless of registration/verified_by. Use when
                                # an org has raised money with no public accounting.
transparency_note: "..."        # optional, markdown, only shown when
                                # transparency_flag: true. Explain why. Detail page
                                # only, English only (no _lang variants, since the
                                # meter itself only renders on the English-only
                                # detail page).

handles:                       # all optional; bare handle unless noted
  x: handle_without_at
  bluesky: name.bsky.social
  facebook: name               # or full URL
  telegram: name
  whatsapp: "380XXXXXXXXX"     # international format, no +
  instagram: handle
  threads: handle
  tiktok: handle
  reddit: username
  discord: "https://discord.com/invite/..."   # full URL only
  linkedin: "https://linkedin.com/company/x"  # full URL only
  signal: "https://signal.me/#p/..."          # full URL only
  youtube: ChannelHandle
  mastodon: "https://server/@user"            # full URL only
  substack: newslettername
  medium: name

links:
  website: https://...
  linktree: https://linktr.ee/example
  donate: https://...          # actual donate pages only (WayForPay, Donorbox, hosted-button PayPal)
  buymeacoffee: https://buymeacoffee.com/...
  transparency: https://...    # reports, spreadsheets, achievement pages
  registration: https://opendatabot.ua/c/XXXX   # official registry link. Can
                                # instead be an object with url + note, see
                                # "Universal rules" above, for portals with no
                                # direct per-org URL.
  monobank: https://send.monobank.ua/jar/...
  privat: https://privat24.ua/send/...
  other:
    - { label: "Label", url: "https://..." }    # NON-payment links only
  donate_other:                # payment links with no dedicated key above
    - { label: "Wise", url: "https://...", icon: card }
    - { label: "Monobank jar — drones", url: "https://...", icon: jar, ua: true }
    - { label: "Cancer treatment fund", url: "https://...", icon: heart, personal: true }

paypalme: handle               # renders paypal.me/<handle>
paypal: ["email@example.com"]  # click-to-copy chip, no payment link
last_verified: 2026-07-08
```

## Schema: data/fundraisers/YYYY/YYYY-MM-orgid-shortname.yaml

Fundraiser files live in a folder named for the year in the filename:
`data/fundraisers/2026/2026-06-lorelei-drone-detectors.yaml`. The year folder is
purely for keeping the directory browsable; nothing reads it.

**The filename must keep its full `YYYY-MM-` prefix even inside the year folder.**
The bare filename is the detail-page URL slug (`/fundraisers/<filename>/`), so
renaming a file breaks every link anyone has ever shared to it.

Hugo turns subfolders into a nested map, so templates must never read
`hugo.Data.fundraisers` directly. Go through
`partials/fundraisers-flat.html`, which flattens it back to a single map keyed
by bare filename:

```
{{ $all := partialCached "fundraisers-flat.html" . "fundraisers-flat" }}
```

That partial also copes with loose files in `data/fundraisers/` and with a
deeper `data/fundraisers/<year>/<month>/` layout, so the folder scheme can
change later without touching any template.


```yaml
draft: true                    # delete this line to publish
org: org-id                    # required, must match an orgs/ id
title: "..."                   # required. title_ua/_fr/etc supported.
beneficiary: "Who it's for"    # optional. beneficiary_ua/_fr/etc supported.
description: >                 # optional. description_ua/_fr/etc supported.
  ...
goal: { amount: 13900, currency: USD }   # USD | EUR | GBP | UAH; omit for open-ended
raised: 0                      # optional, integers only
announced: 2026-06-11          # required
last_updated: 2026-07-08        # optional, bump when raised/status is updated
completed: 2026-07-08           # optional, date the collection closed. Only meaningful
                                # with status: completed. REQUIRED to get the 8-week
                                # report grace period (see below). No fallback: without
                                # it, a completed fundraiser with no report counts
                                # against the meter immediately.
expires: 2026-08-11            # omit for open-ended
status: active                 # required: active | completed | expired
part_of:                        # optional. Marks this as a helper jar feeding a larger
                                # collection run by someone else. See "Helper jars" below.
  fundraiser: 2026-06-org-name  # optional, data file key of the master, if it is listed
                                # on this site. Enables status + report inheritance.
  title: "Master collection"    # required when `fundraiser` is not set. title_ua/_fr/etc
                                # supported.
  url: https://x.com/...        # optional, link to the master collection
  lead: "Name"                  # optional, who runs the master collection
  goal: { amount: 500000, currency: UAH }   # optional, the master's overall target
tags: [military]                # optional, list, same fixed i18n-translated
                                # vocabulary as orgs
featured: true                  # optional, same pinning behaviour as orgs
featured_note: "..."            # optional, markdown, only shown when featured: true
history: >                      # optional, markdown, detail page only (see above)
  ...
featured_posts:                 # optional, same structure as on orgs, detail page only
  - user: handle_without_at
    id: "1234567890123456789"
    text: "..."
    date: "2026-07-01"
boosts:                         # optional, list. Time-limited donation
                                # matches/raffles, rendered as a yellow-accented box
  - label: "2x match until Friday"   # required, markdown
    details: "Details, markdown allowed."   # optional
    expires: "2026-08-15"        # optional, boost is hidden once past this date
    image: /img/boost-example.jpg   # optional, shown on the detail page only
links:
  x: https://x.com/.../status/...
  donate: https://...
  monobank: https://send.monobank.ua/jar/...
  privat: https://privat24.ua/send/...
  donate_other:
    - { label: "Wise", url: "https://...", icon: card }
paypalme: handle
paypal: ["email@..."]
report: null                   # completion report link, set alongside status: completed
```

### Card anchors

Each fundraiser card renders with `id="f-<data file key>"`, e.g.
`#f-2026-08-yuliia-anikina-66-ombr-vehicle`, plus `data-org="<org id>"`. The anchor
is per fundraiser, not per org, because one org routinely runs several at once.
Old `#f-<org-id>` links are redirected client-side to that org's first card.
`/fundraisers/?org=<org id>` filters the listing to a single org.

### Helper jars (`part_of`) and the master collection

Ukrainian volunteers routinely open a small "friendly jar" feeding a larger
collection run by someone else. `part_of` records that relationship.

Two cases:

- **Master is listed on this site**: set `part_of.fundraiser` to its data file key
  (filename without `.yaml`). The helper jar then inherits from it:
  - **Status**: if the master's status is not `active`, an `active` helper jar is
    shown with the master's status. Close the master, the jars close with it. Only
    one level is resolved; a jar pointing at a jar does not chain.
  - **Report**: if the helper jar has no `report` of its own, the master's `report`
    is used, and counts for the helper jar's org on the reputation meter. A
    volunteer gets credit for a transparently reported collection even when someone
    else published the report.
- **Master is not listed here** (most common): give `title`, and `url`/`lead`/`goal`
  as available. Nothing is inherited, so set `status` and `report` on the entry
  yourself. For `report`, use the lead's public report post.

The jar's own `goal` stays its personal target. `part_of.goal` is the master's
overall target and is shown as a separate line, not counted in the progress bar.

### The 8-week report grace period

Frontline reporting takes time. A `status: completed` fundraiser with no `report`
is **ignored entirely** by the reputation meter for 56 days from the `completed`
date. It neither earns Established nor blocks it, and the card shows a neutral
"report pending" badge. After 56 days it counts as an unreported completed
fundraiser and blocks Established until a `report` is added. Inherited reports
(see above) satisfy the requirement.

**Grace requires an explicit `completed:` date.** There is deliberately no fallback
to `last_updated` or `announced`. Those are edit and publish timestamps, not close
dates: a bulk edit across old entries would otherwise hand every one of them a fresh
grace period and award Established to an org with dozens of unreported collections.
An entry with `status: completed`, no `report` and no `completed:` date counts
against the meter straight away. Set `completed:` when you close something.

## Schema: data/creators/&lt;id&gt;.yaml

```yaml
id: name                       # required
name: "Name"                   # required. name_ua/_fr/etc supported.
makes: "What they make."       # required. makes_ua/_fr/etc supported.
handles: { ... }               # same options as orgs
shop:
  - { label: "Etsy shop", url: "https://..." }
other:
  - { label: "...", url: "..." }
notes: "..."                   # flag DM-only orders: no buyer protection.
                                # notes_ua/_fr/etc supported.
vouched_by: "..."              # optional. vouched_by_ua/_fr/etc supported.
draft: true                    # optional, hides the entry
history: >                      # optional, markdown, detail page only (see above)
  ...
last_verified: 2026-07-04
```

Requires a real storefront, or a vouch from an actual buyer.

## Schema: data/follow/&lt;id&gt;.yaml

```yaml
id: name                       # required
name: "Name"                   # required. name_ua/_fr/etc supported.
why: "Why worth following."    # required. why_ua/_fr/etc supported.
category: "OSINT / analysis"   # badge(s); string or list of strings, e.g.
                                # ["Journalist", "OSINT / analysis"]. Open vocabulary,
                                # not a fixed enum, in current use: Journalist,
                                # OSINT / analysis, Fact-checking, Official,
                                # News outlet, On the ground, Advocacy, Culture,
                                # Fundraising, War updates (and more may be added).
                                # category_ua/_fr/etc supported (list or string).
links: { website: https://..., tip: https://... }   # tip = a non-payment "buy me
                                # a coffee"-style tip link, distinct from orgs' links.buymeacoffee
handles: { ... }
draft: true                    # optional, hides the entry
history: >                      # optional, markdown, detail page only (see above)
  ...
last_verified: 2026-07-04
```

## Schema: data/scammers/&lt;id&gt;.yaml

Not CC0. Never automated, always manually reviewed, evidence-linked, and written
in attributed language ("X alleges...", not flat accusations), given UK libel
exposure. Not open to public pull requests, report suspected scammers through the
[submission form](https://ukraineaidnexus.org/submit/?type=scammer) instead.

```yaml
id: name                       # required
name: "Account name(s)"        # required. name_ua/_fr/etc supported.
handles:
  x: [handle1, handle2]        # string or list; scammers often run several
  x_id: ["1748768710167289856"]  # numeric X user IDs, QUOTED strings; string or list;
                                # ORDER MUST MATCH x ORDER (first id = first handle);
                                # renders inline "(permanent link)" -> x.com/i/user/<id>,
                                # survives renames. Find via view-source rest_id or
                                # tweeterid.com. Grab IDs EARLY.
  telegram: name               # other platforms supported
summary: "Documented behaviour, ATTRIBUTED to source."   # required.
                                # summary_ua/_fr/etc supported, see caution below.
evidence:                      # required, public linkable documentation only
  - { label: "Exposure by @someone", url: "https://x.com/.../status/..." }
  - { label: "Profile bio (archived)", url: "https://archive.ph/..." }   # archive.ph
                                # bios/posts before they're scrubbed
screenshots:                    # optional, list, detail page only. For evidence
                                # images (not linkable pages).
  - file: /evidence/scammer-id/screenshot1.jpg   # required
    label: "Caption, markdown allowed"   # required
draft: true                    # optional, hides the entry
history: >                      # optional, markdown, detail page only (see above)
  ...
added: 2026-07-04              # cards sort newest-first
last_verified: 2026-07-04
```

House rules: describe behaviour not legal conclusions, attribute allegations
("X alleges..."), evidence links mandatory, never automated. Archive volatile
evidence (bios, posts) via archive.ph. Scammer handles are the one place NEVER to
auto-update to a new username; the `x_id` link is the stable pointer.

**Translation caution for `summary_*`**: this field's exact phrasing carries real
legal weight (the difference between "X alleges Y" and a flat statement of fact).
If you add a translated summary, check that the attribution and hedging language
survived the translation, don't just machine-translate and publish. When in
doubt, leave the translation out and let it fall back to the carefully-worded
English original rather than risk a stronger claim slipping in.

## Layout facts

- `field-lang.html` partial does the language-fallback lookup for all of the above;
  see `layouts/partials/field-lang.html`.
- Detail pages (individual entry sub-pages) are now per-language, one real page
  per language per entry, via `.EnableAllLanguages` in each `_content.gotmpl`.
  `title` and `history` respect the same field-lang priority as cards.
  `featured_posts`, `team`, and the reputation meter
  (`transparency_flag`/`transparency_note`) still have no `_lang` variants and
  stay English-only, they weren't asked for and I didn't add them, say the word
  if you want those extended too.
- `org-mini.html`: a compact org summary shown in the "Backed by" section on
  fundraiser detail pages. It reads `.name`/`.description` directly rather than
  through field-lang.html, so it's still English-only regardless of what
  language the fundraiser detail page itself is now showing.
