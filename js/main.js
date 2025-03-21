import * as editors from "./editors.js"
import * as encoders from "./encoders.js"
import * as decoders from "./decoders.js"
import { examples } from "./examples.js"
import { getAaguids } from "./aaguid.js"
import { verifyAssertion, signAssertion } from "./signatures.js"
import { algs, getKey, getKeys, storeKey, generateKey, deleteKey } from "./keys.js"
import { navigatorCredentialsCreate, navigatorCredentialsGet } from "./webapi.js"
import {
    b64urlToHex, hexToB64url, strToB64url, strToHex, b64urlToStr, hexToStr,
    uint8ToHex, strSha256Uint8, parsePublicKeyCredentialCreationOptions,
    parsePublicKeyCredentialRequestOptions
} from "./converters.js"

/* create */

createWebApiBtn.onclick = () => {
    createWebApiResult.innerHTML = ""
    const publicKeyCredentialCreationOptions = parsePublicKeyCredentialCreationOptions(editors.createEditor.getValue())
    navigatorCredentialsCreate(publicKeyCredentialCreationOptions).then(publicKeyCredential => {
        const publicKeyCredentialJson = publicKeyCredential.toJSON()
        const div = document.createElement("div")
        div.classList = "alert alert-success"
        const pre = document.createElement("pre")
        pre.textContent = JSON.stringify(publicKeyCredentialJson, null, 2)
        div.appendChild(pre)
        createWebApiResult.appendChild(div)
    }).catch(error => {
        const div = document.createElement("div")
        div.classList = "alert alert-danger"
        div.textContent = error
        createWebApiResult.appendChild(div)
    })
}

/* get */

getWebApiBtn.onclick = () => {
    getWebApiResult.innerHTML = ""
    const publicKeyCredentialRequestOptions = parsePublicKeyCredentialRequestOptions(editors.getEditor.getValue())
    navigatorCredentialsGet(publicKeyCredentialRequestOptions).then(publicKeyCredential => {
        const publicKeyCredentialJson = publicKeyCredential.toJSON()
        const div = document.createElement("div")
        div.classList = "alert alert-success"
        const pre = document.createElement("pre")
        pre.textContent = JSON.stringify(publicKeyCredentialJson, null, 2)
        div.appendChild(pre)
        getWebApiResult.appendChild(div)
    }).catch(error => {
        const div = document.createElement("div")
        div.classList = "alert alert-danger"
        div.textContent = error
        getWebApiResult.appendChild(div)
    })
}

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

attestationLoadKeyBtn.onclick = async () => {
    const name = attestationLoadKeyNameSelect.value
    const type = attestationLoadKeyTypeSelect.value
    const key = getKey(name)[type] || {}
    const credentialId = getKey(name).credentialId || ""
    const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
    attestationObject.authData.attestedCredentialData.credentialPublicKey = key
    attestationObject.authData.attestedCredentialData.credentialId = credentialId
    attestationObject.authData.attestedCredentialData.credentialIdLength = credentialId.length / 2
    editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
}

attestationStoreKeyBtn.onclick = () => {
    const name = attestationStoreKeyNameInput.value
    const type = attestationStoreKeyTypeSelect.value
    const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
    const key = attestationObject.authData.attestedCredentialData.credentialPublicKey
    const credentialId = attestationObject.authData.attestedCredentialData.credentialId
    storeKey(name, { credentialId, [type]:  key })
    renderKeys()
}

for (const e of ["change", "keydown", "paste", "input"]) {
    attestationRpIdInput.addEventListener(e, async () => {
        const rpId = attestationRpIdInput.value
        const rpIdHash = await strSha256Uint8(rpId)
        attestationRpIdHashInput.value = uint8ToHex(rpIdHash)
    })
}

attestationRpIdBtn.onclick = async () => {
    const rpIdHash = attestationRpIdHashInput.value
    const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
    attestationObject.authData.rpIdHash = rpIdHash
    editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
}

for (const [k, v] of Object.entries(getAaguids())) {
    const option = document.createElement("option")
    option.value = v
    option.text = k
    attestationAaguidSelect.appendChild(option)
}

attestationAaguidBtn.onclick = async () => {
    const aaguid = attestationAaguidSelect.value
    const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
    attestationObject.authData.attestedCredentialData.aaguid = aaguid
    editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
}

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

for (const e of ["change", "keydown", "paste", "input"]) {
    assertionRpIdInput.addEventListener(e, async () => {
        const rpId = assertionRpIdInput.value
        const rpIdHash = await strSha256Uint8(rpId)
        assertionRpIdHashInput.value = uint8ToHex(rpIdHash)
    })
}

