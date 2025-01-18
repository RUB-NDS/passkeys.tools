
// https://w3c.github.io/webauthn/#client-data
// https://w3c.github.io/webauthn/#clientdatajson-serialization
export const clientDataJSONSchema = {
    "type": "object",
    "required": true,
    "additionalProperties": true,
    "properties": {
        "type": {
            "type": "string",
            "required": true,
            "propertyOrder": 1
        },
        "challenge": {
            "type": "string",
            "required": true,
            "propertyOrder": 2
        },
        "origin": {
            "type": "string",
            "required": true,
            "propertyOrder": 3
        },
        "crossOrigin": {
            "type": "boolean",
            "required": true,
            "default": false,
            "propertyOrder": 4
        },
        "topOrigin": {
            "type": "string",
            "required": false,
            "propertyOrder": 5
        },
    },
}

// https://w3c.github.io/webauthn/#authenticator-data
export const authenticatorDataSchema = {
    "type": "object",
    "required": true,
    "additionalProperties": false,
    "properties": {
        "rpIdHash": {
            "type": "string",
            "required": true
        },
        "flags": {
            "type": "object",
            "required": true,
            "additionalProperties": false,
            "properties": {
                "up": {
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "rfu1": {
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "uv": {
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "be": {
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "bs": {
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "rfu2": {
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "at": {
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "ed": {
                    "type": "boolean",
                    "required": true,
                    "default": false
                }
            }
        },
        "signCount": {
            "type": "string",
            "required": true
        },
        "attestedCredentialData": {
            "type": "object",
            "required": false,
            "additionalProperties": false,
            "properties": {
                "aaguid": {
                    "type": "string",
                    "required": true
                },
                "credentialIdLength": {
                    "type": "string",
                    "required": true
                },
                "credentialId": {
                    "type": "string",
                    "required": true
                },
                "credentialPublicKey": {
                    "type": "object",
                    "required": true,
                    "additionalProperties": true,
                    "properties": {},
                }
            }
        },
        "extensions": {
            "type": "string",
            "required": false
        }
    }
}

// https://www.w3.org/TR/webauthn-2/#sctn-none-attestation
export const attestationStatementNoneSchema = {
    "type": "object",
    "required": true,
    "additionalProperties": false,
    "properties": {}
}

// https://www.w3.org/TR/webauthn-2/#sctn-packed-attestation
export const attestationStatementPackedSchema = {
    "type": "object",
    "required": true,
    "additionalProperties": false,
    "properties": {
        "alg": {
            "type": "str",
            "required": true
        },
        "sig": {
            "type": "str",
            "required": true
        },
        "x5c": {
            "type": "array",
            "required": false,
            "items": {
                "type": "str",
                "required": true
            }
        }
    }
}

// https://w3c.github.io/webauthn/#attestation-object
// https://www.iana.org/assignments/webauthn/webauthn.xhtml#webauthn-attestation-statement-format-ids
// ["packed", "tpm", "android-key", "android-safetynet", "fido-u2f", "apple", "none"]
export const attestationObjectSchema = {
    oneOf: [
        // fmt: none
        {
            "title": "none",
            "type": "object",
            "required": true,
            "additionalProperties": false,
            "properties": {
                "fmt": {
                    "type": "string",
                    "required": true,
                    "enum": ["none"]
                },
                "attStmt": attestationStatementNoneSchema,
                "authData": authenticatorDataSchema
            }
        },
        // fmt: packed
        {
            "title": "packed",
            "type": "object",
            "required": true,
            "additionalProperties": false,
            "properties": {
                "fmt": {
                    "type": "string",
                    "required": true,
                    "enum": ["packed"]
                },
                "attStmt": attestationStatementPackedSchema,
                "authData": authenticatorDataSchema
            }
        }
    ]
}
