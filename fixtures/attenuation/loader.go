// Package attenuation provides a language-neutral corpus loader for the
// shared attenuation fixture files used by SP-4b and its TS counterpart.
package attenuation

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

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

// fixtureDir returns the absolute path to the fixtures/attenuation directory,
// resolved relative to this source file so the caller's cwd is irrelevant.
func fixtureDir() string {
	_, file, _, _ := runtime.Caller(0)
	return filepath.Dir(file)
}

type caseFile struct {
	Parent CapabilityJSON `json:"parent"`
	Child  CapabilityJSON `json:"child"`
	Note   string         `json:"note"`
}

// LoadAttenuationCases reads all *.json files from the valid/ and invalid/
// sub-directories and returns them as a slice of Case values.
func LoadAttenuationCases() ([]Case, error) {
	root := fixtureDir()
	var cases []Case

	for _, cat := range []string{"valid", "invalid"} {
		dir := filepath.Join(root, cat)
		entries, err := os.ReadDir(dir)
		if err != nil {
			return nil, fmt.Errorf("reading %s: %w", dir, err)
		}
		for _, e := range entries {
			if e.IsDir() || filepath.Ext(e.Name()) != ".json" {
				continue
			}
			path := filepath.Join(dir, e.Name())
			data, err := os.ReadFile(path)
			if err != nil {
				return nil, fmt.Errorf("reading %s: %w", path, err)
			}
			var cf caseFile
			if err := json.Unmarshal(data, &cf); err != nil {
				return nil, fmt.Errorf("parsing %s: %w", path, err)
			}
			cases = append(cases, Case{
				Parent:   cf.Parent,
				Child:    cf.Child,
				Note:     cf.Note,
				Category: cat,
				Filename: e.Name(),
			})
		}
	}
	return cases, nil
}
