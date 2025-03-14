import * as jose from "jose"

export const algs = ["ES256", "ES384", "ES512", "PS256", "PS384", "PS512", "RS256", "RS384", "RS512", "EdDSA"]

export const generateKey = async (alg) => {
    const { publicKey, privateKey } = await jose.generateKeyPair(alg, {extractable: true})
    const publicKeyJwk = await jose.exportJWK(publicKey)
    const privateKeyJwk = await jose.exportJWK(privateKey)
    return { publicKey: {alg, ...publicKeyJwk}, privateKey: {alg, ...privateKeyJwk} }
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
