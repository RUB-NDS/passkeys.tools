import * as jose from "jose"
import { b64urlToHex } from "./converters"

export const algs = ["ES256", "ES384", "ES512", "PS256", "PS384", "PS512", "RS256", "RS384", "RS512"]

const hexifyJwk = (jwk) => {
    if ("d" in jwk) jwk["d"] = `0x${b64urlToHex(jwk["d"])}`
    if ("dp" in jwk) jwk["dp"] = `0x${b64urlToHex(jwk["dp"])}`
    if ("dq" in jwk) jwk["dq"] = `0x${b64urlToHex(jwk["dq"])}`
    if ("e" in jwk) jwk["e"] = `0x${b64urlToHex(jwk["e"])}`
    if ("k" in jwk) jwk["k"] = `0x${b64urlToHex(jwk["k"])}`
    if ("n" in jwk) jwk["n"] = `0x${b64urlToHex(jwk["n"])}`
    if ("p" in jwk) jwk["p"] = `0x${b64urlToHex(jwk["p"])}`
    if ("q" in jwk) jwk["q"] = `0x${b64urlToHex(jwk["q"])}`
    if ("qi" in jwk) jwk["qi"] = `0x${b64urlToHex(jwk["qi"])}`
    if ("x" in jwk) jwk["x"] = `0x${b64urlToHex(jwk["x"])}`
    if ("y" in jwk) jwk["y"] = `0x${b64urlToHex(jwk["y"])}`
    return jwk
}

export const generateKey = async (alg) => {
    const { publicKey, privateKey } = await jose.generateKeyPair(alg, {extractable: true})
    const publicKeyJwk = await jose.exportJWK(publicKey)
    const privateKeyJwk = await jose.exportJWK(privateKey)
    return { publicKey: {alg, ...hexifyJwk(publicKeyJwk)}, privateKey: {alg, ...hexifyJwk(privateKeyJwk)} }
}

export const storeKey = (kid, key) => {
    const keys = JSON.parse(localStorage.getItem("keys") || "{}")
    keys[kid] = { ...keys[kid], ...key }
    localStorage.setItem("keys", JSON.stringify(keys))
}

export const deleteKey = (kid) => {
    const keys = JSON.parse(localStorage.getItem("keys") || "{}")
    delete keys[kid]
    localStorage.setItem("keys", JSON.stringify(keys))
}

export const getKey = (kid) => {
    return getKeys()[kid]
}

export const getKeys = () => {
    const keys = JSON.parse(localStorage.getItem("keys") || "{}")
    return keys
}

export const renderKeysTable = () => {
    keyTable.innerHTML = ""
    for (const [id, key] of Object.entries(getKeys())) {
        const row = document.createElement("tr")

        const idCell = document.createElement("td")
        idCell.textContent = id
        row.appendChild(idCell)

        const publicKeyCell = document.createElement("td")
        const publicKeyPre = document.createElement("pre")
        publicKeyPre.textContent = JSON.stringify(key.publicKey, null, 2)
        publicKeyCell.appendChild(publicKeyPre)
        row.appendChild(publicKeyCell)

        const privateKeyCell = document.createElement("td")
        const privateKeyPre = document.createElement("pre")
        privateKeyPre.textContent = JSON.stringify(key.privateKey, null, 2)
        privateKeyCell.appendChild(privateKeyPre)
        row.appendChild(privateKeyCell)

        keyTable.appendChild(row)
    }
}
