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
	"testing"

	"github.com/chum-blue/lexicons/gen/go/chumpointer"
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
