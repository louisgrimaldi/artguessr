# Artguessr

An endless "guess the artist" game. Each round shows four works by one artist;
you pick their name from four options, then get a reveal card with their dates,
nationality, artistic movement (with the movement's own dates and other key
figures) and a short bio.

Artle-like in spirit, but endless rather than one puzzle a day.

```bash
npm install
npm run dev      # http://localhost:5173
```

**125 artists, 786 artworks**, spanning Jan van Eyck to Banksy.

## Playing

- Click an artist, or press <kbd>1</kbd>–<kbd>4</kbd>
- <kbd>←</kbd> / <kbd>→</kbd> browse the four artworks
- <kbd>↵</kbd> next artist after the reveal

Wrong answers are drawn from the artist's rough contemporaries, so the guess is
about style rather than century.

### Modes

| Mode | Behaviour |
| --- | --- |
| **Endless** | Every playable artist, reshuffling forever |
| **By movement** | One movement at a time, single pass, then a score. Distractors come from *inside* the movement, so the period can't give it away — this is the hard mode |
| **New to you** | Only artists you've never named correctly. Single pass, then a score. Distractors come from the *whole* roster — drawing them from the unseen pool too would tell you every name on offer is one you don't know |
| **Mistakes** | Artists you've misattributed. A correct answer here drops one off the list; a wrong one keeps it. Single pass, then a score |
| **Study guide** | Reference: every artist grouped by movement, with their works, dates, genre, location and a map |
| **Atlas** | Every located work plotted where it actually hangs, filterable by movement |

The sidebar carries a live count of outstanding mistakes and how many artists
you've identified at least once. Progress, mistakes and best streak all persist
in `localStorage` under `artguessr:save:v1`.

The next round's images are preloaded while you're still looking at the current
one, so advancing is instant. `Deck.peek()` returns the exact round `next()` will
hand back, which is what makes it safe to warm the cache.

Preloading runs as a **single sequential chain**, not a burst: this round's works
at full size first, then the next artist's. One request in flight at a time, so
the warming never competes with the picture actually on screen, and the two
rounds can't race each other. Warming only the visible slide was not enough —
Spectator's arrows move between works at full size, so every work not yet
visited stalled for seconds on first view. The chain is keyed on the round
alone: keying it on the slide as well meant each arrow press tore it down and
aborted whatever was mid-flight, so fast stepping finished nothing.

### Image delivery

Images come straight from `upload.wikimedia.org`, and both halves of that
sentence were once false and cost real time.

They used to be stored as `Special:FilePath/<name>?width=1200`. That is not a
file, it is a *redirect service*: every display walked `302 wikipedia.org →
301 Special:Redirect/file → 200 upload.wikimedia.org`, and the two redirects
carry `cache-control: private, max-age=0, must-revalidate`. So even a picture
already sitting in the browser cache cost two round trips to Wikipedia before
its own cached bytes could be reused. The images were never slow; the redirects
were. `npm run data:images` resolves each one to its direct URL — one request,
and freely cacheable.

Widths, likewise, can no longer be arbitrary. Wikimedia now serves thumbnails at
**20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840** only; ask for anything
else and you get a flat `400 Use thumbnail sizes listed on https://w.wiki/GHai`.
The old `?width=1400` appeared to work solely because Special:FilePath rounded
it up server-side, which is to say, by redirecting. Every size the app asks for
is now one of those numbers, so each is a plain CDN hit.

`imageAt()` also never requests more pixels than the file holds — an upscale
request is likewise a 400 — which means for the fifth of the collection whose
original is smaller than the display size, the full-screen preload resolves to
the same URL as the one already on screen, and costs nothing.

Thumbnail URLs are **stored per record, not derived**, because the naming is not
one rule:

| Original | Thumbnail |
| --- | --- |
| `Name.jpg` | `500px-Name.jpg` |
| `Name.tiff` | `lossy-page1-500px-Name.tiff.jpg` |
| `Name.tif` (portrait) | `lossless-page1-500px-Name.tif.png` |

