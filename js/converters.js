import cosekey from "./parse-cosekey"

export const b64urlToUint8 = (b64url) => {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/")
    const bin = atob(b64)
    const uint8 = new Uint8Array(bin.split("").map(c => c.charCodeAt(0)))
    return uint8
}

export const b64ToUint8 = (b64) => {
    const bin = atob(b64)
    const uint8 = new Uint8Array(bin.split("").map(c => c.charCodeAt(0)))
    return uint8
}

export const b64urlToHex = (b64url) => {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/")
    const bin = atob(b64)
    const hex = Array.from(bin).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    return hex
}

export const b64urlToStr = (b64url) => {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/")
    const bin = atob(b64)
    const str = Array.from(bin).map(c => String.fromCharCode(c.charCodeAt(0))).join("")
    return str
}

export const b64urlToB64 = (b64url) => {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/")
    const padding = "=".repeat((4 - b64.length % 4) % 4)
    const b64WithPadding = b64 + padding
    return b64WithPadding
}

export const hexToStr = (hex) => {
    const bin = hex.match(/.{2}/g).map(c => String.fromCharCode(parseInt(c, 16))).join("")
    return bin
}

export const strToHex = (str) => {
    const hex = Array.from(str).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    return hex
}

export const hexToB64url = (hex) => {
    const bin = hex.match(/.{2}/g).map(c => String.fromCharCode(parseInt(c, 16))).join("")
    const b64 = btoa(bin)
    const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    return b64url
}

export const hexToB64 = (hex) => {
    const bin = hex.match(/.{2}/g).map(c => String.fromCharCode(parseInt(c, 16))).join("")
    const b64 = btoa(bin)
    return b64
}

export const hexToUint8 = (hex) => {
    const uint8 = new Uint8Array(hex.match(/.{2}/g).map(c => parseInt(c, 16)))
    return uint8
}

export const uint8ToHex = (uint8) => {
    return Array.from(uint8).map(c => c.toString(16).padStart(2, "0")).join("")
}

export const uint8ToB64url = (uint8) => {
    const bin = Array.from(uint8).map(c => String.fromCharCode(c)).join("")
    const b64 = btoa(bin)
    const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    return b64url
}

export const uint8ToB64 = (uint8) => {
    const bin = Array.from(uint8).map(c => String.fromCharCode(c)).join("")
    const b64 = btoa(bin)
    return b64
}

export const uint8ToInt = (uint8) => {
    let int = 0
    for (let i = 0; i < uint8.length; i++) {
        int = (int << 8) | uint8[i]
    }
    return int
}

export const strToB64url = (str) => {
    const b64 = btoa(str)
    const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    return b64url
}

export const strToB64 = (str) => {
    const b64 = btoa(str)
    return b64
}

export const intToHex = (int, octets) => {
    let hex = int.toString(16)
    if (hex.length < octets * 2) {
        hex = hex.padStart(octets * 2, "0")
    } else if (hex.length % 2 !== 0) {
        hex = hex.padStart(hex.length + 1, "0")
    }
    return hex
}

export const b64ToB64url = (b64) => {
    const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    return b64url
}

export const b64ToStr = (b64) => {
    const bin = atob(b64)
    const str = Array.from(bin).map(c => String.fromCharCode(c.charCodeAt(0))).join("")
    return str
}

export const b64ToHex = (b64) => {
    const bin = atob(b64)
    const hex = Array.from(bin).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    return hex
}

export const uint8MapToBufferMap = (uint8Map) => {
    const bufferMap = new Map()
    for (const [k, v] of uint8Map.entries()) {
        if (v instanceof Uint8Array) {
            bufferMap.set(k, Buffer.from(v))
        } else {
            bufferMap.set(k, v)
        }
    }
    return bufferMap
}

export const coseToJwk = (cose) => {
    const map = uint8MapToBufferMap(cose)
    const jwk = cosekey.KeyParser.cose2jwk(map)
    return jwk
}

export const jwkToCose = (jwk) => {
    const cose = cosekey.KeyParser.jwk2cose(jwk)
    return cose
}

export const jwkToPem = async (jwk) => {
    const pem = await cosekey.KeyParser.jwk2pem({...jwk, "ext": true})
    return pem
}

export const pemToJwk = async (pem) => {
    const jwk = await cosekey.KeyParser.pem2jwk(pem)
    return jwk
}

export const jwkToCryptoKey = async (jwk, usage) => {
    const rsaHashAlgorithms = {
        "RS256": "SHA-256", "PS256": "SHA-256",
        "RS384": "SHA-384", "PS384": "SHA-384",
        "RS512": "SHA-512", "PS512": "SHA-512",
    }

    let algorithm
    if (jwk.kty === "RSA") {
        const hash = rsaHashAlgorithms[jwk.alg]
        if (!hash) {
            throw new Error(`Invalid hash algorithm for jwk: ${jwk}`)
        }
        algorithm = {
            name: jwk.alg.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", // RSASSA-PKCS1-v1_5, RSA-PSS, or RSA-OAEP
            hash: { name: hash } // SHA-256, SHA-384, or SHA-512
        }
    } else if (jwk.kty === "EC") {
        algorithm = {
            name: "ECDSA", // ECDSA or ECDH
            namedCurve: jwk.crv // P-256, P-384, P-521
        }
    } else if (jwk.kty === "OKP" && jwk.crv === "Ed25519") {
        algorithm = {
            name: "Ed25519"
        }
    } else {
        throw new Error(`Invalid key type: ${jwk.kty}`)
    }

    const key = await window.crypto.subtle.importKey(
        "jwk", // JSON Web Key format
        jwk, // JSONWebKey object
        algorithm,
        true, // extractable
        [usage] // keyUsages: sign, verify
    )

    return key
}

export const strSha256Uint8 = async (str) => {
    const msg = new TextEncoder().encode(str)
    const hash = await window.crypto.subtle.digest("SHA-256", msg)
    return new Uint8Array(hash)
}

export const concatUint8 = (buff1, buff2) => {
    const buff = new Uint8Array(buff1.length + buff2.length)
    buff.set(buff1, 0)
    buff.set(buff2, buff1.length)
    return buff
}

export const parsePublicKeyCredentialCreationOptions = (obj) => {
    const publicKeyCredentialCreationOptions = structuredClone(obj)
    publicKeyCredentialCreationOptions.user.id = hexToUint8(publicKeyCredentialCreationOptions.user.id)
    publicKeyCredentialCreationOptions.challenge = hexToUint8(publicKeyCredentialCreationOptions.challenge)
    for (const excludeCredential of publicKeyCredentialCreationOptions.excludeCredentials) {
        excludeCredential.id = hexToUint8(excludeCredential.id)
    }
    return publicKeyCredentialCreationOptions
}

export const parsePublicKeyCredentialRequestOptions = (obj) => {
    const publicKeyCredentialRequestOptions = structuredClone(obj)
    publicKeyCredentialRequestOptions.challenge = hexToUint8(publicKeyCredentialRequestOptions.challenge)
    for (const allowCredential of publicKeyCredentialRequestOptions.allowCredentials) {
        allowCredential.id = hexToUint8(allowCredential.id)
    }
    return publicKeyCredentialRequestOptions
}
