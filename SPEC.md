# Heart Specification

This document defines the `heart.lock` format.

## Format

`heart.lock` is a JSON object at the repository root with these fields:

| Field | Type | Required | Rules |
|---|---|---|---|
| `what` | string | yes | Non-empty, single line. What the project is. |
| `why` | string | yes | Non-empty, single line. Why the project exists. Must equal the `why` of the last entry in `freezes`. |
| `whom` | string | yes | Non-empty, single line. Whom the project is for. |
| `frozen_at` | string | yes | ISO 8601 timestamp of the latest freeze. Must equal the `at` of the last entry in `freezes`. |
| `freezes` | array | yes | Oldest first. Each entry records a freeze. Must contain at least one entry. |

### Freeze entry

Each object in `freezes` has:

| Field | Type | Required | Rules |
|---|---|---|---|
| `at` | string | yes | ISO 8601 timestamp of when this freeze was made. |
| `why` | string | yes | Non-empty, single line. The project's why at this freeze. |
| `note` | string | yes | Non-empty, single line. Why the why changed (or why it was set, for the first freeze). |

## The Three Laws

1. **Three questions, one line each, that is the whole surface.** `what`, `why`, and `whom` are the entire contract. No extra fields carry meaning.
2. **No tool ever writes `heart.lock`.** The only write path is a human running the CLI freeze command.
3. **Updates are append-only timestamped freezes, never edits.** History is never rewritten. The current `why` is always the latest freeze's `why`.

## Freeze Semantics

- **Append-only.** A freeze adds a new entry to the end of `freezes`. Existing entries are never modified or removed.
- **History never rewritten.** The `freezes` array is the project's immutable record of why it exists.
- **The last freeze date is the project's heartbeat.** `frozen_at` and the last freeze's `at` record when the heart last beat. The top-level `why` reflects the latest freeze.