Four files in the set are TIFFs, which no browser will display — so handing back
the original is handing back a broken-image icon, which is what Gauguin's *Manaò
tupapaú* was in the study guide. Those carry `render: true` and always go
through the renderer, at the largest standard width their original allows, even
when the caller asks for more. The resolver takes each pattern from the API and
stores it with the width as `{w}`; guessing it is what broke.

### Small pictures

**20% of works are under 960px wide** and some are far smaller: Koons's *Michael
Jackson and Bubbles* is 364px, Giacometti's *L'Homme qui marche I* 163px. This
isn't a resolution the pipeline can improve — in-copyright works are hosted
small deliberately, and that is the whole file.

Spectator mode used to cap display at native size on the reasoning that
enlarging only makes a picture mushy. True, and beside the point: it left those
works as postage stamps adrift in a black screen, which is worse than soft,
because you cannot see the work at all. They are now enlarged up to
`MAX_UPSCALE` (3×), capped in both axes so a tall picture is bounded by its
height rather than blowing out sideways. The Koons goes from 364px to 1092px
wide.

Native dimensions are stored per work, so the frame is the right shape on first
paint. It used to be measured in the image's `onLoad`, so the overlay opened at
a default 4:3 and snapped into shape when the picture arrived.

#### Why the small ones stay small

Of the works under 960px, **three quarters are in copyright**. English
Wikipedia's non-free content policy doesn't merely happen to host those at low
resolution, it *requires* low resolution — so for Bacon, Koons, Giacometti and
the rest there is no larger legitimate copy anywhere to find. Bacon's *Three
Studies of Lucian Freud* is 482px wide and that is the end of it.

The free ones are a different matter, and `node scripts/find-better-images.mjs`
checks them: it takes candidates **only from additional `P18` statements on the
work's own Wikidata item** — curated, never inferred. `--apply` writes them in.
It found four, including the Ghent Altarpiece going from 800px to the 9412px
Google Art Project scan.

The reason it refuses to search by filename is worth keeping. Spanish, Italian
and Polish Wikipedia all illustrate *Three Studies of Lucian Freud* with a
1500px Commons file named `After "1969" Three Studies of Lucian Freud.jpg` —
three times our resolution, freely licensed, every word of the title in the
name, and passing any plausible token match. It is a photographic restaging by
Michel Platnic. Only the file description says so.

### How many works per artist

Between **3 and 8**, by fame, and always ordered most-famous-first so the opening
card is the picture you're most likely to recognise. A work earns a slot by being
famous in its own right: present in **≥10 Wikipedia language editions**.

Current spread: 29 artists at 3 works, 66 at the full 8 (Van Gogh, Picasso, Monet,
Rembrandt, Vermeer, Munch, Klimt, Matisse, Dalí…), the rest in between.

That single absolute bar does the work. A *relative* bar — a fraction of the
artist's own top work — seems obviously right and is actively wrong here: one
towering masterpiece drags the threshold above the artist's other famous work, so
it punishes exactly the artists it should reward. It put Picasso, Munch, Warhol
and Hokusai all at the 3-work floor while Van Gogh kept 8. Picasso's *eighth*-best
work still has 16 language editions; Grant Wood's *second*-best has 9 — the
absolute bar separates them correctly and the relative one doesn't.

Tuning lives in `selectWorks()` in `scripts/build-artworks.mjs`. The script caches
the full ranked **pool** (up to 12 candidates) per artist and re-runs selection on
every invocation, so changing the threshold and running `npm run data` re-selects
instantly with no network traffic. `node scripts/tune-selection.mjs` prints the
distribution for a grid of thresholds offline; pass two numbers
(`tune-selection.mjs 10 0`) to see per-artist counts for one setting.

### Reveal card order

Artist → movement → work, deliberately: who made it, the tradition it belongs to,
then the specifics of this one picture. Name, dates and flag, then the bio, then
the movement card, then the work's genre/location, then the work list.

