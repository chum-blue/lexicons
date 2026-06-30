package chumauth

import (
	"fmt"

	"github.com/fxamacker/cbor/v2"
)

const capabilityType = "blue.chum.auth.capability"
const revocationType = "blue.chum.auth.revocation"

// CapabilityScope is a single bucket+can grant inside a Capability.
// Field order is irrelevant — the encoder emits keys in DAG-CBOR canonical
// (length-first) order.
type CapabilityScope struct {
	Bucket    string   `cbor:"bucket"`
	KeyPrefix *string  `cbor:"keyPrefix,omitempty"`
	Can       []string `cbor:"can"`
}

// Capability is the DAG-CBOR shape of a blue.chum.auth.capability record.
// No Sig field — detached-signature convention.
type Capability struct {
	Type      string            `cbor:"$type"`
	Iss       string            `cbor:"iss"`
	Aud       string            `cbor:"aud"`
	Scope     []CapabilityScope `cbor:"scope"`
	Prev      *cbor.Tag         `cbor:"prev,omitempty"`
	NotBefore string            `cbor:"notBefore,omitempty"`
	ExpiresAt string            `cbor:"expiresAt"`
	Nonce     string            `cbor:"nonce"`
	CreatedAt string            `cbor:"createdAt"`
}

// Revocation is the DAG-CBOR shape of a blue.chum.auth.revocation record.
// No Sig field — detached-signature convention.
type Revocation struct {
	Type       string    `cbor:"$type"`
	Capability cbor.Tag  `cbor:"capability"`
	Reason     *string   `cbor:"reason,omitempty"`
	CreatedAt  string    `cbor:"createdAt"`
}

// MarshalCapability encodes c as canonical DAG-CBOR, setting $type automatically.
func MarshalCapability(c Capability) ([]byte, error) {
	c.Type = capabilityType
	return DagCBOR.Marshal(c)
}

// UnmarshalCapability decodes canonical DAG-CBOR bytes into a Capability,
// validating the $type discriminator.
func UnmarshalCapability(b []byte) (Capability, error) {
	var c Capability
	if err := cbor.Unmarshal(b, &c); err != nil {
		return Capability{}, err
	}
	if c.Type != capabilityType {
		return Capability{}, fmt.Errorf("unexpected $type %q", c.Type)
	}
	return c, nil
}

// MarshalRevocation encodes r as canonical DAG-CBOR, setting $type automatically.
func MarshalRevocation(r Revocation) ([]byte, error) {
	r.Type = revocationType
	return DagCBOR.Marshal(r)
}

// UnmarshalRevocation decodes canonical DAG-CBOR bytes into a Revocation,
// validating the $type discriminator.
func UnmarshalRevocation(b []byte) (Revocation, error) {
	var r Revocation
	if err := cbor.Unmarshal(b, &r); err != nil {
		return Revocation{}, err
	}
	if r.Type != revocationType {
		return Revocation{}, fmt.Errorf("unexpected $type %q", r.Type)
	}
	return r, nil
}
