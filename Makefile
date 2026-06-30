.PHONY: validate gen-go gen-ts

validate:
	pnpm test

gen-go:
	cd gen/go && go build ./... && go vet ./... && go test ./...

gen-ts:
	pnpm exec lex gen-api --yes gen/ts lexicons/blue/chum/**/*.json