Nationality shows as a flag emoji (`src/data/flags.ts`); hyphenated nationalities
get both flags, and the word is kept as an `aria-label`/`title` so it stays
readable to screen readers. Netherlandish and Flemish map to 🇳🇱 and 🇧🇪 — they're
historical regions, not modern states.

### Movement eras, not exact dates

Movement year ranges are stored precisely but displayed as century phrases via
`eraLabel()` in `src/data/era.ts`: Impressionism reads "end of the 19th century",
Baroque "beginning of the 17th to middle of the 18th century", Ukiyo-e "17th to
19th century".

Two things that needed care. Centuries follow the **"1400s = 15th century"**
convention (`floor(year/100)+1`), not strict counting — strict counting is
pedantic on exactly the round years movement ranges start on, filing the Early
Renaissance (1400–1490) under the 14th century and Baroque (1600–1750) under the
16th. And a closing year on a century boundary means "up to then", so Ukiyo-e's
1660–1900 runs *through* the 19th century rather than into the 20th.

### Portraits

Every playable artist has a face, for learning names against likenesses. They
appear on the reveal card, on artist pages, in the Mistakes list, and as a grid
in the study guide — which is the actual memorisation view.

Source is Wikidata `P18` on the *person*, which is a self-portrait for most old
masters and a photograph for moderns; one batched query covers the whole roster
since every QID is already cached. Anyone without a free portrait falls back to
their Wikipedia infobox image. **125/125 playable artists covered.**

Movement cards show their leading figures with faces too, and many of those
(Donatello, Masaccio, Sol LeWitt) aren't playable artists at all — those are
resolved by name and stored under a `name:<slug>` key. **138 of 145 covered.**
Movement lists also use short forms, so `artistByName()` falls back to a
prefix/suffix match: "Rembrandt" finds "Rembrandt van Rijn".

Reading those name lists out of `movements.ts` needs a real string parser, not
`['"]([^'"]+)['"]`, which treats any quote as a terminator. One apostrophe
inside a double-quoted name derailed the rest of the list: `"Georgia O'Keeffe"`
parsed as `Georgia O`, and every name after it was swallowed as the junk between
quotes — which is how American Modernism silently lost Demuth, Dove and Hartley,
and how a portrait key with an empty slug came to be written. The seven still
uncovered (Kiefer, Saville, Marshall, plus Flavin, Judd, Balla and LeWitt) have
no `P18` on Wikidata at all.

That fallback deliberately does *not* use the filename-matching heuristic the
artwork pipeline uses. On an artist's own page, a file whose name contains their
name is far likelier to be one of their paintings than a photo of them — with
matching enabled it returned "'Grane' by Anselm Kiefer" as Kiefer's portrait.
Hence `articleImage(title, { allowBodyMatch: false })`, and three artists (Kiefer,
Kerry James Marshall, Jenny Saville) with no portrait rather than a wrong one —
all three are benched anyway.

`Face` renders initials if a portrait is missing or fails to load, so layouts
never collapse. Portraits are preloaded with the next round's artwork, so the
reveal is instant.

### Annotations

Hotspots are stored as percentages of the image, so they hold at any size — the
viewer sizes its frame to the picture's own aspect ratio precisely so they stay
aligned. All 116 points across 30 works were **checked against the actual
reproductions** and 115 of them moved. They had been placed from memory, and it
showed: American Gothic had the man and the woman on each other's positions,
Las Meninas put the mirror on a blank stretch of wall and the painter on the
back of his own canvas, The Scream's "two figures on the bridge" pointed at the
fjord on the opposite side, and Nighthawks' couple sat in an empty window.

The note itself is a callout pinned to its marker with an arrow pointing back at
it, overlapping the picture. It used to print in a line underneath, which meant
reading about a detail while looking away from it. It flips to whichever side
has room, based on the hotspot's own coordinates, and takes no pointer events so
that moving the mouse a few pixels can't make it flicker away.

### The map

