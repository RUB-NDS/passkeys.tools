import * as editors from "./editors.js"
import * as encoders from "./encoders.js"
import * as decoders from "./decoders.js"
import { examples } from "./examples.js"
import { verifyAssertion, signAssertion } from "./signatures.js"
import { algs, getKey, getKeys, storeKey, generateKey, deleteKey } from "./keys.js"
import { b64urlToHex, hexToB64url, strToB64url, strToHex, b64urlToStr, hexToStr, uint8ToHex, strSha256Uint8 } from "./converters.js"

/* attestation -> clientDataJSON */

const encodeAttestationClientDataJSON = async () => {
    const data = editors.attestationClientDataJSONDecEditor.getValue()
    const b64url = encoders.clientDataJSON(data, "b64url")
    attestationClientDataJSONEncB64urlTextarea.value = b64url
    const hex = encoders.clientDataJSON(data, "hex")
    attestationClientDataJSONEncHexTextarea.value = hex
    const hash = uint8ToHex(await strSha256Uint8(JSON.stringify(data)))
    attestationClientDataJSONHashHexTextarea.value = hash
}

attestationClientDataJSONEncB64urlTextarea.oninput = async () => {
    const data = decoders.clientDataJSON(attestationClientDataJSONEncB64urlTextarea.value, "b64url")
    editors.attestationClientDataJSONDecEditor.setValue(data)
    await encodeAttestationClientDataJSON()
}

attestationClientDataJSONEncHexTextarea.oninput = async () => {
    const data = decoders.clientDataJSON(attestationClientDataJSONEncHexTextarea.value, "hex")
    editors.attestationClientDataJSONDecEditor.setValue(data)
    await encodeAttestationClientDataJSON()
}

editors.attestationClientDataJSONDecEditor.on("change", async () => {
    await encodeAttestationClientDataJSON()
})

/* attestation -> attestationObject */

const encodeAttestationAttestationObject = () => {
    const data = editors.attestationAttestationObjectDecEditor.getValue()
    const b64url = encoders.attestationObject(data, "b64url")
    attestationAttestationObjectEncB64urlTextarea.value = b64url
    const hex = encoders.attestationObject(data, "hex")
    attestationAttestationObjectEncHexTextarea.value = hex
}

attestationAttestationObjectEncB64urlTextarea.oninput = () => {
    const data = decoders.attestationObject(attestationAttestationObjectEncB64urlTextarea.value, "b64url")
    editors.attestationAttestationObjectDecEditor.setValue(data)
    encodeAttestationAttestationObject()
}

attestationAttestationObjectEncHexTextarea.oninput = () => {
    const data = decoders.attestationObject(attestationAttestationObjectEncHexTextarea.value, "hex")
    editors.attestationAttestationObjectDecEditor.setValue(data)
    encodeAttestationAttestationObject()
}

editors.attestationAttestationObjectDecEditor.on("change", () => {
    encodeAttestationAttestationObject()
})

/* assertion -> clientDataJSON */

const encodeAssertionClientDataJSON = async () => {
    const data = editors.assertionClientDataJSONDecEditor.getValue()
    const b64url = encoders.clientDataJSON(data, "b64url")
    assertionClientDataJSONEncB64urlTextarea.value = b64url
    const hex = encoders.clientDataJSON(data, "hex")
    assertionClientDataJSONEncHexTextarea.value = hex
    const hash = uint8ToHex(await strSha256Uint8(JSON.stringify(data)))
    assertionClientDataJSONHashHexTextarea.value = hash
}

assertionClientDataJSONEncB64urlTextarea.oninput = async () => {
    const data = decoders.clientDataJSON(assertionClientDataJSONEncB64urlTextarea.value, "b64url")
    editors.assertionClientDataJSONDecEditor.setValue(data)
    await encodeAssertionClientDataJSON()
}

assertionClientDataJSONEncHexTextarea.oninput = async () => {
    const data = decoders.clientDataJSON(assertionClientDataJSONEncHexTextarea.value, "hex")
    editors.assertionClientDataJSONDecEditor.setValue(data)
    await encodeAssertionClientDataJSON()
}

editors.assertionClientDataJSONDecEditor.on("change", async () => {
    await encodeAssertionClientDataJSON()
})

/* assertion -> authenticatorData */

