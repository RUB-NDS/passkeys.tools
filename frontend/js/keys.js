import * as jose from "jose"
import { renderKeys } from "./main.js"
import { uint8ToHex } from "./converters.js"
import { storage } from "./storage.js"

export const algs = {"ES256": -7, "ES384": -35, "ES512": -36, "PS256": -37, "PS384": -38, "PS512": -39, "RS256": -257, "RS384": -258, "RS512": -259, "EdDSA": -8}

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

export const storeKey = async (name, key) => {
    const keys = await storage.get("keys")
    keys[name] = { ...keys[name], ...key }
    await storage.set("keys", keys)
}

export const deleteKey = async (name) => {
    const keys = await storage.get("keys")
    delete keys[name]
    await storage.set("keys", keys)
}

export const getKey = async (name) => {
    const keys = await getKeys()
    return keys[name]
}

export const getKeys = async () => {
    const keys = await storage.get("keys")
    return keys
}

export const getSupportedAlgorithm = (pubKeyCredParams) => {
    if (!pubKeyCredParams?.length) return "ES256"
    for (const param of pubKeyCredParams) {
        const algName = Object.keys(algs).find(key => algs[key] === param.alg)
        if (algName) return algName
    }
    return "ES256"
}

export const generateModeKeys = async (modes) => {
    const keys = await getKeys()
    let changed = false
    for (const mode of modes) {
        for (const alg of Object.keys(algs)) {
            const keyHandle = `${mode} | ${alg}`
            if (!keys[keyHandle]) {
                const key = await generateKey(alg)
                await storeKey(keyHandle, key)
                changed = true
            }
        }
    }
    if (changed) await renderKeys()
}
