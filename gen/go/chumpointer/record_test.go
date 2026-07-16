package chumpointer_test

// record_test.go: byte-identity golden test.
//
// Loads the same corpus that chum/internal/object captured from UnsignedBytes,
// reproduces each record via chumpointer.Marshal, and asserts hex equality.
// A mismatch means chumpointer's wire format diverged from chum — fix the
// struct tags / CID-link encoding; do NOT alter the golden.

import (
	"encoding/hex"
	"encoding/json"
	"os"
	"reflect"
	"testing"

	"github.com/chum-blue/lexicons/gen/go/chumpointer"
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
		cidTag, prevTag, err := chumpointer.RecordFromCIDStr(e.CIDStr, e.PrevStr)
		if err != nil {
			t.Fatalf("entry %d CID parse: %v", i, err)
		}
		rec := chumpointer.Record{
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
		b, err := chumpointer.Marshal(rec)
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
func fullRecord(t *testing.T) chumpointer.Record {
	t.Helper()
	c, err := cid.Decode("bafyreibvjvcv745gig4mkqs5dvpjbdipenxvxxcnvmbnmnkjtqmp5znzzq")
	if err != nil {
		t.Fatal(err)
	}
	p, err := cid.Decode("bafyreidykglsfhoixmivffc5uwhcgshx4j465xwqntbmu43nb2dzqwfvae")
	if err != nil {
		t.Fatal(err)
	}
	prev := chumpointer.CIDLink(p)
	return chumpointer.Record{
		Bucket:      "b",
		Key:         "k",
		CID:         chumpointer.CIDLink(c),
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
	b, err := chumpointer.Marshal(want)
	if err != nil {
		t.Fatal(err)
	}
	got, err := chumpointer.Unmarshal(b)
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("round-trip mismatch:\n got %+v\nwant %+v", got, want)
	}
}

func TestUnmarshalRejectsWrongType(t *testing.T) {
	b, err := chumpointer.DagCBOR.Marshal(struct {
		Type string `cbor:"$type"`
	}{Type: "blue.chum.not.a.pointer"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := chumpointer.Unmarshal(b); err == nil {
		t.Fatal("want error on wrong $type, got nil")
	}
}

func TestUnmarshalRejectsGarbage(t *testing.T) {
	if _, err := chumpointer.Unmarshal([]byte{0xff, 0xff, 0xff}); err == nil {
		t.Fatal("want error on garbage, got nil")
	}
}