const encodeAssertionAuthenticatorData = () => {
    const data = editors.assertionAuthenticatorDataDecEditor.getValue()
    const b64url = encoders.authenticatorData(data, "b64url")
    assertionAuthenticatorDataEncB64urlTextarea.value = b64url
    const hex = encoders.authenticatorData(data, "hex")
    assertionAuthenticatorDataEncHexTextarea.value = hex
}

assertionAuthenticatorDataEncB64urlTextarea.oninput = () => {
    const data = decoders.authenticatorData(assertionAuthenticatorDataEncB64urlTextarea.value, "b64url")
    editors.assertionAuthenticatorDataDecEditor.setValue(data)
    encodeAssertionAuthenticatorData()
}

assertionAuthenticatorDataEncHexTextarea.oninput = () => {
    const data = decoders.authenticatorData(assertionAuthenticatorDataEncHexTextarea.value, "hex")
    editors.assertionAuthenticatorDataDecEditor.setValue(data)
    encodeAssertionAuthenticatorData()
}

editors.assertionAuthenticatorDataDecEditor.on("change", () => {
    encodeAssertionAuthenticatorData()
})

/* assertion -> signature */

assertionSignatureEncB64urlTextarea.oninput = () => {
    const b64url = assertionSignatureEncB64urlTextarea.value
    const hex = b64urlToHex(b64url)
    assertionSignatureEncHexTextarea.value = hex
}

assertionSignatureEncHexTextarea.oninput = () => {
    const hex = assertionSignatureEncHexTextarea.value
    const b64url = hexToB64url(hex)
    assertionSignatureEncB64urlTextarea.value = b64url
}

verifyAssertionWithAttestationKeyBtn.onclick = async () => {
    const clientDataHash = assertionClientDataJSONHashHexTextarea.value
    const authenticatorData = assertionAuthenticatorDataEncHexTextarea.value
    const signature = assertionSignatureEncHexTextarea.value
    const jwk = editors.attestationAttestationObjectDecEditor.getValue().authData.attestedCredentialData.credentialPublicKey
    const valid = await verifyAssertion(clientDataHash, authenticatorData, signature, jwk)
    alert(valid)
}

verifyAssertionWithStoredKeyBtn.onclick = async () => {
    const clientDataHash = assertionClientDataJSONHashHexTextarea.value
    const authenticatorData = assertionAuthenticatorDataEncHexTextarea.value
    const signature = assertionSignatureEncHexTextarea.value
    const id = verifyAssertionWithStoredKeySelect.value
    const jwk = getKey(id).publicKey
    const valid = await verifyAssertion(clientDataHash, authenticatorData, signature, jwk)
    alert(valid)
}

signAssertionWithStoredKeyBtn.onclick = async () => {
    const clientDataHash = assertionClientDataJSONHashHexTextarea.value
    const authenticatorData = assertionAuthenticatorDataEncHexTextarea.value
    const id = signAssertionWithStoredKeySelect.value
    const jwk = getKey(id).privateKey
    const signature = await signAssertion(clientDataHash, authenticatorData, jwk)
    assertionSignatureEncHexTextarea.value = uint8ToHex(signature)
    assertionSignatureEncHexTextarea.dispatchEvent(new Event("input"))
}

/* keys */

const encodeKeys = async () => {
    const data = editors.keysJwkEditor.getValue()
    const b64url = await encoders.keys(data, "cose", "b64url")
    keysCoseB64urlTextarea.value = b64url
    const hex = await encoders.keys(data, "cose", "hex")
    keysCoseHexTextarea.value = hex
    const pem = await encoders.keys(data, "pem", "str")
    keysPemStrTextarea.value = pem
}

keysCoseB64urlTextarea.oninput = async () => {
    const data = await decoders.keys(keysCoseB64urlTextarea.value, "cose", "b64url")
    editors.keysJwkEditor.setValue(data)
    encodeKeys()
}

keysCoseHexTextarea.oninput = async () => {
    const data = await decoders.keys(keysCoseHexTextarea.value, "cose", "hex")
    editors.keysJwkEditor.setValue(data)
    encodeKeys()
}

editors.keysJwkEditor.on("change", async () => {
    await encodeKeys()
})