Leaflet over CARTO basemap tiles, code-split so it's only fetched on the two
views that use it. Pins come from Wikidata `P276`/`P195` locations resolved to
`P625` coordinates. A work can yield several pins: Bourgeois's *Maman* exists as
casts in London, Ottawa, Bilbao and Tokyo, and all four are plotted.

Tiles are the one part of the app that needs a third-party service at runtime.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run data` | Resolve artwork images + metadata (incremental; `FORCE=1` refetches all) |
| `npm run data:details` | Re-fetch only places/genre/dates over cached pools — minutes, no image scraping. Use after editing `scripts/lib/details.mjs`, then `npm run data` to rewrite the output |
| `npm run data:portraits` | Rebuild `src/data/portraits.json` (fast — one batched query) |
| `npm run data:images` | Resolve every image to a direct `upload.wikimedia.org` URL + native size. Incremental; `FORCE=1` re-resolves all. Run after `npm run data` |
| `npm run validate` | Check the dataset; `-- --images` also HEAD-checks every URL |
| `npm run export` | Write `artists-and-works.txt` — every artist and their works as bullets |
| `node scripts/find-better-images.mjs` | Report free works held at low resolution that have a larger file on their Wikidata item; `--apply` writes them in |
| `node scripts/tune-selection.mjs` | Offline: how the 3–8 rule would carve up the cached pools |

## How the data is put together

Two files are hand-written, and they're what you edit to grow the game:

| File | What's in it |
| --- | --- |
| `src/data/artists.json` | 138 artists: dates, nationality, movement id, ~60-word bio |
| `src/data/movements.ts` | 39 movements: active years, one-line blurb, other key artists |

Generated: `src/data/artworks.json` (works + metadata) and `src/data/portraits.json`
(artist likenesses).

Artwork images are **not** hand-written — `npm run data` resolves them:

1. Look up each artist's Wikidata QID by name, disambiguating on **birth year**.
   Plain name search picks the wrong human surprisingly often: searching
   "Raphael" does not give you the painter, and "Lee Krasner" gives a stranger.
2. Query works by that artist that have a free Commons image (`P18`) *and* an
   explicit artwork type, ranked by how many Wikipedia language editions cover
   them — a decent fame proxy.
3. Merge in works that only have an English Wikipedia article. This matters
   because for artists still in copyright the famous works have *no* free image,
   so step 2 alone returns oddities — Picasso came back as municipal sculptures
   rather than *Les Demoiselles d'Avignon*.
4. Rank everything from both sources by notability and keep the top four.
5. Enrich just those four with **location** (`P276`, falling back to the owning
   collection `P195`) and **genre** (`P136`). This runs as a separate small query
   per artist — folding it into the ranking queries as `OPTIONAL`s multiplies
   rows per work and slows WDQS badly.

Results cache in `scripts/.cache.json`, so re-runs only fetch what's missing.

### Getting the in-copyright images right

Step 3 is the delicate part, and it's strict on purpose. It tries, in descending
order of trust: the infobox's wikitext image parameter, then an `<img>` rendered
inside the infobox, then a body image **whose filename matches words from the
work's title**. Vector files are always rejected.

Earlier, looser versions of this were quietly wrong in ways worth knowing about:

- "first `<img>` on the page" returned Wikipedia's own furniture — maintenance
  template icons like `Question_book-new.svg` — as artwork.
- On articles with no infobox it grabbed an unrelated painting from a navigation
  box, so every Joan Mitchell work came back as a Mondrian.
- Matching filenames against the *artist's name* rather than the title let a
  photo of *The Artist Is Present* through as the image for *Rhythm 0*.

Returning nothing is the correct outcome: the artist then falls short of four
works and is benched, rather than showing something wrong. `npm run validate`
guards these regressions — it fails on shared images, vector files and
icon-looking filenames.

### Growing the game

Add an entry to `src/data/artists.json` (reusing a `movement` id, or adding one
to `movements.ts`) and run `npm run data`. No code changes needed.

### When the pipeline can't find the work

`src/data/extra-works.json` is a hand-curated list merged in *after* selection,
for artists Wikidata simply does not cover.

Giacometti is the case it was written for. He died in 1966, so the sculptures
are in copyright until 2036: there are no free photographs, and Wikidata carried
five items for him in total — of which one was a snapshot of autumn leaves on
Gerda Taro's grave in Père-Lachaise, filed as his work because he made the
headstone. Of his actually famous pieces (*The Palace at 4 a.m.*, *Spoon Woman*,
*The Chariot*, *Woman with Her Throat Cut*) not one has a usable image anywhere
in the pipeline's reach. He now has five works instead of three, two of them
added by hand.

Entries bypass the fame threshold entirely — feeding them into the pool instead
would achieve nothing, since the threshold is exactly what excluded them. So
only add works that are genuinely well known and genuinely by that artist.
`title` and `image` are required; the rest matches the shape the script writes.

Note that `npm run data` rewrites `artworks.json` wholesale and drops the
resolved `src`/`width`/`height`, so **always follow it with `npm run
data:images`**. `npm run validate` reports `direct image URLs` as a check.

Two filters worth knowing about, both added because of the above:

- `\bgrave of\b` in `BAD_TITLE`. A burial plot is a place, not a work. *Tomb
  of…* is deliberately excluded from the rule — those are carved monuments and
  really are the sculptor's work.
- `NOT_THE_WORK` is now applied to portraits too, not just artworks. It already
  caught infobox location maps (`osm-intl,13,29.7265,-95.3906,270x200.png` is
  what "Large Standing Woman I" returns), but the portrait path skipped it, so a
  sculptor's face could have been a map of Houston.

One known wart: the image on *L'Homme qui marche I* is a photograph of *Walking
Man II*. That is the lead image of the English Wikipedia article itself, so it
is what the extractor faithfully returns.

### Known gaps

**13 seeded artists are benched** — Wikidata has fewer than three usable
per-artwork images for them, almost all living or recent: Jenny Saville, Agnes
Martin, Cy Twombly, Takashi Murakami, Joan Mitchell, Helen Frankenthaler, El
Anatsui, Amy Sherald, Lee Krasner, Jacob Lawrence, Yayoi Kusama, Anselm Kiefer,
Kerry James Marshall. `src/game.ts` filters on the 3-work minimum, so they appear
automatically once images resolve. To bring one in now, add works to
`src/data/artworks.json` by hand.

**Metadata coverage:** date 97% (exact year 85%), location 91%, coordinates 88%,
genre 76%. The remaining gaps are genuine rather than bugs — *Garçon à la pipe* is
privately owned so has no public location, and Steilneset Memorial simply has no
`P276` on Wikidata.

### Dates, and why there are two fields

Wikidata stores dates with a **precision**, and coarse values sit on a boundary:
"21st century" is `2100-01-01` at `timePrecision 7`, which an unchecked parse
reads as the year 2100. That is exactly how Steilneset Memorial came to be dated
2100.

So each work carries both:

- `year` — an exact year, **only** at precision ≥ 9. Null otherwise, so nothing
  downstream can sort or validate against a fabricated date.
- `dateLabel` — what to display: the year, or `"1480s"` / `"17th century"` when
  that is genuinely all Wikidata knows.

Use `dateOf(work)` in the UI. Works are coarse-dated this way — Botticelli's
*Primavera* reads "1480s", Fragonard's *The Swing* "1760s" — which took date
coverage from 85% to 98% without ever showing a false exact year.

## Image rights

Step 2 images are public-domain or freely licensed via Wikimedia Commons. Step 3
images are in-copyright works hotlinked from Wikipedia, where they sit under
fair-use rationales that cover Wikipedia rather than this app. Fine for local and
educational use; worth revisiting before deploying anywhere public or commercial.

One explicit work (Hokusai's *The Dream of the Fisherman's Wife*) is filtered out
via a blocklist in `scripts/build-artworks.mjs`; extend or empty that set to taste.