assertionRpIdBtn.onclick = async () => {
    const rpIdHash = assertionRpIdHashInput.value
    const authenticatorData = editors.assertionAuthenticatorDataDecEditor.getValue()
    authenticatorData.rpIdHash = rpIdHash
    editors.assertionAuthenticatorDataDecEditor.setValue(authenticatorData)
}

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
    const name = verifyAssertionWithStoredKeySelect.value
    const jwk = getKey(name).publicKey
    const valid = await verifyAssertion(clientDataHash, authenticatorData, signature, jwk)
    alert(valid)
}

signAssertionWithStoredKeyBtn.onclick = async () => {
    const clientDataHash = assertionClientDataJSONHashHexTextarea.value
    const authenticatorData = assertionAuthenticatorDataEncHexTextarea.value
    const name = signAssertionWithStoredKeySelect.value
    const jwk = getKey(name).privateKey
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
    // attestation -> attestation object
    attestationLoadKeyNameSelect.innerHTML = ""
    for (const [name, key] of Object.entries(getKeys())) {
        const option = document.createElement("option")
        option.value = name
        option.text = name
        attestationLoadKeyNameSelect.appendChild(option)
    }

    // assertion -> signature -> verify
    verifyAssertionWithStoredKeySelect.innerHTML = ""
    for (const [name, key] of Object.entries(getKeys())) {
        const option = document.createElement("option")
        option.value = name
        option.text = name
        verifyAssertionWithStoredKeySelect.appendChild(option)
    }

    // assertion -> signature -> sign
    signAssertionWithStoredKeySelect.innerHTML = ""
    for (const [name, key] of Object.entries(getKeys())) {
        const option = document.createElement("option")
        option.value = name
        option.text = name
        signAssertionWithStoredKeySelect.appendChild(option)
    }

    // keys -> key parser -> load key
    keysLoadKeyNameSelect.innerHTML = ""
    for (const [name, key] of Object.entries(getKeys())) {
        const option = document.createElement("option")
        option.value = name
        option.text = name
        keysLoadKeyNameSelect.appendChild(option)
    }

    // keys -> key storage -> update credential id
    keysUpdateCredentialIdSelect.innerHTML = ""
    for (const [name, key] of Object.entries(getKeys())) {
        const option = document.createElement("option")
        option.value = name
        option.text = name
        keysUpdateCredentialIdSelect.appendChild(option)
    }

    // keys -> key storage -> delete key
    keysDeleteKeyNameSelect.innerHTML = ""
    for (const [name, key] of Object.entries(getKeys())) {
        const option = document.createElement("option")
        option.value = name
        option.text = name
        keysDeleteKeyNameSelect.appendChild(option)
    }

    // keys -> key storage -> table
    keysTable.innerHTML = ""
    for (const [name, key] of Object.entries(getKeys())) {
        const row = document.createElement("tr")
        const nameCell = document.createElement("td")
        nameCell.textContent = name
        row.appendChild(nameCell)
        const credentialIdCell = document.createElement("td")
        credentialIdCell.textContent = key.credentialId
        row.appendChild(credentialIdCell)
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
    const name = keysLoadKeyNameSelect.value
    const type = keysLoadKeyTypeSelect.value
    const key = getKey(name)[type] || {}
    editors.keysJwkEditor.setValue(key)
    encodeKeys()
}

keysStoreKeyBtn.onclick = () => {
    const name = keysStoreKeyNameInput.value
    const type = keysStoreKeyTypeSelect.value
    const key = editors.keysJwkEditor.getValue()
    storeKey(name, { [type]:  key })
    renderKeys()
}

keysGenerateKeyBtn.onclick = async () => {
    const name = keysGenerateKeyNameInput.value
    const alg = keysGenerateKeyAlgSelect.value
    const key = await generateKey(alg)
    storeKey(name, key)
    renderKeys()
}

keysUpdateCredentialIdBtn.onclick = () => {
    const name = keysUpdateCredentialIdSelect.value
    const credentialId = keysUpdateCredentialIdInput.value
    storeKey(name, { credentialId })
    renderKeys()
}

keysDeleteKeyBtn.onclick = () => {
    const name = keysDeleteKeyNameSelect.value
    const check = confirm("Delete key?")
    if (!check) return
    deleteKey(name)
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

const loadExample = (example) => {
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

for (const key of Object.keys(examples)) {
    const option = document.createElement("option")
    option.value = key
    option.text = key
    examplesSelect.appendChild(option)
}

examplesLoadBtn.onclick = () => {
    const example = examples[examplesSelect.value]
    loadExample(example)
}

window.addEventListener("load", () => {
    loadExample(examples["ES256 Credential with No Attestation"])
})
