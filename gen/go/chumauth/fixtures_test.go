package chumauth_test

import (
	"testing"

	attenfixtures "github.com/chum-blue/lexicons/fixtures/attenuation"
	"github.com/chum-blue/lexicons/gen/go/chumauth"
)

// toCapability converts a loader CapabilityJSON to a chumauth.Capability for
// well-formedness validation. Prev and NotBefore are left zero (optional fields
// not used in the corpus). The $type field is set by MarshalCapability; we set
// it manually here so DeepEqual works if needed elsewhere.
func toCapability(c attenfixtures.CapabilityJSON) chumauth.Capability {
	scopes := make([]chumauth.CapabilityScope, len(c.Scope))
	for i, s := range c.Scope {
		scopes[i] = chumauth.CapabilityScope{
			Bucket:    s.Bucket,
			KeyPrefix: s.KeyPrefix,
			Can:       s.Can,
		}
	}
	return chumauth.Capability{
		Iss:       c.Iss,
		Aud:       c.Aud,
		Scope:     scopes,
		ExpiresAt: c.ExpiresAt,
		Nonce:     c.Nonce,
		CreatedAt: c.CreatedAt,
	}
}

func TestFixturesLoadAndParse(t *testing.T) {
	cases, err := attenfixtures.LoadAttenuationCases()
	if err != nil {
		t.Fatalf("LoadAttenuationCases: %v", err)
	}

	if len(cases) < 10 {
		t.Fatalf("expected ≥10 fixture cases, got %d", len(cases))
	}

	var nValid, nInvalid int
	for _, c := range cases {
		parent := toCapability(c.Parent)
		child := toCapability(c.Child)

		// Well-formedness: required string fields must be non-empty.
		for _, cap := range []chumauth.Capability{parent, child} {
			if cap.Iss == "" {
				t.Errorf("[%s/%s] capability missing iss", c.Category, c.Filename)
			}
			if cap.Aud == "" {
				t.Errorf("[%s/%s] capability missing aud", c.Category, c.Filename)
			}
			if len(cap.Scope) == 0 {
				t.Errorf("[%s/%s] capability has no scope entries", c.Category, c.Filename)
			}
			if cap.ExpiresAt == "" {
				t.Errorf("[%s/%s] capability missing expiresAt", c.Category, c.Filename)
			}
			if cap.Nonce == "" {
				t.Errorf("[%s/%s] capability missing nonce", c.Category, c.Filename)
			}
			if cap.CreatedAt == "" {
				t.Errorf("[%s/%s] capability missing createdAt", c.Category, c.Filename)
			}
		}

		switch c.Category {
		case "valid":
			nValid++
		case "invalid":
			nInvalid++
		}
	}

	if nValid == 0 {
		t.Error("corpus has no valid/ cases")
	}
	if nInvalid == 0 {
		t.Error("corpus has no invalid/ cases")
	}
	t.Logf("corpus: %d valid, %d invalid (%d total)", nValid, nInvalid, len(cases))
}
