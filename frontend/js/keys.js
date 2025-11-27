/**
 * Key management module for generating, storing, and retrieving cryptographic keys.
 */

import * as jose from "jose"
import { renderKeys } from "./main.js"
import { uint8ToHex } from "./converters.js"
import { storage } from "./storage.js"
import { deepEqual } from "./helpers.js"
import logger from "./logger.js"

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
    await storage.setItem("keys", name, key)
}

export const deleteKey = async (name) => {
    await storage.deleteItem("keys", name)
}

export const getKey = async (name) => {
    return await storage.getItem("keys", name)
}

export const getKeys = async () => {
    const keys = await storage.get("keys")
    return keys
}

export const getNameFromPublicKey = async (publicKey) => {
    const keys = await getKeys()
    for (const [name, key] of Object.entries(keys)) {
        if (deepEqual(publicKey, key.publicKey)) {
            return name
        }
    }
    return undefined
}

export const getNameFromCredentialId = async (credentialId) => {
    const keys = await getKeys()
    for (const [name, key] of Object.entries(keys)) {
        if (key.credentialId === credentialId) {
            return name
        }
    }
    return undefined
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

export const clearKeys = async () => {
    await storage.set("keys", {})
    await renderKeys()
}

export const exportKeys = async () => {
    const keysData = await storage.get("keys")
    const dataStr = JSON.stringify(keysData || {}, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `passkey-keys-${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
}

export const importKeys = async (file) => {
    try {
        const text = await file.text()
        const importedData = JSON.parse(text)

        // Validate the imported data
        if (typeof importedData !== "object" || importedData === null) {
            throw new Error("Invalid keys format: expected an object")
        }

        // Get current keys to count overwrites
        const currentKeys = await storage.get("keys") || {}

        // Import each key individually using single-item operations
        const importedEntries = Object.entries(importedData)
        for (const [name, key] of importedEntries) {
            await storage.setItem("keys", name, key)
        }

        // Re-render the keys view
        await renderKeys()

        // Count how many keys were imported
        const importedCount = importedEntries.length
        const overwrittenCount = importedEntries.filter(([name]) => name in currentKeys).length
        const newCount = importedCount - overwrittenCount

        return {
            success: true,
            imported: importedCount,
            new: newCount,
            overwritten: overwrittenCount
        }
    } catch (error) {
        logger.error("Error importing keys:", error)
        return {
            success: false,
            error: error.message
        }
    }
}

// Set up event handlers when module loads
document.addEventListener("DOMContentLoaded", () => {
    const exportBtn = document.getElementById("exportKeysBtn")
    if (exportBtn) {
        exportBtn.addEventListener("click", exportKeys)
    }

    const clearBtn = document.getElementById("clearKeysBtn")
    if (clearBtn) {
        clearBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to clear all keys?")) {
                await clearKeys()
            }
        })
    }

    const importBtn = document.getElementById("importKeysBtn")
    if (importBtn) {
        importBtn.addEventListener("click", () => {
            const input = document.createElement("input")
            input.type = "file"
            input.accept = ".json"
            input.onchange = async (e) => {
                const file = e.target.files[0]
                if (file) {
                    const result = await importKeys(file)
                    if (result.success) {
                        alert(`Import successful!\n\nTotal keys: ${result.imported}\nNew keys: ${result.new}\nOverwritten: ${result.overwritten}`)
                    } else {
                        alert(`Import failed: ${result.error}`)
                    }
                }
            }
            input.click()
        })
    }
})
