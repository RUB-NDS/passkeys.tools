import * as editors from "./editors.js"
import * as encoders from "./encoders.js"
import * as decoders from "./decoders.js"
import { examples } from "./examples.js"
import { getAaguids } from "./aaguid.js"
import { parseInterceptParams, initializeCopyButtons } from "./intercept.js"
import { renderCapabilities } from "./capabilities.js"
import { verifyAssertion, signAssertion } from "./signatures.js"
import { getUsers, storeUser, deleteUser } from "./users.js"
import { algs, getKey, getKeys, storeKey, generateKey, deleteKey, generateModeKeys } from "./keys.js"
import { navigatorCredentialsCreate, navigatorCredentialsGet } from "./webapi.js"
import { renderStorageSettings, renderThemeSettings } from "./storage.js"
import { initShortcuts, renderShortcuts } from "./shortcuts.js"
import { renderHistory } from "./history.js"
import {
    b64urlToHex, hexToB64url, strToB64url, strToHex, b64urlToStr, hexToStr,
    strToB64, b64urlToB64, hexToB64, b64ToStr, b64ToB64url, b64ToHex,
    uint8ToHex, strSha256Uint8, parsePublicKeyCredentialCreationOptions,
    parsePublicKeyCredentialRequestOptions, uint8ToB64url, uint8ToB64
} from "./converters.js"

/* Helper functions */

let storageErrorShown = false
export const showStorageError = () => {
    if (storageErrorShown) return
    storageErrorShown = true
    alert("Unable to connect to remote storage. Your keys, users, and history could not be loaded.\n\nPlease check your storage settings to verify the server URL is correct and accessible.")
}

const setupEncodingHandlers = (elements, decoder, editor, encoder) => {
    const { b64urlTextarea, b64Textarea, hexTextarea } = elements

    b64urlTextarea.oninput = async () => {
        const data = decoder(b64urlTextarea.value, "b64url")
        editor.setValue(data)
        await encoder()
    }

    b64Textarea.oninput = async () => {
        const data = decoder(b64Textarea.value, "b64")
        editor.setValue(data)
        await encoder()
    }

    hexTextarea.oninput = async () => {
        const data = decoder(hexTextarea.value, "hex")
        editor.setValue(data)
        await encoder()
    }

    editor.on("change", async () => {
        await encoder()
    })
}

const populateSelectOptions = (selectElement, options, valueKey = "value", textKey = "text") => {
    selectElement.innerHTML = ""
    for (const [key, value] of Object.entries(options)) {
        const option = document.createElement("option")
        option.value = typeof value === "object" ? key : value
        option.text = typeof value === "object" ? (value[textKey] || key) : key
        selectElement.appendChild(option)
    }
}

export const createResultAlert = (container, content, isSuccess = true) => {
    container.innerHTML = ""
    const div = document.createElement("div")
    div.classList = isSuccess ? "alert alert-success" : "alert alert-danger"
    if (typeof content === "object") {
        const pre = document.createElement("pre")
        pre.textContent = JSON.stringify(content, null, 2)
        div.appendChild(pre)
    } else {
        div.textContent = content
    }
    container.appendChild(div)
}

export const showTab = (tab) => {
    const tabBtn = document.querySelector(`[data-bs-target="#${tab}-tab-pane"]`)
    if (tabBtn) {
        const bsTab = new bootstrap.Tab(tabBtn)
        bsTab.show()
    }
}
window.showTab = showTab

export const highlightTabs = (tabs) => {
    document.querySelectorAll(".badge-navbar").forEach(e => e.remove())
    tabs.forEach(tab => {
        const button = document.querySelector(`button[data-bs-target="#${tab}-tab-pane"]`)
        const badge = document.createElement("span")
        badge.className = "badge text-bg-secondary badge-navbar"
        badge.textContent = "EDIT"
        button.appendChild(badge)
    })
}

renderCapabilities()
renderShortcuts()

/* create */

