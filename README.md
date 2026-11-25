what: "A tiny package that gives any project a heart.lock: what it is, why it exists, and whom it is for, in one line each."
why: "AI, tools and teams keep changing; the heart should not. The why stays frozen in the repo where every human and every AI can read it."
whom: "Makers building with AI who do not want their projects to drift."

# Heartlock

Heartlock is for **any project with a repo, in any language**. No Node install is required to use the file and the rules. A `heart.lock` at the repo root answers three questions in one line each: **what**, **why**, and **whom**. It is a small, frozen contract for a project's intent - readable by humans, tools, and AI agents.

## The Idea

Projects drift. Tools change, teams change, AI agents make fast decisions, and the original reason for building something gets lost. `heart.lock` keeps that reason explicit and durable. It is not documentation, a roadmap, or a config file. It is the project's heart.

## The Three Laws

1. **Three questions, one line each, that is the whole surface.** `what`, `why`, and `whom` are the whole contract.
2. **No tool ever writes `heart.lock`.** The only write path is a human running the CLI freeze command.
3. **Updates are append-only timestamped freezes, never edits.** History is never rewritten, and the current `why` is always the latest freeze.

## Use it without installing anything

You don't need the CLI to use Heartlock.

1. Copy [`examples/heart.lock`](./examples/heart.lock) into your project root as `heart.lock`.
2. Edit the three lines by hand: `what`, `why`, and `whom`.
3. Freeze by hand following [SPEC.md](./SPEC.md): set `frozen_at`, and append a freeze entry to `freezes` with `at`, `why`, and `note`. When the why changes, append a new freeze entry and update the top-level `why` and `frozen_at` - never rewrite history.

The file is plain JSON. Any editor, any language, any stack.

## CLI (convenient, not required)

The `heart` CLI is a convenient way to work with `heart.lock`:

- `heart init` - create a `heart.lock` with the first freeze.
- `heart check` - validate `heart.lock` against the spec.
- `heart freeze` - append a new freeze (the only write path).
- `heart card` - render the current heart as SVG/HTML.
- `heart drift` - compare recent work against the frozen why. *(coming)*

Install with npm if you want it: `npm install -g heartlock` (or run from this repo).

## Agent Snippet

Add this to your agent instructions:

> Before working on this project, read heart.lock. It is frozen and outranks this file. If the work in front of you does not serve its why, say so before doing it. Never edit heart.lock. Only the human freezes it.

## Format

See [SPEC.md](./SPEC.md) for the full `heart.lock` format and [heart.schema.json](./heart.schema.json) for the JSON Schema.
