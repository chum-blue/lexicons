package chumpointer

// contract_test.go: lexicon <-> codec field-set guard.
//
// This file is package chumpointer (internal test), not chumpointer_test,
// because TestLexiconDeclaresEveryEncodedField needs reflect access to the
// unexported unsignedRecord type. gen/go is a HAND-MAINTAINED mirror —
// `make gen-go` only builds it. This is the only test that makes the mirror
// track the lexicon contract; keep it isolated here so the rest of the
// package's tests can stay external (chumauth's convention, and the only way
// to prove chum can consume this package's public API from outside).

import (
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strings"
	"testing"
)

// TestLexiconDeclaresEveryEncodedField asserts the published lexicon's property
// set equals unsignedRecord's cbor tag set (minus $type, which is the lexicon's
// own id, not a declared property).
//
// gen/go is a HAND-MAINTAINED mirror — `make gen-go` only builds it. This test
// is the only thing that makes the mirror track the contract.
func TestLexiconDeclaresEveryEncodedField(t *testing.T) {
	path := filepath.Join("..", "..", "..", "lexicons", "blue", "chum", "pointer", "record.json")
	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read lexicon: %v", err)
	}
	var doc struct {
		Defs struct {
			Main struct {
				Record struct {
					Properties map[string]json.RawMessage `json:"properties"`
				} `json:"record"`
			} `json:"main"`
		} `json:"defs"`
	}
	if err := json.Unmarshal(raw, &doc); err != nil {
		t.Fatalf("parse lexicon: %v", err)
	}

	var declared []string
	for k := range doc.Defs.Main.Record.Properties {
		declared = append(declared, k)
	}
	sort.Strings(declared)

	var encoded []string
	rt := reflect.TypeOf(unsignedRecord{})
	for i := 0; i < rt.NumField(); i++ {
		tag := rt.Field(i).Tag.Get("cbor")
		name := strings.Split(tag, ",")[0]
		if name == "$type" {
			continue
		}
		encoded = append(encoded, name)
	}
	sort.Strings(encoded)

	if !reflect.DeepEqual(declared, encoded) {
		t.Fatalf("lexicon and codec disagree:\n  lexicon declares: %v\n  codec encodes:    %v", declared, encoded)
	}
}
