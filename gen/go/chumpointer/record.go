// Package chumpointer provides DAG-CBOR encoding for blue.chum.pointer.record.
// The codec mirrors chum/internal/object/record.go: fxamacker cbor/v2 with a
// canonical DagCBOR EncMode (SortLengthFirst), tag-42 CID links (0x00-prefixed),
// and a $type discriminator. No signature field — detached-signature convention.
package chumpointer

import (
	"fmt"

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
	CapCID      string    `cbor:"capCid,omitempty"`
	IntentCID   string    `cbor:"intentCid,omitempty"`
	Tier        uint8     `cbor:"tier,omitempty"`
	WriterDID   string    `cbor:"writerDid,omitempty"`
	WriterSig   []byte    `cbor:"writerSig,omitempty"`
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

	// Writer authorship (SP-4e-1). All absent on a legacy record, which is
	// exactly what Tier then reports. A verifier reads these to GRADE the
	// chain (ADR-0008), not merely to accept it.
	CapCID    string // the capability that authorised WriterDID
	IntentCID string // content id of the intent's canonical bytes
	Tier      uint8  // ADR-0008 trust tier; 0 on a legacy record
	WriterDID string // the DID that AUTHORISED this write
	WriterSig []byte // detached signature over the intent's canonical bytes
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
		CapCID:      r.CapCID,
		IntentCID:   r.IntentCID,
		Tier:        r.Tier,
		WriterDID:   r.WriterDID,
		WriterSig:   r.WriterSig,
	}
	return DagCBOR.Marshal(u)
}

// Unmarshal decodes canonical DAG-CBOR record bytes into a Record. It is the
// inverse of Marshal and mirrors chum's object.DecodeUnsigned.
//
// Neither RecordCID nor the detached signature is in these bytes: the CID is the
// hash OF them and the signature is over them. A caller that needs either gets it
// from the wire alongside the bytes — and must check it against them.
func Unmarshal(canonical []byte) (Record, error) {
	var u unsignedRecord
	if err := cbor.Unmarshal(canonical, &u); err != nil {
		return Record{}, err
	}
	if u.Type != recordType {
		return Record{}, fmt.Errorf("chumpointer: unexpected $type %q, want %q", u.Type, recordType)
	}
	return Record{
		Bucket:      u.Bucket,
		Key:         u.Key,
		CID:         u.CID,
		Prev:        u.Prev,
		DID:         u.DID,
		ContentType: u.ContentType,
		CreatedAt:   u.CreatedAt,
		Size:        u.Size,
		Assembled:   u.Assembled,
		Tombstone:   u.Tombstone,
		Visibility:  u.Visibility,
		CapCID:      u.CapCID,
		IntentCID:   u.IntentCID,
		Tier:        u.Tier,
		WriterDID:   u.WriterDID,
		WriterSig:   u.WriterSig,
	}, nil
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
