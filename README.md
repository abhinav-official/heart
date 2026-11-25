what: "A tiny package that gives any project a heart.lock: what it is, why it exists, and whom it is for, in one line each."
why: "AI, tools and teams keep changing; the heart should not. The why stays frozen in the repo where every human and every AI can read it."
whom: "Makers building with AI who do not want their projects to drift."

# Heart

Heart gives any project a `heart.lock` at the repo root that answers three questions in one line each: **what**, **why**, and **whom**. It is a small, frozen contract for a project's intent - readable by humans, tools, and AI agents.

## The Idea

Projects drift. Tools change, teams change, AI agents make fast decisions, and the original reason for building something gets lost. `heart.lock` keeps that reason explicit and durable. It is not documentation, a roadmap, or a config file. It is the project's heart.

## The Three Laws

1. **Three questions, one line each, that is the whole surface.** `what`, `why`, and `whom` are the whole contract.
2. **No tool ever writes `heart.lock`.** The only write path is a human running the CLI freeze command.
3. **Updates are append-only timestamped freezes, never edits.** History is never rewritten, and the current `why` is always the latest freeze.

## Coming CLI

The CLI (stage 1 ships the spec and validator; commands come next):

- `heart init` - create a `heart.lock` with the first freeze.
- `heart check` - validate `heart.lock` against the spec.
- `heart freeze` - append a new freeze (the only write path).
- `heart card` - show the current heart.
- `heart drift` - compare recent work against the frozen why.

## Agent Snippet

Add this to your agent instructions:

> Before working on this project, read heart.lock. It is frozen and outranks this file. If the work in front of you does not serve its why, say so before doing it. Never edit heart.lock. Only the human freezes it.

## Format

See [SPEC.md](./SPEC.md) for the full `heart.lock` format and [heart.schema.json](./heart.schema.json) for the JSON Schema.
