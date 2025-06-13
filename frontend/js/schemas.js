
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
            "required": false,
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
export const attestationAuthenticatorDataSchema = {
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
                "up": { // User Present
                    "type": "boolean",
                    "required": true,
                    "default": true
                },
                "rfu1": { // Reserved for Future Use
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "uv": { // User Verified
                    "type": "boolean",
                    "required": true,
                    "default": true
                },
                "be": { // Backup Eligibility
                    "type": "boolean",
                    "required": true,
                    "default": true
                },
                "bs": { // Backup State
                    "type": "boolean",
                    "required": true,
                    "default": true
                },
                "rfu2": { // Reserved for Future Use
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "at": { // Attested Credential Data Included
                    "type": "boolean",
                    "required": true,
                    "default": true
                },
                "ed": { // Extension Data Included
                    "type": "boolean",
                    "required": true,
                    "default": false
                }
            }
        },
        "signCount": {
            "type": "number",
            "required": true,
            "default": 0
        },
        "attestedCredentialData": {
            "type": "object",
            "required": true,
            "additionalProperties": false,
            "properties": {
                "aaguid": {
                    "type": "string",
                    "required": true
                },
                "credentialIdLength": {
                    "type": "number",
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

// https://w3c.github.io/webauthn/#authenticator-data
export const assertionAuthenticatorDataSchema = {
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
                "up": { // User Present
                    "type": "boolean",
                    "required": true,
                    "default": true
                },
                "rfu1": { // Reserved for Future Use
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "uv": { // User Verified
                    "type": "boolean",
                    "required": true,
                    "default": true
                },
                "be": { // Backup Eligibility
                    "type": "boolean",
                    "required": true,
                    "default": true
                },
                "bs": { // Backup State
                    "type": "boolean",
                    "required": true,
                    "default": true
                },
                "rfu2": { // Reserved for Future Use
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "at": { // Attested Credential Data Included
                    "type": "boolean",
                    "required": true,
                    "default": false
                },
                "ed": { // Extension Data Included
                    "type": "boolean",
                    "required": true,
                    "default": false
                }
            }
        },
        "signCount": {
            "type": "number",
            "required": true,
            "default": 0
        },
        "extensions": {
            "type": "string",
            "required": false
        }
    }
}

// https://www.w3.org/TR/webauthn-2/#sctn-none-attestation
const attestationStatementNoneSchema = {
    "type": "object",
    "required": true,
    "additionalProperties": false,
    "properties": {}
}

// https://www.w3.org/TR/webauthn-2/#sctn-packed-attestation
const attestationStatementPackedSchema = {
    "type": "object",
    "required": true,
    "additionalProperties": false,
    "properties": {
        "alg": {
            "type": "number",
            "required": true,
            "description": "RS256 (-257), RS384 (-258), RS512 (-259), ES256 (-7), ES384 (-35), ES512 (-36), PS256 (-37), PS384 (-38), PS512 (-39), EdDSA (-8)"
        },
        "sig": {
            "type": "string",
            "required": true
        },
        "x5c": {
            "type": "array",
            "required": false,
            "items": {
                "type": "string",
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
                "authData": attestationAuthenticatorDataSchema
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
                "authData": attestationAuthenticatorDataSchema
            }
        }
    ]
}

// https://datatracker.ietf.org/doc/html/rfc7517
export const jwkSchema = {
    "type": "object",
    "required": true,
    "additionalProperties": true,
    "properties": {}
}

// https://w3c.github.io/webauthn/#dictionary-makecredentialoptions
export const createSchema = {
    "type": "object",
    "required": true,
    "additionalProperties": false,
    "properties": {
        "rp": {
            "type": "object",
            "required": true,
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string",
                    "required": true,
                    "default": "Passkey Workbench"
                },
                "id": {
                    "type": "string",
                    "required": false,
                    "default": `${location.hostname}`
                }
            }
        },
        "user": {
            "type": "object",
            "required": true,
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string",
                    "required": true,
                    "default": "alice@example.com"
                },
                "displayName": {
                    "type": "string",
                    "required": true,
                    "default": "Alice Allison"
                },
                "id": {
                    "type": "string", // base64url, max 64 bytes
                    "required": true,
                    "default": "AQIDBA"
                }
            }
        },
        "challenge": {
            "type": "string", // base64url
            "required": true,
            "default": "qrvM3Q"
        },
        "pubKeyCredParams": {
            "type": "array",
            "required": true,
            "items": {
                "type": "object",
                "required": true,
                "additionalProperties": false,
                "properties": {
                    "type": {
                        "type": "string",
                        "required": true,
                        "default": "public-key"
                    },
                    "alg": {
                        "type": "number",
                        "required": true,
                        "description": "RS256 (-257), RS384 (-258), RS512 (-259), ES256 (-7), ES384 (-35), ES512 (-36), PS256 (-37), PS384 (-38), PS512 (-39), EdDSA (-8)",
                        "default": -7
                    }
                }
            },
        },
        "timeout": {
            "type": "number",
            "required": false,
            "default": 300000 // 5 min
        },
        "excludeCredentials": {
            "type": "array",
            "required": false,
            "default": [],
            "items": {
                "type": "object",
                "required": true,
                "additionalProperties": false,
                "properties": {
                    "type": {
                        "type": "string",
                        "required": true,
                        "default": "public-key"
                    },
                    "id": {
                        "type": "string", // base64url
                        "required": true
                    },
                    "transports": {
                        "type": "array",
                        "required": false,
                        "items": {
                            "type": "string",
                            "required": true,
                            "enum": ["usb", "nfc", "ble", "smart-card", "hybrid", "internal"]
                        }
                    }
                }
            }
        },
        "authenticatorSelection": {
            "type": "object",
            "required": false,
            "additionalProperties": false,
            "properties": {
                "authenticatorAttachment": {
                    "type": "string",
                    "required": false,
                    "enum": ["platform", "cross-platform"]
                },
                "residentKey": {
                    "type": "string",
                    "required": false,
                    "enum": ["required", "preferred", "discouraged"]
                },
                "requireResidentKey": {
                    "type": "boolean", // should be true only if required
                    "required": false,
                    "default": false
                },
                "userVerification": {
                    "type": "string",
                    "required": false,
                    "default": "preferred",
                    "enum": ["required", "preferred", "discouraged"]
                }
            }
        },
        "hints": {
            "type": "array",
            "required": false,
            "default": [],
            "items": {
                "type": "string",
                "required": true,
                "enum": ["security-key", "client-device", "hybrid"]
            },
        },
        "attestation": {
            "type": "string",
            "required": false,
            "default": "none",
            "enum": ["none", "indirect", "direct", "enterprise"]
        },
        "attestationFormats": {
            "type": "array",
            "required": false,
            "default": [],
            "items": {
                "type": "string",
                "required": true,
                "enum": ["none", "packed", "tpm", "android-key", "android-safetynet", "fido-u2f", "apple"]
            }
        },
        "extensions": {
            "type": "object",
            "required": false,
            "additionalProperties": true,
            "properties": {}
        }
    }
}

