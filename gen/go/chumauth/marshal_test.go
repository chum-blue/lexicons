package chumauth_test

import (
	"reflect"
	"testing"

	"github.com/ipfs/go-cid"

	"github.com/chum-blue/lexicons/gen/go/chumauth"
)

func sampleCID(t *testing.T) cid.Cid {
	c, err := cid.Decode("bafyreib2rxk3rybk3aobmv5cjuql3bm2twh4jo5uxgt5lhi3vjqfgq3jwa")
	if err != nil {
		t.Fatal(err)
	}
	return c
}

func TestCapabilityRoundTrip(t *testing.T) {
	kp := "logos/"
	c := chumauth.Capability{Iss: "did:plc:owner", Aud: "did:plc:delegate",
		Scope:     []chumauth.CapabilityScope{{Bucket: "site", KeyPrefix: &kp, Can: []string{"read", "write"}}},
		Nonce:     "n1",
		ExpiresAt: "2026-07-01T00:00:00Z",
		CreatedAt: "2026-06-30T00:00:00Z"}
	b, err := chumauth.MarshalCapability(c)
	if err != nil {
		t.Fatal(err)
	}
	got, err := chumauth.UnmarshalCapability(b)
	if err != nil {
		t.Fatal(err)
	}
	c.Type = "blue.chum.auth.capability" // Marshal sets $type; expect it on the way back
	if !reflect.DeepEqual(c, got) {
		t.Fatalf("round-trip mismatch:\n%+v\n%+v", c, got)
	}
}

func TestCapabilityChainPrev(t *testing.T) {
	link := chumauth.CIDLink(sampleCID(t))
	c := chumauth.Capability{Iss: "did:plc:a", Aud: "did:plc:b", Prev: &link,
		Scope:     []chumauth.CapabilityScope{{Bucket: "s", Can: []string{"read"}}},
		Nonce:     "n",
		ExpiresAt: "2026-07-01T00:00:00Z",
		CreatedAt: "2026-06-30T00:00:00Z"}
	b, err := chumauth.MarshalCapability(c)
	if err != nil {
		t.Fatal(err)
	}
	got, err := chumauth.UnmarshalCapability(b)
	if err != nil {
		t.Fatal(err)
	}
	if got.Prev == nil {
		t.Fatal("prev lost")
	}
	back, err := chumauth.LinkToCID(*got.Prev)
	if err != nil || !back.Equals(sampleCID(t)) {
		t.Fatalf("prev cid mismatch: %v %v", back, err)
	}
}

func TestRevocationRoundTrip(t *testing.T) {
	r := chumauth.Revocation{Capability: chumauth.CIDLink(sampleCID(t)), CreatedAt: "2026-06-30T00:00:00Z"}
	b, err := chumauth.MarshalRevocation(r)
	if err != nil {
		t.Fatal(err)
	}
	got, err := chumauth.UnmarshalRevocation(b)
	if err != nil {
		t.Fatal(err)
	}
	back, err := chumauth.LinkToCID(got.Capability)
	if err != nil || !back.Equals(sampleCID(t)) {
		t.Fatalf("capability cid mismatch: %v %v", back, err)
	}
}
