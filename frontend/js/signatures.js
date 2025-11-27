/**
 * Signature signing and verification utilities for WebAuthn assertions.
 */

import * as format from "ecdsa-sig-formatter"
import { hexToUint8, uint8ToHex, concatUint8, jwkToCryptoKey, b64urlToUint8 } from "./converters.js"
import logger from "./logger.js"

const sign = async (jwk, payload) => {
    let algorithm
    if (jwk.kty === "RSA") {
        if (jwk.alg.startsWith("PS")) {
            const saltLengths = { "PS256": 32, "PS384": 48, "PS512": 64 }
            const saltLength = saltLengths[jwk.alg]
            if (!saltLength) {
                throw new Error(`Invalid salt length for jwk: ${jwk}`)
            }
            algorithm = { name: "RSA-PSS", saltLength: saltLength }
        } else {
            algorithm = { name: "RSASSA-PKCS1-v1_5" }
        }
    } else if (jwk.kty === "EC") {
        const algs = { "ES256": "SHA-256", "ES384": "SHA-384", "ES512": "SHA-512" }
        const hash = algs[jwk.alg]
        if (!hash) {
            throw new Error(`Invalid hash algorithm for jwk: ${jwk}`)
        }
        algorithm = { name: "ECDSA", hash: { name: hash } }
    } else if (jwk.kty === "OKP" && jwk.crv === "Ed25519") {
        algorithm = { name: "Ed25519" }
    }

    const cryptoKey = await jwkToCryptoKey(jwk, "sign")
    const signature = await window.crypto.subtle.sign(algorithm, cryptoKey, payload)

    if (jwk.kty === "EC") {
        const sig = format.joseToDer(Buffer.from(signature), jwk.alg)
        return sig
    } else {
        const sig = new Uint8Array(signature)
        return sig
    }
}

export const signAssertion = async (clientDataHash, authenticatorData, jwk) => {
    const clientDataHashUint8 = hexToUint8(clientDataHash)
    const authenticatorDataUint8 = hexToUint8(authenticatorData)

    const payload = concatUint8(authenticatorDataUint8, clientDataHashUint8)
    logger.debug("signAssertion payload:", uint8ToHex(payload))

    const signature = await sign(jwk, payload)
    logger.debug("signAssertion signature:", uint8ToHex(signature))

    return signature
}

const verify = async (jwk, payload, signature) => {
    let algorithm
    if (jwk.kty === "RSA") {
        if (jwk.alg.startsWith("PS")) {
            const saltLengths = { "PS256": 32, "PS384": 48, "PS512": 64 }
            const saltLength = saltLengths[jwk.alg]
            if (!saltLength) {
                throw new Error(`Invalid salt length for jwk: ${jwk}`)
            }
            algorithm = { name: "RSA-PSS", saltLength: saltLength }
        } else {
            algorithm = { name: "RSASSA-PKCS1-v1_5" }
        }
    } else if (jwk.kty === "EC") {
        const algs = { "ES256": "SHA-256", "ES384": "SHA-384", "ES512": "SHA-512" }
        const hash = algs[jwk.alg]
        if (!hash) {
            throw new Error(`Invalid hash algorithm for jwk: ${jwk}`)
        }
        algorithm = { name: "ECDSA", hash: { name: hash } }
    } else if (jwk.kty === "OKP" && jwk.crv === "Ed25519") {
        algorithm = { name: "Ed25519" }
    }

    let sig
    if (jwk.kty === "EC") {
        sig = b64urlToUint8(format.derToJose(Buffer.from(signature), jwk.alg))
    } else {
        sig = signature
    }

    const cryptoKey = await jwkToCryptoKey(jwk, "verify")
    const valid = await window.crypto.subtle.verify(algorithm, cryptoKey, sig, payload)

    return valid
}

export const verifyAssertion = async (clientDataHash, authenticatorData, signature, jwk) => {
    const clientDataHashUint8 = hexToUint8(clientDataHash)
    const authenticatorDataUint8 = hexToUint8(authenticatorData)
    const signatureUint8 = hexToUint8(signature)
    logger.debug("verifyAssertion signature:", uint8ToHex(signatureUint8))

    const payload = concatUint8(authenticatorDataUint8, clientDataHashUint8)
    logger.debug("verifyAssertion payload:", uint8ToHex(payload))

    const valid = await verify(jwk, payload, signatureUint8)
    logger.debug("verifyAssertion result:", valid)

    return valid
}
