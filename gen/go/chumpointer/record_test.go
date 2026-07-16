package chumpointer

// record_test.go: byte-identity golden test.
//
// Loads the same corpus that chum/internal/object captured from UnsignedBytes,
// reproduces each record via Marshal, and asserts hex equality.
// A mismatch means chumpointer's wire format diverged from chum — fix the
// struct tags / CID-link encoding; do NOT alter the golden.
//
// This file is package chumpointer (internal test), not chumpointer_test,
// because TestLexiconDeclaresEveryEncodedField below needs reflect access to
// the unexported unsignedRecord type.

import (
	"encoding/hex"
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strings"
	"testing"

	"github.com/ipfs/go-cid"
)

type goldenEntry struct {
	Bucket      string `json:"bucket"`
	Key         string `json:"key"`
	CIDStr      string `json:"cidStr"`
	PrevStr     string `json:"prevStr"`
	DID         string `json:"did"`
	ContentType string `json:"contentType"`
	Size        int64  `json:"size"`
	Visibility  string `json:"visibility"`
	Tombstone   bool   `json:"tombstone"`
	Assembled   bool   `json:"assembled"`
	CreatedAt   string `json:"createdAt"`
	Hex         string `json:"hex"`
}

func TestGoldenByteIdentity(t *testing.T) {
	data, err := os.ReadFile("testdata/pointer_golden.json")
	if err != nil {
		t.Fatalf("read golden: %v", err)
	}
	var entries []goldenEntry
	if err := json.Unmarshal(data, &entries); err != nil {
		t.Fatalf("parse golden: %v", err)
	}
	for i, e := range entries {
		cidTag, prevTag, err := RecordFromCIDStr(e.CIDStr, e.PrevStr)
		if err != nil {
			t.Fatalf("entry %d CID parse: %v", i, err)
		}
		rec := Record{
			Bucket:      e.Bucket,
			Key:         e.Key,
			CID:         cidTag,
			Prev:        prevTag,
			DID:         e.DID,
			ContentType: e.ContentType,
			CreatedAt:   e.CreatedAt,
			Size:        e.Size,
			Assembled:   e.Assembled,
			Tombstone:   e.Tombstone,
			Visibility:  e.Visibility,
		}
		b, err := Marshal(rec)
		if err != nil {
			t.Fatalf("entry %d Marshal: %v", i, err)
		}
		got := hex.EncodeToString(b)
		if got != e.Hex {
			t.Errorf("entry %d (%s/%s): byte-identity FAILED\n  got  %s\n  want %s",
				i, e.Bucket, e.Key, got, e.Hex)
		} else {
			t.Logf("entry %d (%s/%s): OK (%d bytes)", i, e.Bucket, e.Key, len(b))
		}
	}
}

// fullRecord is a record with EVERY field populated — including the five SP-4e
// writer fields and multipart's assembled. A record with any field left zero
// cannot detect a drifted omitempty tag, which is the exact bug this guards.
func fullRecord(t *testing.T) Record {
	t.Helper()
	c, err := cid.Decode("bafyreibvjvcv745gig4mkqs5dvpjbdipenxvxxcnvmbnmnkjtqmp5znzzq")
	if err != nil {
		t.Fatal(err)
	}
	p, err := cid.Decode("bafyreidykglsfhoixmivffc5uwhcgshx4j465xwqntbmu43nb2dzqwfvae")
	if err != nil {
		t.Fatal(err)
	}
	prev := CIDLink(p)
	return Record{
		Bucket:      "b",
		Key:         "k",
		CID:         CIDLink(c),
		Prev:        &prev,
		DID:         "did:plc:operator",
		ContentType: "text/plain",
		CreatedAt:   "2026-07-16T12:00:00.123456789Z",
		Size:        42,
		Assembled:   true,
		Tombstone:   true,
		Visibility:  "public",
		CapCID:      "bafyreiccccccccccccccccccccccccccccccccccccccccccccccccccc",
		IntentCID:   "bafyreiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",
		Tier:        1,
		WriterDID:   "did:key:zWriter",
		WriterSig:   []byte{0xde, 0xad, 0xbe, 0xef},
	}
}

func TestUnmarshalRoundTripsFullRecord(t *testing.T) {
	want := fullRecord(t)
	b, err := Marshal(want)
	if err != nil {
		t.Fatal(err)
	}
	got, err := Unmarshal(b)
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("round-trip mismatch:\n got %+v\nwant %+v", got, want)
	}
}

func TestUnmarshalRejectsWrongType(t *testing.T) {
	b, err := DagCBOR.Marshal(struct {
		Type string `cbor:"$type"`
	}{Type: "blue.chum.not.a.pointer"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Unmarshal(b); err == nil {
		t.Fatal("want error on wrong $type, got nil")
	}
}

func TestUnmarshalRejectsGarbage(t *testing.T) {
	if _, err := Unmarshal([]byte{0xff, 0xff, 0xff}); err == nil {
		t.Fatal("want error on garbage, got nil")
	}
}

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
