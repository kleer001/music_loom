# Snapshot — Hugging Face audio listings, 2026-10-02

The listing data behind the counts and shares in `../SURVEY.md`.

`listings_2026-10-02.csv` holds one row per model per listing. A model that appears in more than one listing has more than one row. The columns are the Hub API's own fields:

| Column | Meaning |
|---|---|
| `listing` | Which query the row came from (see below) |
| `downloads_30d` | The Hub's `downloads` field: downloads in the last 30 days |
| `downloads_all_time` | The Hub's `downloadsAllTime` field |
| `license`, `license_name` | From the model card's front matter. `license_name` is set only when `license` is `other` |
| `base_model` | From the model card's front matter. Empty for a model that declares no parent |
| `gated` | `False`, `auto` or `manual` — whether the files sit behind a licence-acceptance click |

The licence columns are what each uploader declared. A re-upload can declare a licence that differs from its parent's; the CSV records the claim, not a check of it.

## The listings

| Listing | Query |
|---|---|
| `tag:sample-generation` | `filter=sample-generation`, by downloads, all results |
| `tag:stable-audio` | `filter=stable-audio`, by downloads, all results |
| `tag:music-generation` | `filter=music-generation`, by downloads, all results |
| `tag:Audio-to-Audio` | `filter=Audio-to-Audio`, by downloads, all results. This is a free-form tag, not the `audio-to-audio` pipeline |
| `tag:audio` | `filter=audio`, top 1,000 by downloads and top 1,000 by likes. The tag holds more than 1,000 models; the by-downloads cut ends at 257 downloads in 30 days |
| `pipeline:text-to-audio` | `pipeline_tag=text-to-audio`, top 400 by likes and top 400 by downloads |
| `pipeline:audio-to-audio` | `pipeline_tag=audio-to-audio`, top 400 by likes |

`fetch_listings.sh` re-runs the nine queries with the same fields and the six-second spacing. Download counts change daily, so a re-run gives a new snapshot rather than a copy of this one.
