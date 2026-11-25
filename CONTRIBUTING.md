# Contributing to Beating

Beating is the directory of projects that carry a `heart.lock`. Registration happens through a GitHub pull request - no accounts, no backend, no form.

## Get listed

1. Add a `heart.lock` to your repo and freeze it (see [README.md](./README.md) and [SPEC.md](./SPEC.md)).
2. Open a pull request against this repo adding your entry to [`site/beating.json`](./site/beating.json).
3. A maintainer verifies your entry against the `heart.lock` in your repo before merging.
4. Once merged and deployed, you are listed as **frozen by the maker**.

## Entry format

Add one object to the array in `site/beating.json`:

```json
{
  "name": "your-project",
  "repo": "https://github.com/you/your-project",
  "what": "One line: what this project is.",
  "why": "One line: why this project exists.",
  "whom": "One line: whom this project is for.",
  "last_frozen": "2026-11-25",
  "status": "maker"
}
```

## Verification rule

Entries merge only when a `heart.lock` exists at the root of the linked repo and passes `heart check`. The maintainer fetches the raw `heart.lock` from the repo's default branch and runs the check.

## Claiming an example

If an example project is yours, open a PR that changes that entry's `status` to `"maker"` and sets `last_frozen` to the true freeze date from your `heart.lock`. The same verification rule applies.
