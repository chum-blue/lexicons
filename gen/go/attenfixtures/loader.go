// Package attenfixtures provides a corpus loader for the shared attenuation
// fixture files used by SP-4b and language-neutral tests. The JSON files are
// embedded at compile time so external consumers (installed via the module
// cache) work without access to the original source tree.
package attenfixtures

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
)

//go:embed valid/*.json invalid/*.json
var corpus embed.FS

// ScopeJSON mirrors a single scope entry from the fixture JSON files.
type ScopeJSON struct {
	Bucket    string   `json:"bucket"`
	KeyPrefix *string  `json:"keyPrefix,omitempty"`
	Can       []string `json:"can"`
}

// CapabilityJSON is the JSON shape of a capability in a fixture file.
type CapabilityJSON struct {
	Iss       string      `json:"iss"`
	Aud       string      `json:"aud"`
	Scope     []ScopeJSON `json:"scope"`
	ExpiresAt string      `json:"expiresAt"`
	Nonce     string      `json:"nonce"`
	CreatedAt string      `json:"createdAt"`
}

// Case is one fixture: a parent capability, a child capability, a human note,
// and whether the file was found under valid/ or invalid/.
type Case struct {
	Parent   CapabilityJSON
	Child    CapabilityJSON
	Note     string
	Category string // "valid" or "invalid"
	Filename string
}

type caseFile struct {
	Parent CapabilityJSON `json:"parent"`
	Child  CapabilityJSON `json:"child"`
	Note   string         `json:"note"`
}

// LoadAttenuationCases reads all *.json files from the embedded valid/ and
// invalid/ sub-directories and returns them as a slice of Case values.
func LoadAttenuationCases() ([]Case, error) {
	var cases []Case

	for _, cat := range []string{"valid", "invalid"} {
		entries, err := fs.ReadDir(corpus, cat)
		if err != nil {
			return nil, fmt.Errorf("reading embedded %s: %w", cat, err)
		}
		for _, e := range entries {
			if e.IsDir() {
				continue
			}
			name := e.Name()
			if len(name) < 5 || name[len(name)-5:] != ".json" {
				continue
			}
			data, err := corpus.ReadFile(cat + "/" + name)
			if err != nil {
				return nil, fmt.Errorf("reading embedded %s/%s: %w", cat, name, err)
			}
			var cf caseFile
			if err := json.Unmarshal(data, &cf); err != nil {
				return nil, fmt.Errorf("parsing %s/%s: %w", cat, name, err)
			}
			cases = append(cases, Case{
				Parent:   cf.Parent,
				Child:    cf.Child,
				Note:     cf.Note,
				Category: cat,
				Filename: name,
			})
		}
	}
	return cases, nil
}
