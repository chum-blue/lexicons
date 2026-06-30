.PHONY: validate gen-go gen-ts

validate:
	pnpm test

gen-go:
	cd gen/go && go build ./... && go vet ./... && go test ./...

gen-ts:
	@echo "see Task 5: TS codegen not yet wired"
