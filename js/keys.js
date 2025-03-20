import * as jose from "jose"
import { uint8ToHex } from "./converters.js"

export const algs = ["ES256", "ES384", "ES512", "PS256", "PS384", "PS512", "RS256", "RS384", "RS512", "EdDSA"]

export const generateKey = async (alg) => {
    const credentialId = new Uint8Array(32)
    crypto.getRandomValues(credentialId)

    const { publicKey, privateKey } = await jose.generateKeyPair(alg, {extractable: true})
    const publicKeyJwk = await jose.exportJWK(publicKey)
    const privateKeyJwk = await jose.exportJWK(privateKey)

    return {
        credentialId: uint8ToHex(credentialId),
        publicKey: {alg, ...publicKeyJwk},
        privateKey: {alg, ...privateKeyJwk}
    }
}

export const storeKey = (name, key) => {
    const keys = JSON.parse(localStorage.getItem("keys") || "{}")
    keys[name] = { ...keys[name], ...key }
    localStorage.setItem("keys", JSON.stringify(keys))
}

export const deleteKey = (name) => {
    const keys = JSON.parse(localStorage.getItem("keys") || "{}")
    delete keys[name]
    localStorage.setItem("keys", JSON.stringify(keys))
}

export const getKey = (name) => {
    return getKeys()[name]
}

export const getKeys = () => {
    const keys = JSON.parse(localStorage.getItem("keys") || "{}")
    return keys
}
