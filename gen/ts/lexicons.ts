/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  type LexiconDoc,
  Lexicons,
  ValidationError,
  type ValidationResult,
} from '@atproto/lexicon'
import { type $Typed, is$typed, maybe$typed } from './util.js'

export const schemaDict = {
  BlueChumAuthCapability: {
    lexicon: 1,
    id: 'blue.chum.auth.capability',
    defs: {
      main: {
        type: 'record',
        key: 'tid',
        description:
          "A signed capability delegation. The issuer (iss) grants the audience (aud) the attenuated scope until expiresAt. The record's canonical DAG-CBOR is signed by the issuer's did:key via the Signer seam (detached signature, as with blue.chum.pointer.record). prev links the parent capability when this record attenuates an existing delegation chain.",
        record: {
          type: 'object',
          required: ['iss', 'aud', 'scope', 'expiresAt', 'nonce', 'createdAt'],
          properties: {
            iss: {
              type: 'string',
              format: 'did',
              description: 'Issuer/owner DID; signs this record.',
            },
            aud: {
              type: 'string',
              format: 'did',
              description: 'Delegate DID this capability is granted to.',
            },
            scope: {
              type: 'array',
              minLength: 1,
              items: {
                type: 'ref',
                ref: 'lex:blue.chum.auth.capability#capabilityScope',
              },
              description:
                'One or more attenuations. Authority is the union of the entries.',
            },
            prev: {
              type: 'cid-link',
              description:
                'Parent capability CID; null/absent at the chain root.',
            },
            notBefore: {
              type: 'string',
              format: 'datetime',
            },
            expiresAt: {
              type: 'string',
              format: 'datetime',
            },
            nonce: {
              type: 'string',
              minLength: 1,
              description:
                'Distinguishes otherwise-identical grants so each has a distinct CID.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
            },
          },
        },
      },
      capabilityScope: {
        type: 'object',
        description:
          'A UCAN-style with/can attenuation: the abilities (can) granted over a resource (bucket, optionally narrowed by keyPrefix).',
        required: ['bucket', 'can'],
        properties: {
          bucket: {
            type: 'string',
          },
          keyPrefix: {
            type: 'string',
            description:
              'Absent/empty = whole bucket; otherwise restricts to keys under this prefix.',
          },
          can: {
            type: 'array',
            minLength: 1,
            items: {
              type: 'string',
              knownValues: ['read', 'write', 'delete'],
            },
          },
        },
      },
    },
  },
  BlueChumAuthListCapabilities: {
    lexicon: 1,
    id: 'blue.chum.auth.listCapabilities',
    defs: {
      main: {
        type: 'query',
        description: 'List capabilities by issuer or audience DID.',
        parameters: {
          type: 'params',
          required: ['did'],
          properties: {
            did: {
              type: 'string',
              format: 'did',
            },
            role: {
              type: 'string',
              knownValues: ['issuer', 'audience'],
              default: 'audience',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 50,
            },
            cursor: {
              type: 'string',
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['capabilities'],
            properties: {
              cursor: {
                type: 'string',
              },
              capabilities: {
                type: 'array',
                items: {
                  type: 'ref',
                  ref: 'lex:blue.chum.auth.listCapabilities#capabilityView',
                },
              },
            },
          },
        },
      },
      capabilityView: {
        type: 'object',
        required: ['uri', 'cid', 'value'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          revoked: {
            type: 'boolean',
          },
          value: {
            type: 'ref',
            ref: 'lex:blue.chum.auth.capability',
          },
        },
      },
    },
  },
  BlueChumAuthRevocation: {
    lexicon: 1,
    id: 'blue.chum.auth.revocation',
    defs: {
      main: {
        type: 'record',
        key: 'tid',
        description:
          "Revokes the referenced capability. Signed (detached) by a DID in the capability's issuer chain (the issuer or any ancestor issuer). Authority to revoke is verified in SP-4b against the chain; the lexicon only carries the reference.",
        record: {
          type: 'object',
          required: ['capability', 'createdAt'],
          properties: {
            capability: {
              type: 'cid-link',
              description:
                'CID of the blue.chum.auth.capability being revoked.',
            },
            reason: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
            },
          },
        },
      },
    },
  },
  BlueChumObjectHead: {
    lexicon: 1,
    id: 'blue.chum.object.head',
    defs: {
      main: {
        type: 'query',
        description:
          'Resolve a name to current metadata without returning bytes.',
        parameters: {
          type: 'params',
          required: ['bucket', 'key'],
          properties: {
            bucket: {
              type: 'string',
            },
            key: {
              type: 'string',
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['cid', 'recordCid', 'size'],
            properties: {
              cid: {
                type: 'string',
              },
              recordCid: {
                type: 'string',
              },
              contentType: {
                type: 'string',
              },
              size: {
                type: 'integer',
              },
              visibility: {
                type: 'string',
                enum: ['public', 'private'],
              },
            },
          },
        },
      },
    },
  },
  BlueChumObjectHistory: {
    lexicon: 1,
    id: 'blue.chum.object.history',
    defs: {
      main: {
        type: 'query',
        description:
          'Return the full signed mutation chain for a name, oldest-first, as verifiable proof material rather than as pre-decoded fields.',
        parameters: {
          type: 'params',
          required: ['bucket', 'key'],
          properties: {
            bucket: {
              type: 'string',
            },
            key: {
              type: 'string',
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['records'],
            properties: {
              records: {
                type: 'array',
                items: {
                  type: 'ref',
                  ref: 'lex:blue.chum.object.history#historyEntry',
                },
              },
            },
          },
        },
      },
      historyEntry: {
        type: 'object',
        description:
          "One record in the chain, as proof material. unsignedBytes is the record's canonical DAG-CBOR preimage — the exact bytes recordCid addresses and sig commits to — and is the ONLY trust input: a verifier hashes it to check recordCid, verifies sig over it, and DECODES it for every other field (cid, prev, did, createdAt, tier, writerDid, ...). Those fields are deliberately not sent alongside the bytes, because a field sent twice is a field that can disagree with itself.",
        required: ['recordCid', 'sig', 'unsignedBytes'],
        properties: {
          recordCid: {
            type: 'string',
            description:
              'CIDv1/dag-cbor/sha-256 of unsignedBytes. The verifier recomputes this rather than trusting it.',
          },
          sig: {
            type: 'string',
            description:
              "Detached signature over unsignedBytes by the record's did. Base64 (RFC 4648 standard alphabet, padded).",
          },
          unsignedBytes: {
            type: 'string',
            description:
              "The record's canonical DAG-CBOR bytes. Base64 (RFC 4648 standard alphabet, padded). Decode with blue.chum.pointer.record.",
          },
        },
      },
    },
  },
  BlueChumObjectList: {
    lexicon: 1,
    id: 'blue.chum.object.list',
    defs: {
      main: {
        type: 'query',
        description: 'Enumerate keys in a bucket under a prefix.',
        parameters: {
          type: 'params',
          required: ['bucket'],
          properties: {
            bucket: {
              type: 'string',
            },
            prefix: {
              type: 'string',
            },
            cursor: {
              type: 'string',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 1000,
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['keys'],
            properties: {
              keys: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              cursor: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
  BlueChumPointerRecord: {
    lexicon: 1,
    id: 'blue.chum.pointer.record',
    defs: {
      main: {
        type: 'record',
        key: 'tid',
        description:
          "One link in a name's signed mutation chain. The record's canonical DAG-CBOR bytes are addressed by its RecordCID (CIDv1/dag-cbor/sha-256) and signed by the owner's did:key; prev links to the previous record's RecordCID (null at the chain head). All six of assembled/capCid/intentCid/tier/writerDid/writerSig are OPTIONAL and omitted-when-empty: their absence is what makes a pre-SP-4e record still hash to its original RecordCID. tier, writerDid and writerSig are what a verifier reads to GRADE the chain (ADR-0008), not merely to accept it.",
        record: {
          type: 'object',
          required: [
            'bucket',
            'key',
            'cid',
            'did',
            'contentType',
            'size',
            'visibility',
            'tombstone',
            'createdAt',
          ],
          properties: {
            bucket: {
              type: 'string',
            },
            key: {
              type: 'string',
            },
            cid: {
              type: 'cid-link',
            },
            prev: {
              type: 'cid-link',
            },
            did: {
              type: 'string',
              format: 'did',
              description:
                'The DID that SEQUENCED this write — the operator. See writerDid for the DID that AUTHORISED it.',
            },
            contentType: {
              type: 'string',
            },
            size: {
              type: 'integer',
            },
            visibility: {
              type: 'string',
              enum: ['public', 'private'],
            },
            tombstone: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
            },
            assembled: {
              type: 'boolean',
              description:
                'True when cid addresses a multipart manifest rather than raw bytes. Omitted when false.',
            },
            capCid: {
              type: 'string',
              description:
                'CID of the capability that authorised writerDid. Omitted on a legacy record.',
            },
            intentCid: {
              type: 'string',
              description:
                "CID of the write intent's canonical bytes. Omitted on a legacy record.",
            },
            tier: {
              type: 'integer',
              description:
                "ADR-0008 trust tier, stating WHOSE key signed this record. Tiers count DOWN: 1 (self-custody: did:key/did:web, no operator ever holds the key) is strongest, 2 (registered: did:plc with a user-held rotation key), 3 (legacy: operator-signed). OMITTED on a legacy record — absence MUST be read as Tier 3, not as 0: writing 3 into the bytes would change every pre-SP-4e record's RecordCID. A verifier that compares tiers numerically must map absent -> 3 BEFORE comparing.",
            },
            writerDid: {
              type: 'string',
              description:
                'The DID that AUTHORISED this write. Omitted on a legacy record, where did (the operator) is the only signer — which is what tier then reports.',
            },
            writerSig: {
              type: 'bytes',
              description:
                "Detached signature by writerDid over the write intent's canonical bytes. Omitted on a legacy record.",
            },
          },
        },
      },
    },
  },
  BlueChumUploadAbort: {
    lexicon: 1,
    id: 'blue.chum.upload.abort',
    defs: {
      main: {
        type: 'procedure',
        description:
          'Abort an open upload session. The session is marked for reclamation; its parts are reclaimed by the reaper session-sweep when no other object references them. Deletes no bytes directly.',
        input: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['uploadId'],
            properties: {
              uploadId: {
                type: 'string',
              },
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['aborted'],
            properties: {
              aborted: {
                type: 'boolean',
              },
            },
          },
        },
      },
    },
  },
  BlueChumUploadComplete: {
    lexicon: 1,
    id: 'blue.chum.upload.complete',
    defs: {
      main: {
        type: 'procedure',
        description:
          "Assemble an open upload session's ordered parts into a signed manifest and append it to the name's chain as an assembled pointer record. Returns the manifest CID (the object's Merkle root) and the new record CID.",
        input: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['uploadId'],
            properties: {
              uploadId: {
                type: 'string',
              },
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['cid', 'recordCid'],
            properties: {
              cid: {
                type: 'string',
              },
              recordCid: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
  BlueChumUploadCreate: {
    lexicon: 1,
    id: 'blue.chum.upload.create',
    defs: {
      main: {
        type: 'procedure',
        description:
          "Open a multipart upload session for a bucket/key. Parts are streamed to the data plane at PUT /uploads/{uploadId}/parts/{n}; upload.complete assembles them into a signed manifest whose CID is the object's Merkle root.",
        input: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['bucket', 'key'],
            properties: {
              bucket: {
                type: 'string',
              },
              key: {
                type: 'string',
              },
              contentType: {
                type: 'string',
              },
              visibility: {
                type: 'string',
                enum: ['public', 'private'],
              },
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['uploadId'],
            properties: {
              uploadId: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>
export const schemas = Object.values(schemaDict) satisfies LexiconDoc[]
export const lexicons: Lexicons = new Lexicons(schemas)

export function validate<T extends { $type: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType: true,
): ValidationResult<T>
export function validate<T extends { $type?: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: false,
): ValidationResult<T>
export function validate(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: boolean,
): ValidationResult {
  return (requiredType ? is$typed : maybe$typed)(v, id, hash)
    ? lexicons.validate(`${id}#${hash}`, v)
    : {
        success: false,
        error: new ValidationError(
          `Must be an object with "${hash === 'main' ? id : `${id}#${hash}`}" $type property`,
        ),
      }
}

export const ids = {
  BlueChumAuthCapability: 'blue.chum.auth.capability',
  BlueChumAuthListCapabilities: 'blue.chum.auth.listCapabilities',
  BlueChumAuthRevocation: 'blue.chum.auth.revocation',
  BlueChumObjectHead: 'blue.chum.object.head',
  BlueChumObjectHistory: 'blue.chum.object.history',
  BlueChumObjectList: 'blue.chum.object.list',
  BlueChumPointerRecord: 'blue.chum.pointer.record',
  BlueChumUploadAbort: 'blue.chum.upload.abort',
  BlueChumUploadComplete: 'blue.chum.upload.complete',
  BlueChumUploadCreate: 'blue.chum.upload.create',
} as const
