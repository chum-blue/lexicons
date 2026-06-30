// Package chumpointer provides DAG-CBOR encoding for blue.chum.pointer.record.
// The codec mirrors chum/internal/object/record.go: fxamacker cbor/v2 with a
// canonical DagCBOR EncMode (SortLengthFirst), tag-42 CID links (0x00-prefixed),
// and a $type discriminator. No signature field — detached-signature convention.
package chumpointer

import (
	"github.com/chum-blue/lexicons/gen/go/chumauth"
	"github.com/fxamacker/cbor/v2"
	"github.com/ipfs/go-cid"
)

const recordType = "blue.chum.pointer.record"

// CIDLink wraps a CID as a DAG-CBOR tag-42 link. Re-exported from chumauth.
var CIDLink = chumauth.CIDLink

// LinkToCID reverses CIDLink. Re-exported from chumauth.
var LinkToCID = chumauth.LinkToCID

// DagCBOR is the canonical encode mode. Re-exported from chumauth.
var DagCBOR = chumauth.DagCBOR

// unsignedRecord is the DAG-CBOR shape that is hashed (→ RecordCID) and signed.
// Field names and cbor tags mirror chum's unsignedRecord exactly. The encoder
// emits keys in DAG-CBOR canonical (length-first) order — struct field order
// is irrelevant.
type unsignedRecord struct {
	Type        string    `cbor:"$type"`
	Bucket      string    `cbor:"bucket"`
	CID         cbor.Tag  `cbor:"cid"`
	ContentType string    `cbor:"contentType"`
	CreatedAt   string    `cbor:"createdAt"`
	DID         string    `cbor:"did"`
	Key         string    `cbor:"key"`
	Prev        *cbor.Tag `cbor:"prev"`
	Size        int64     `cbor:"size"`
	Assembled   bool      `cbor:"assembled,omitempty"`
	Tombstone   bool      `cbor:"tombstone"`
	Visibility  string    `cbor:"visibility"`
}

// Record holds the logical fields of a blue.chum.pointer.record.
// CID and Prev are DAG-CBOR tag-42 link values (use CIDLink to build them from
// a cid.Cid). CreatedAt is the verbatim RFC3339Nano UTC string that appears in
// the wire encoding — it must match chum's time.RFC3339Nano format exactly.
type Record struct {
	Bucket      string
	Key         string
	CID         cbor.Tag  // CIDLink(c)
	Prev        *cbor.Tag // nil = chain head; CIDLink(prevCID) otherwise
	DID         string
	ContentType string
	CreatedAt   string // RFC3339Nano UTC verbatim, e.g. "2024-03-15T12:00:00Z"
	Size        int64
	Assembled   bool
	Tombstone   bool
	Visibility  string
}

// Marshal encodes r as canonical DAG-CBOR, byte-identical to chum's
// object.UnsignedBytes for the same logical record.
func Marshal(r Record) ([]byte, error) {
	u := unsignedRecord{
		Type:        recordType,
		Bucket:      r.Bucket,
		CID:         r.CID,
		ContentType: r.ContentType,
		CreatedAt:   r.CreatedAt,
		DID:         r.DID,
		Key:         r.Key,
		Prev:        r.Prev,
		Size:        r.Size,
		Assembled:   r.Assembled,
		Tombstone:   r.Tombstone,
		Visibility:  r.Visibility,
	}
	return DagCBOR.Marshal(u)
}

// RecordFromCIDStr is a convenience helper: parse cidStr and prevStr into cbor.Tag
// link values suitable for Record.CID and Record.Prev.
// prevStr == "" means chain head (Prev = nil).
func RecordFromCIDStr(cidStr, prevStr string) (cidTag cbor.Tag, prevTag *cbor.Tag, err error) {
	c, err := cid.Decode(cidStr)
	if err != nil {
		return cbor.Tag{}, nil, err
	}
	cidTag = CIDLink(c)
	if prevStr != "" {
		p, err := cid.Decode(prevStr)
		if err != nil {
			return cbor.Tag{}, nil, err
		}
		t := CIDLink(p)
		prevTag = &t
	}
	return cidTag, prevTag, nil
}
