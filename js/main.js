import * as editors from "./editors.js"
import * as encoders from "./encoders.js"
import * as decoders from "./decoders.js"
import { examples } from "./examples.js"
import { getAaguids } from "./aaguid.js"
import { parseInterceptParams } from "./intercept.js"
import { renderCapabilities } from "./capabilities.js"
import { verifyAssertion, signAssertion } from "./signatures.js"
import { algs, getKey, getKeys, storeKey, generateKey, deleteKey } from "./keys.js"
import { navigatorCredentialsCreate, navigatorCredentialsGet } from "./webapi.js"
import {
    b64urlToHex, hexToB64url, strToB64url, strToHex, b64urlToStr, hexToStr,
    strToB64, b64urlToB64, hexToB64, b64ToStr, b64ToB64url, b64ToHex,
    uint8ToHex, strSha256Uint8, parsePublicKeyCredentialCreationOptions,
    parsePublicKeyCredentialRequestOptions
} from "./converters.js"

export const showTab = (tab) => {
    const tabBtn = document.querySelector(`[data-bs-target="#${tab}-tab-pane"]`)
    const bsTab = new bootstrap.Tab(tabBtn)
    bsTab.show()
    window.scrollTo(0, 0)
}

renderCapabilities()

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
    const mediation = editors.mediationGetEditor.getValue()
    navigatorCredentialsGet(publicKeyCredentialRequestOptions, mediation).then(publicKeyCredential => {
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
    const b64 = encoders.clientDataJSON(data, "b64")
    attestationClientDataJSONEncB64Textarea.value = b64
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

attestationClientDataJSONEncB64Textarea.oninput = async () => {
    const data = decoders.clientDataJSON(attestationClientDataJSONEncB64Textarea.value, "b64")
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

const encodeAttestationAttestationObject = async () => {
    const data = editors.attestationAttestationObjectDecEditor.getValue()
    const b64url = encoders.attestationObject(data, "b64url")
    attestationAttestationObjectEncB64urlTextarea.value = b64url
    const b64 = encoders.attestationObject(data, "b64")
    attestationAttestationObjectEncB64Textarea.value = b64
    const hex = encoders.attestationObject(data, "hex")
    attestationAttestationObjectEncHexTextarea.value = hex
    const b64urlAuthData = encoders.attestationObject(data, "b64url", "authData")
    attestationAuthenticatorDataEncB64urlTextarea.value = b64urlAuthData
    const b64AuthData = encoders.attestationObject(data, "b64", "authData")
    attestationAuthenticatorDataEncB64Textarea.value = b64AuthData
    const hexAuthData = encoders.attestationObject(data, "hex", "authData")
    attestationAuthenticatorDataEncHexTextarea.value = hexAuthData
    const jwk = data.authData.attestedCredentialData.credentialPublicKey
    const derB64url = await encoders.keys(jwk, "der", "b64url")
    attestationPublicKeyDerB64urlTextarea.value = derB64url
    const derB64 = await encoders.keys(jwk, "der", "b64")
    attestationPublicKeyDerB64Textarea.value = derB64
    const derHex = await encoders.keys(jwk, "der", "hex")
    attestationPublicKeyDerHexTextarea.value = derHex
}

attestationAttestationObjectEncB64urlTextarea.oninput = async () => {
    const data = decoders.attestationObject(attestationAttestationObjectEncB64urlTextarea.value, "b64url")
    editors.attestationAttestationObjectDecEditor.setValue(data)
    await encodeAttestationAttestationObject()
}

attestationAttestationObjectEncB64Textarea.oninput = async () => {
    const data = decoders.attestationObject(attestationAttestationObjectEncB64Textarea.value, "b64")
    editors.attestationAttestationObjectDecEditor.setValue(data)
    await encodeAttestationAttestationObject()
}

attestationAttestationObjectEncHexTextarea.oninput = async () => {
    const data = decoders.attestationObject(attestationAttestationObjectEncHexTextarea.value, "hex")
    editors.attestationAttestationObjectDecEditor.setValue(data)
    await encodeAttestationAttestationObject()
}

editors.attestationAttestationObjectDecEditor.on("change", async () => {
    await encodeAttestationAttestationObject()
})

attestationSendKeyToParserBtn.onclick = () => {
    const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
    const key = attestationObject.authData.attestedCredentialData.credentialPublicKey
    editors.keysJwkEditor.setValue(key)
    encodeKeys()
    showTab("keys")
}

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
    const b64 = encoders.clientDataJSON(data, "b64")
    assertionClientDataJSONEncB64Textarea.value = b64
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

assertionClientDataJSONEncB64Textarea.oninput = async () => {
    const data = decoders.clientDataJSON(assertionClientDataJSONEncB64Textarea.value, "b64")
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
    const b64 = encoders.authenticatorData(data, "b64")
    assertionAuthenticatorDataEncB64Textarea.value = b64
    const hex = encoders.authenticatorData(data, "hex")
    assertionAuthenticatorDataEncHexTextarea.value = hex
}

assertionAuthenticatorDataEncB64urlTextarea.oninput = () => {
    const data = decoders.authenticatorData(assertionAuthenticatorDataEncB64urlTextarea.value, "b64url")
    editors.assertionAuthenticatorDataDecEditor.setValue(data)
    encodeAssertionAuthenticatorData()
}

assertionAuthenticatorDataEncB64Textarea.oninput = () => {
    const data = decoders.authenticatorData(assertionAuthenticatorDataEncB64Textarea.value, "b64")
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
    const b64 = b64urlToB64(b64url)
    assertionSignatureEncHexTextarea.value = hex
    assertionSignatureEncB64Textarea.value = b64
}

assertionSignatureEncB64Textarea.oninput = () => {
    const b64 = assertionSignatureEncB64Textarea.value
    const hex = b64ToHex(b64)
    const b64url = b64ToB64url(b64)
    assertionSignatureEncHexTextarea.value = hex
    assertionSignatureEncB64urlTextarea.value = b64url
}

assertionSignatureEncHexTextarea.oninput = () => {
    const hex = assertionSignatureEncHexTextarea.value
    const b64url = hexToB64url(hex)
    const b64 = hexToB64(hex)
    assertionSignatureEncB64urlTextarea.value = b64url
    assertionSignatureEncB64Textarea.value = b64
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
    const b64 = await encoders.keys(data, "cose", "b64")
    keysCoseB64Textarea.value = b64
    const hex = await encoders.keys(data, "cose", "hex")
    keysCoseHexTextarea.value = hex
    const pem = await encoders.keys(data, "pem", "b64")
    keysPemB64Textarea.value = pem
    const der = await encoders.keys(data, "der", "b64url")
    keysDerB64urlTextarea.value = der
}

keysCoseB64urlTextarea.oninput = async () => {
    const data = await decoders.keys(keysCoseB64urlTextarea.value, "cose", "b64url")
    editors.keysJwkEditor.setValue(data)
    encodeKeys()
}

keysCoseB64Textarea.oninput = async () => {
    const data = await decoders.keys(keysCoseB64Textarea.value, "cose", "b64")
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
        const credentialIdHexCell = document.createElement("td")
        credentialIdHexCell.textContent = key.credentialId ? key.credentialId : "N/A"
        row.appendChild(credentialIdHexCell)
        const credentialIdB64urlCell = document.createElement("td")
        credentialIdB64urlCell.textContent = key.credentialId ? hexToB64url(key.credentialId) : "N/A"
        row.appendChild(credentialIdB64urlCell)
        const credentialIdB64Cell = document.createElement("td")
        credentialIdB64Cell.textContent = key.credentialId ? hexToB64(key.credentialId) : "N/A"
        row.appendChild(credentialIdB64Cell)
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
    const credentialIdHex = keysUpdateCredentialIdHexInput.value
    const credentialIdB64url = keysUpdateCredentialIdB64urlInput.value
    const credentialIdB64 = keysUpdateCredentialIdB64Input.value
    if (credentialIdHex) storeKey(name, { credentialId: credentialIdHex })
    else if (credentialIdB64url) storeKey(name, { credentialId: b64urlToHex(credentialIdB64url) })
    else if (credentialIdB64) storeKey(name, { credentialId: b64ToHex(credentialIdB64) })
    else storeKey(name, { credentialId: "" })
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
    convertersB64Textarea.value = strToB64(convertersStrTextarea.value)
}

convertersB64urlTextarea.oninput = () => {
    convertersStrTextarea.value = b64urlToStr(convertersB64urlTextarea.value)
    convertersHexTextarea.value = b64urlToHex(convertersB64urlTextarea.value)
    convertersB64Textarea.value = b64urlToB64(convertersB64urlTextarea.value)
}

convertersHexTextarea.oninput = () => {
    convertersStrTextarea.value = hexToStr(convertersHexTextarea.value)
    convertersB64urlTextarea.value = hexToB64url(convertersHexTextarea.value)
    convertersB64Textarea.value = hexToB64(convertersHexTextarea.value)
}

convertersB64Textarea.oninput = () => {
    convertersStrTextarea.value = b64ToStr(convertersB64Textarea.value)
    convertersB64urlTextarea.value = b64ToB64url(convertersB64Textarea.value)
    convertersHexTextarea.value = b64ToHex(convertersB64Textarea.value)
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

/* parse intercept params */

window.addEventListener("load", async () => {
    await parseInterceptParams()
})

window.addEventListener("hashchange", async () => {
    await parseInterceptParams()
})
