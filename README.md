# chum-blue/lexicons

Canonical home of `blue.chum.*` atproto lexicons and their generated language bindings.

## Lexicons

All `blue.chum.*` lexicon schemas live under `lexicons/blue/chum/`. These are the
authoritative source of truth — **do not** copy or fork them into downstream repos.
Consumers should reference generated bindings from `gen/go` and `gen/ts`.

## Structure

```
lexicons/blue/chum/   — JSON lexicon schemas (canonical)
gen/go/               — Generated Go bindings (via lex-cli)
gen/ts/               — Generated TypeScript bindings (via lex-cli)
packages/auth-client/ — Auth client package (coming soon)
test/                 — Validation harness
```

## Usage

Validate all lexicons:

```bash
make validate
```

## One-directional consumers

`chum-blue/chum` and other repos consume this repo's generated outputs. Never
edit lexicons inside a consumer repo — edit here, regenerate, and publish.