// https://w3c.github.io/webauthn/#dictionary-assertion-options
export const getSchema = {
    "type": "object",
    "required": true,
    "additionalProperties": false,
    "properties": {
        "challenge": {
            "type": "string", // base64url
            "required": true,
            "default": "qrvM3Q"
        },
        "timeout": {
            "type": "number",
            "required": false,
            "default": 300000 // 5 min
        },
        "rpId": {
            "type": "string",
            "required": false,
            "default": `${location.hostname}`
        },
        "allowCredentials": {
            "type": "array",
            "required": false,
            "default": [],
            "items": {
                "type": "object",
                "required": true,
                "additionalProperties": false,
                "properties": {
                    "type": {
                        "type": "string",
                        "required": true,
                        "default": "public-key"
                    },
                    "id": {
                        "type": "string", // base64url
                        "required": true
                    },
                    "transports": {
                        "type": "array",
                        "required": false,
                        "items": {
                            "type": "string",
                            "required": true,
                            "enum": ["usb", "nfc", "ble", "smart-card", "hybrid", "internal"]
                        }
                    }
                }
            }
        },
        "userVerification": {
            "type": "string",
            "required": false,
            "default": "preferred",
            "enum": ["required", "preferred", "discouraged"]
        },
        "hints": {
            "type": "array",
            "required": false,
            "default": [],
            "items": {
                "type": "string",
                "required": true,
                "enum": ["security-key", "client-device", "hybrid"]
            },
        },
        "extensions": {
            "type": "object",
            "required": false,
            "additionalProperties": true,
            "properties": {}
        }
    }
}

// https://www.w3.org/TR/credential-management-1/#mediation-requirements
export const mediationSchema = {
    "type": "string",
    "required": false,
    "default": "",
    "enum": ["", "silent", "optional", "conditional", "required"]
}
