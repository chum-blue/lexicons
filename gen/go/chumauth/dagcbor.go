// Package chumauth provides DAG-CBOR encoding for blue.chum.auth signed records.
// The codec mirrors chum/internal/object/record.go: fxamacker cbor/v2 with a
// canonical DagCBOR EncMode (SortLengthFirst), tag-42 CID links (0x00-prefixed),
// and a $type discriminator. No signature field — detached-signature convention.
package chumauth

import (
	"errors"
	"fmt"

	"github.com/fxamacker/cbor/v2"
	"github.com/ipfs/go-cid"
)

// cidLinkTag is the DAG-CBOR tag number for an IPLD CID link.
const cidLinkTag = 42

// DagCBOR is the canonical encode mode (definite-length, length-first key sort).
// Identical options to chum/internal/object.DagCBOR.
var DagCBOR = func() cbor.EncMode {
	em, err := cbor.EncOptions{Sort: cbor.SortLengthFirst}.EncMode()
	if err != nil {
		panic(err)
	}
	return em
}()

// CIDLink wraps a CID as a DAG-CBOR tag-42 link: the binary CID prefixed with
// the 0x00 multibase-identity byte the spec requires. Mirrors chum's CIDLink.
func CIDLink(c cid.Cid) cbor.Tag {
	return cbor.Tag{Number: cidLinkTag, Content: append([]byte{0x00}, c.Bytes()...)}
}

// LinkToCID reverses CIDLink: strip the 0x00 prefix, parse the binary CID.
// Mirrors chum's LinkToCID.
func LinkToCID(t cbor.Tag) (cid.Cid, error) {
	if t.Number != cidLinkTag {
		return cid.Cid{}, fmt.Errorf("expected cid link tag %d, got %d", cidLinkTag, t.Number)
	}
	b, ok := t.Content.([]byte)
	if !ok || len(b) == 0 || b[0] != 0x00 {
		return cid.Cid{}, errors.New("malformed cid link content")
	}
	return cid.Cast(b[1:])
}