export const renderKeys = () => {
    // keys -> assertion -> signature -> verify
    verifyAssertionWithStoredKeySelect.innerHTML = ""
    for (const [id, key] of Object.entries(getKeys())) {
        const option = document.createElement("option")
        option.value = id
        option.text = id
        verifyAssertionWithStoredKeySelect.appendChild(option)
    }

    // keys -> assertion -> signature -> sign
    signAssertionWithStoredKeySelect.innerHTML = ""
    for (const [id, key] of Object.entries(getKeys())) {
        const option = document.createElement("option")
        option.value = id
        option.text = id
        signAssertionWithStoredKeySelect.appendChild(option)
    }

    // keys -> key parser -> load key
    keysLoadKeyIdSelect.innerHTML = ""
    for (const [id, key] of Object.entries(getKeys())) {
        const option = document.createElement("option")
        option.value = id
        option.text = id
        keysLoadKeyIdSelect.appendChild(option)
    }

    // keys -> key storage -> delete key
    keysDeleteKeyIdSelect.innerHTML = ""
    for (const [id, key] of Object.entries(getKeys())) {
        const option = document.createElement("option")
        option.value = id
        option.text = id
        keysDeleteKeyIdSelect.appendChild(option)
    }

    // keys -> key storage -> table
    keysTable.innerHTML = ""
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
        keysTable.appendChild(row)
    }
}

renderKeys()

algs.forEach(alg => {
    const option = document.createElement("option")
    option.value = alg
    option.text = alg
    keysGenerateKeyAlgSelect.appendChild(option)
})

keysLoadKeyBtn.onclick = async () => {
    const id = keysLoadKeyIdSelect.value
    const type = keysLoadKeyTypeSelect.value
    const key = getKey(id)[type] || {}
    editors.keysJwkEditor.setValue(key)
    encodeKeys()
}

keysStoreKeyBtn.onclick = () => {
    const id = keysStoreKeyIdInput.value
    const type = keysStoreKeyTypeSelect.value
    const key = editors.keysJwkEditor.getValue()
    storeKey(id, { [type]:  key })
    renderKeys()
}

keysGenerateKeyBtn.onclick = async () => {
    const id = keysGenerateKeyIdInput.value
    const alg = keysGenerateKeyAlgSelect.value
    const { publicKey, privateKey } = await generateKey(alg)
    storeKey(id, { publicKey, privateKey })
    renderKeys()
}

keysDeleteKeyBtn.onclick = () => {
    const id = keysDeleteKeyIdSelect.value
    const check = confirm("Delete key?")
    if (!check) return
    deleteKey(id)
    renderKeys()
}

/* converters */

convertersStrTextarea.oninput = () => {
    convertersHexTextarea.value = strToHex(convertersStrTextarea.value)
    convertersB64urlTextarea.value = strToB64url(convertersStrTextarea.value)
}

convertersB64urlTextarea.oninput = () => {
    convertersStrTextarea.value = b64urlToStr(convertersB64urlTextarea.value)
    convertersHexTextarea.value = b64urlToHex(convertersB64urlTextarea.value)
}

convertersHexTextarea.oninput = () => {
    convertersStrTextarea.value = hexToStr(convertersHexTextarea.value)
    convertersB64urlTextarea.value = hexToB64url(convertersHexTextarea.value)
}

/* examples */

for (const key of Object.keys(examples)) {
    const option = document.createElement("option")
    option.value = key
    option.text = key
    examplesSelect.appendChild(option)
}

examplesLoadBtn.onclick = () => {
    const example = examples[examplesSelect.value]
    attestationClientDataJSONEncHexTextarea.value = example.attestation.clientDataJSON
    attestationClientDataJSONEncHexTextarea.dispatchEvent(new Event("input"))
    attestationAttestationObjectEncHexTextarea.value = example.attestation.attestationObject
    attestationAttestationObjectEncHexTextarea.dispatchEvent(new Event("input"))
    assertionClientDataJSONEncHexTextarea.value = example.assertion.clientDataJSON
    assertionClientDataJSONEncHexTextarea.dispatchEvent(new Event("input"))
    assertionAuthenticatorDataEncHexTextarea.value = example.assertion.authenticatorData
    assertionAuthenticatorDataEncHexTextarea.dispatchEvent(new Event("input"))
    assertionSignatureEncHexTextarea.value = example.assertion.signature
    assertionSignatureEncHexTextarea.dispatchEvent(new Event("input"))
}