createWebApiBtn.onclick = () => {
    const publicKeyCredentialCreationOptions = parsePublicKeyCredentialCreationOptions(editors.createEditor.getValue())
    navigatorCredentialsCreate(publicKeyCredentialCreationOptions).then(publicKeyCredential => {
        createResultAlert(createWebApiResult, publicKeyCredential.toJSON())
    }).catch(error => {
        createResultAlert(createWebApiResult, error, false)
    })
}

/* get */

getWebApiBtn.onclick = () => {
    const publicKeyCredentialRequestOptions = parsePublicKeyCredentialRequestOptions(editors.getEditor.getValue())
    const mediation = editors.mediationGetEditor.getValue()
    navigatorCredentialsGet(publicKeyCredentialRequestOptions, mediation).then(publicKeyCredential => {
        createResultAlert(getWebApiResult, publicKeyCredential.toJSON())
    }).catch(error => {
        createResultAlert(getWebApiResult, error, false)
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

setupEncodingHandlers({
    b64urlTextarea: attestationClientDataJSONEncB64urlTextarea,
    b64Textarea: attestationClientDataJSONEncB64Textarea,
    hexTextarea: attestationClientDataJSONEncHexTextarea
}, decoders.clientDataJSON, editors.attestationClientDataJSONDecEditor, encodeAttestationClientDataJSON)

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

setupEncodingHandlers({
    b64urlTextarea: attestationAttestationObjectEncB64urlTextarea,
    b64Textarea: attestationAttestationObjectEncB64Textarea,
    hexTextarea: attestationAttestationObjectEncHexTextarea
}, decoders.attestationObject, editors.attestationAttestationObjectDecEditor, encodeAttestationAttestationObject)

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
    const keyData = await getKey(name)
    const key = keyData?.[type] || {}
    const credentialId = keyData?.credentialId || ""
    const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
    attestationObject.authData.attestedCredentialData.credentialPublicKey = key
    attestationObject.authData.attestedCredentialData.credentialId = credentialId
    attestationObject.authData.attestedCredentialData.credentialIdLength = credentialId.length / 2
    editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
}

attestationStoreKeyBtn.onclick = async () => {
    const name = attestationStoreKeyNameInput.value
    const type = attestationStoreKeyTypeSelect.value
    const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
    const key = attestationObject.authData.attestedCredentialData.credentialPublicKey
    const credentialId = attestationObject.authData.attestedCredentialData.credentialId
    await storeKey(name, { credentialId, [type]:  key })
    await renderKeys()
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

populateSelectOptions(attestationAaguidSelect, getAaguids())

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

setupEncodingHandlers({
    b64urlTextarea: assertionClientDataJSONEncB64urlTextarea,
    b64Textarea: assertionClientDataJSONEncB64Textarea,
    hexTextarea: assertionClientDataJSONEncHexTextarea
}, decoders.clientDataJSON, editors.assertionClientDataJSONDecEditor, encodeAssertionClientDataJSON)

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

setupEncodingHandlers({
    b64urlTextarea: assertionAuthenticatorDataEncB64urlTextarea,
    b64Textarea: assertionAuthenticatorDataEncB64Textarea,
    hexTextarea: assertionAuthenticatorDataEncHexTextarea
}, decoders.authenticatorData, editors.assertionAuthenticatorDataDecEditor, encodeAssertionAuthenticatorData)

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
    const jwk = (await getKey(name))?.publicKey
    const valid = await verifyAssertion(clientDataHash, authenticatorData, signature, jwk)
    alert(valid)
}

signAssertionWithStoredKeyBtn.onclick = async () => {
    const clientDataHash = assertionClientDataJSONHashHexTextarea.value
    const authenticatorData = assertionAuthenticatorDataEncHexTextarea.value
    const name = signAssertionWithStoredKeySelect.value
    const jwk = (await getKey(name))?.privateKey
    const signature = await signAssertion(clientDataHash, authenticatorData, jwk)
    assertionSignatureEncHexTextarea.value = uint8ToHex(signature)
    assertionSignatureEncHexTextarea.dispatchEvent(new Event("input"))
    assertionSignatureEncB64urlTextarea.value = uint8ToB64url(signature)
    assertionSignatureEncB64urlTextarea.dispatchEvent(new Event("input"))
    assertionSignatureEncB64Textarea.value = uint8ToB64(signature)
    assertionSignatureEncB64Textarea.dispatchEvent(new Event("input"))
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

setupEncodingHandlers({
    b64urlTextarea: keysCoseB64urlTextarea,
    b64Textarea: keysCoseB64Textarea,
    hexTextarea: keysCoseHexTextarea
}, (value, format) => decoders.keys(value, "cose", format), editors.keysJwkEditor, encodeKeys)

export const renderKeys = async () => {
    let keys = {}
    try {
        keys = await getKeys()
    } catch (error) {
        console.error("Error loading keys:", error)
        showStorageError()
    }

    // Populate all key-related select elements
    const keySelects = [
        attestationLoadKeyNameSelect,
        verifyAssertionWithStoredKeySelect,
        signAssertionWithStoredKeySelect,
        keysLoadKeyNameSelect,
        keysUpdateCredentialIdSelect,
        keysDeleteKeyNameSelect
    ]

    keySelects.forEach(select => populateSelectOptions(select, keys))

    // keys -> key storage -> table
    keysTable.innerHTML = ""
    for (const [name, key] of Object.entries(keys)) {
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

(async () => await renderKeys())()

const algNames = {}
Object.keys(algs).forEach(key => algNames[key] = key)
populateSelectOptions(keysGenerateKeyAlgSelect, algNames)

keysLoadKeyBtn.onclick = async () => {
    const name = keysLoadKeyNameSelect.value
    const type = keysLoadKeyTypeSelect.value
    const keyData = await getKey(name)
    const key = keyData?.[type] || {}
    editors.keysJwkEditor.setValue(key)
    encodeKeys()
}

keysStoreKeyBtn.onclick = async () => {
    const name = keysStoreKeyNameInput.value
    const type = keysStoreKeyTypeSelect.value
    const key = editors.keysJwkEditor.getValue()
    await storeKey(name, { [type]:  key })
    await renderKeys()
}

keysGenerateKeyBtn.onclick = async () => {
    const name = keysGenerateKeyNameInput.value
    const alg = keysGenerateKeyAlgSelect.value
    const key = await generateKey(alg)
    await storeKey(name, key)
    await renderKeys()
}

keysUpdateCredentialIdBtn.onclick = async () => {
    const name = keysUpdateCredentialIdSelect.value
    const credentialIdHex = keysUpdateCredentialIdHexInput.value
    const credentialIdB64url = keysUpdateCredentialIdB64urlInput.value
    const credentialIdB64 = keysUpdateCredentialIdB64Input.value
    if (credentialIdHex) await storeKey(name, { credentialId: credentialIdHex })
    else if (credentialIdB64url) await storeKey(name, { credentialId: b64urlToHex(credentialIdB64url) })
    else if (credentialIdB64) await storeKey(name, { credentialId: b64ToHex(credentialIdB64) })
    else await storeKey(name, { credentialId: "" })
    await renderKeys()
}

keysDeleteKeyBtn.onclick = async () => {
    const name = keysDeleteKeyNameSelect.value
    const check = confirm("Delete key?")
    if (!check) return
    await deleteKey(name)
    await renderKeys()
}

/* users */

usersAddUserBtn.onclick = async () => {
    const rpId = usersAddUserRpIdInput.value
    const name = usersAddUserNameInput.value
    const displayName = usersAddUserDisplayNameInput.value
    const userIdHex = usersAddUserIdHexInput.value
    const userIdB64url = usersAddUserIdB64urlInput.value
    const userIdB64 = usersAddUserIdB64Input.value
    const mode = usersAddUserModeInput.value
    let userId = ""
    if (userIdHex) userId = userIdHex
    else if (userIdB64url) userId = b64urlToHex(userIdB64url)
    else if (userIdB64) userId = b64ToHex(userIdB64)
    const user = {
        rpId: rpId || "",
        name: name || "",
        displayName: displayName || "",
        userId: userId || "",
        mode: mode || ""
    }
    if (user.rpId && user.userId) {
        await storeUser(userId, user)
        await renderUsers()
    } else {
        alert("Please fill in all required fields (rpId, userId).")
    }
}

usersDeleteUserBtn.onclick = async () => {
    const userId = usersDeleteUserSelect.value
    await deleteUser(userId)
    await renderUsers()
}

export const renderUsers = async () => {
    let users = {}
    try {
        users = await getUsers()
    } catch (error) {
        console.error("Error loading users:", error)
        showStorageError()
    }

    // users -> user storage -> delete user
    usersDeleteUserSelect.innerHTML = ""
    for (const [userId, user] of Object.entries(users)) {
        const option = document.createElement("option")
        option.value = userId
        option.text = `${user.rpId} | ${user.name || user.displayName || user.userId}`
        usersDeleteUserSelect.appendChild(option)
    }

    // users -> user storage -> table
    usersTable.innerHTML = ""
    for (const [userId, user] of Object.entries(users)) {
        const row = document.createElement("tr")
        const rpIdCell = document.createElement("td")
        rpIdCell.textContent = user.rpId || "N/A"
        row.appendChild(rpIdCell)
        const nameCell = document.createElement("td")
        nameCell.textContent = user.name || "N/A"
        row.appendChild(nameCell)
        const displayNameCell = document.createElement("td")
        displayNameCell.textContent = user.displayName || "N/A"
        row.appendChild(displayNameCell)
        const idHexCell = document.createElement("td")
        idHexCell.textContent = user.userId || "N/A"
        row.appendChild(idHexCell)
        const idB64urlCell = document.createElement("td")
        idB64urlCell.textContent = hexToB64url(user.userId) || "N/A"
        row.appendChild(idB64urlCell)
        const idB64Cell = document.createElement("td")
        idB64Cell.textContent = hexToB64(user.userId) || "N/A"
        row.appendChild(idB64Cell)
        const modeCell = document.createElement("td")
        modeCell.textContent = user.mode || "N/A"
        row.appendChild(modeCell)
        usersTable.appendChild(row)
    }
}

(async () => await renderUsers())()

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

for (const [name, example] of Object.entries(examples)) {
    const li = document.createElement("li")
    const a = document.createElement("a")
    a.className = "dropdown-item"
    a.href = "#"
    a.textContent = name
    a.onclick = (e) => {
        e.preventDefault()
        loadExample(example)
    }
    li.appendChild(a)
    testVectorsDropdown.appendChild(li)
}

/* event: load */

window.addEventListener("load", async () => {
    try {
        await generateModeKeys(["attacker", "victim"])
    } catch (error) {
        console.error("Error generating mode keys:", error)
        showStorageError()
    }

    loadExample(examples["ES256 Credential with No Attestation"])
    await parseInterceptParams()
    renderThemeSettings()
    renderStorageSettings()
    initShortcuts()
    renderHistory()
    initializeCopyButtons()

    // Show the appropriate tab based on the current path
    const tab = getTabFromPath()
    showTab(tab)

    // Make tab content visible
    const tabContent = document.querySelector(".tab-content")
    if (tabContent) {
        tabContent.classList.add("loaded")
    }
})

/* event: hashchange */

window.addEventListener("hashchange", async () => {
    await parseInterceptParams()
})

/* path navigation */

const getTabFromPath = () => {
    const path = window.location.pathname
    if (path === "/" || path === "") return "info"
    return path.substring(1)
}

// Listen for Bootstrap tab changes to update URL
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("button[data-bs-toggle='tab']").forEach((button) => {
        button.addEventListener("shown.bs.tab", (event) => {
            const target = event.target.getAttribute("data-bs-target")
            const tab = target.replace("#", "").replace("-tab-pane", "")
            const path = tab === "info" ? "/" : `/${tab}`
            if (window.location.pathname !== path) {
                history.pushState({ tab }, "", path + window.location.hash)
            }
        })
    })
})

// Handle browser back/forward navigation
window.addEventListener("popstate", (event) => {
    const tab = event.state?.tab || getTabFromPath()
    showTab(tab)
})
