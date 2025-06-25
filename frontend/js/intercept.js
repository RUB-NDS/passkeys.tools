import * as editors from "./editors.js"
import * as encoders from "./encoders.js"
import { showTab, highlightTabs } from "./main.js"
import { algs, getKeys, getKey, getNameFromPublicKey, getNameFromCredentialId } from "./keys.js"
import { pkccoToAttestation } from "./pkcco.js"
import { pkcroToAssertion } from "./pkcro.js"
import { b64urlToHex, hexToB64url, uint8ToHex, strSha256Uint8 } from "./converters.js"
import { storeUser, getUsers, getUserByRpIdAndMode } from "./users.js"
import { renderUsers } from "./main.js"
import { renderModifications } from "./modifications.js"

const addCopyAsJsonButton = (data) => {
    const overviewHeader = interceptorControls.querySelector("h4")
    if (!overviewHeader || overviewHeader.textContent !== "Overview") return

    if (interceptorControls.querySelector("#copyAsJsonBtn")) return

    const copyBtn = document.createElement("button")
    copyBtn.id = "copyAsJsonBtn"
    copyBtn.className = "btn btn-sm btn-secondary ms-2"
    copyBtn.textContent = "Copy as JSON"
    copyBtn.style.verticalAlign = "middle"

    copyBtn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
        copyBtn.textContent = "Copied!"
        copyBtn.className = "btn btn-sm btn-success ms-2"
        setTimeout(() => {
            copyBtn.textContent = "Copy as JSON"
            copyBtn.className = "btn btn-sm btn-secondary ms-2"
        }, 2000)
    })

    overviewHeader.appendChild(copyBtn)
}

const updateInterceptorResponseTextarea = (dict) => {
    let response = JSON.parse(interceptorResponseTextarea.value || "{}")
    response = {...response, ...dict}
    interceptorResponseTextarea.value = JSON.stringify(response, null, 2)
}

const addSendButton = (operation) => {
    const sendButton = document.createElement("button")
    sendButton.id = `interceptorSendButton`
    sendButton.className = "btn btn-primary"
    sendButton.textContent = "Send Response to Extension"
    sendButton.addEventListener("click", () => {
        const response = JSON.parse(interceptorResponseTextarea.value || "{}")
        if (window.opener) {
            window.opener.postMessage({
                type: "passkey-interceptor-response",
                operation: operation,
                response: response
            }, "*")
            sendButton.textContent = "Response Sent!"
            sendButton.className = "btn btn-success"
            sendButton.disabled = true
            setTimeout(() => { window.close() }, 200)
        } else {
            sendButton.textContent = "Error: No opener window"
            sendButton.className = "btn btn-danger"
        }
    })
    interceptorActions.appendChild(sendButton)
}

const addUserHandleSelect = async (operation, rpId, mode) => {
    const div = document.createElement("div")
    div.classList.add("input-group", "mb-3")

    const span = document.createElement("span")
    span.classList.add("input-group-text")
    span.textContent = "User Handle"
    div.appendChild(span)

    const select = document.createElement("select")
    select.id = `${operation}UserHandleSelect`
    select.className = "form-select"
    select.size = "3"

    const users = await getUsers()
    for (const [userId, user] of Object.entries(users)) {
        if (user.rpId !== rpId) continue // only show users for the relevant rpId
        const option = document.createElement("option")
        option.value = userId
        option.text = user.name || user.displayName || `${user.userId.slice(0, 6)}...`
        select.appendChild(option)
    }

    select.addEventListener("change", () => {
        const userId = select.value
        console.log("Selected User ID:", userId)
        if (operation === "create") {
            // there is no user handle in create operation, so we do nothing
        } else if (operation === "get") {
            updateInterceptorResponseTextarea({userHandle: hexToB64url(userId)})
        }
    })

    div.appendChild(select)
    interceptorActions.appendChild(div)
}

const addCredentialIdSelect = async (operation, rpId, mode) => {
    const div = document.createElement("div")
    div.classList.add("input-group", "mb-3")

    const span = document.createElement("span")
    span.classList.add("input-group-text")
    span.textContent = "Credential ID"
    div.appendChild(span)

    const select = document.createElement("select")
    select.id = `${operation}CredentialIdSelect`
    select.className = "form-select"
    select.size = "3"

    const keys = await getKeys()
    for (const [name, key] of Object.entries(keys)) {
        const split = name.split(" | ")
        if (mode === "attacker" || mode === "victim") {
            if (split[0] !== "attacker" && split[0] !== "victim") {
                continue // only show attacker and victim keys in this mode
            }
        } else {
            if (split[0] !== rpId) {
                continue // only show keys for the relevant rpId in this mode
            }
        }
        const option = document.createElement("option")
        option.value = key.credentialId
        option.text = name || `${key.credentialId.slice(0, 6)}...`
        select.appendChild(option)
    }

    select.addEventListener("change", () => {
        const credentialId = select.value
        console.log("Selected Credential ID:", credentialId)
        if (operation === "create") {
            const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
            attestationObject.authData.attestedCredentialData.credentialId = credentialId
            attestationObject.authData.attestedCredentialData.credentialIdLength = credentialId.length / 2 // hex to bytes
            editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
        } else if (operation === "get") {
            updateInterceptorResponseTextarea({id: hexToB64url(credentialId)})
        }
    })

    div.appendChild(select)
    interceptorActions.appendChild(div)
}

const addKeySelect = async (operation, rpId, mode) => {
    const div = document.createElement("div")
    div.classList.add("input-group", "mb-3")

    const span = document.createElement("span")
    span.classList.add("input-group-text")
    span.textContent = "Key"
    div.appendChild(span)

    const select = document.createElement("select")
    select.id = `${operation}KeySelect`
    select.className = "form-select"
    select.size = "3"

    const keys = await getKeys()
    for (const [name, key] of Object.entries(keys)) {
        const split = name.split(" | ")
        if (mode === "attacker" || mode === "victim") {
            if (split[0] !== "attacker" && split[0] !== "victim") {
                continue // only show attacker and victim keys in this mode
            }
        } else {
            if (split[0] !== rpId) {
                continue // only show keys for the relevant rpId in this mode
            }
        }
        const option = document.createElement("option")
        option.value = name
        option.text = name
        select.appendChild(option)
    }

    select.addEventListener("change", async () => {
        const name = select.value
        console.log("Selected Key Name:", name)
        if (operation === "create") {
            const key = await getKey(name)
            const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
            attestationObject.authData.attestedCredentialData.credentialPublicKey = key.publicKey
            editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
        } else if (operation === "get") {
            signAssertionWithStoredKeySelect.value = name
            verifyAssertionWithStoredKeySelect.value = name
            signAssertionWithStoredKeyBtn.click() // resign on key change
        }
    })

    div.appendChild(select)
    interceptorActions.appendChild(div)
}

const loadPkcco = (pkcco) => {
    console.log("Load PKCCO:", pkcco)
    editors.createEditor.on("change", async () => {
        interceptorRequestTextarea.value = JSON.stringify(editors.createEditor.getValue(), null, 2)
    })
    editors.createEditor.setValue(pkcco)
}

const storeUserFromPkcco = async (pkcco, origin, mode) => {
    console.log("Store User from PKCCO:", pkcco, origin, mode)
    const rpId = pkcco.rp.id || (new URL(origin)).hostname
    const userId = b64urlToHex(pkcco.user.id) || ""
    const userName = pkcco.user.name || ""
    const userDisplayName = pkcco.user.displayName || ""
    const user = { rpId, userId, name: userName, displayName: userDisplayName, mode }
    await storeUser(userId, user)
    await renderUsers()
}

const loadPkcro = (pkcro) => {
    console.log("Load PKCRO:", pkcro)
    editors.getEditor.on("change", async () => {
        interceptorRequestTextarea.value = JSON.stringify(editors.getEditor.getValue(), null, 2)
    })
    editors.getEditor.setValue(pkcro)
}

const applyPkcco = async (pkcco, origin, mode, crossOrigin=undefined, topOrigin=undefined) => {
    console.log("Apply PKCCO:", pkcco, origin, mode, crossOrigin, topOrigin)
    const { clientDataJSON, attestationObject } = await pkccoToAttestation(pkcco, origin, mode, crossOrigin, topOrigin)

    editors.attestationClientDataJSONDecEditor.on("change", async () => {
        const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
        updateInterceptorResponseTextarea({clientDataJSON: encoders.clientDataJSON(clientDataJSON, "b64url")})
    })

    editors.attestationAttestationObjectDecEditor.on("change", async () => {
        const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
        updateInterceptorResponseTextarea({
            attestationObject: encoders.attestationObject(attestationObject, "b64url"),
            authenticatorData: encoders.attestationObject(attestationObject, "b64url", "authData")
        })

        const jwk = attestationObject.authData.attestedCredentialData.credentialPublicKey
        const jwkDerB64url = await encoders.keys(jwk, "der", "b64url")
        updateInterceptorResponseTextarea({publicKey: jwkDerB64url})

        const alg = attestationObject.authData.attestedCredentialData.credentialPublicKey.alg
        updateInterceptorResponseTextarea({publicKeyAlgorithm: algs[alg]})

        const id = attestationObject.authData.attestedCredentialData.credentialId
        updateInterceptorResponseTextarea({id: hexToB64url(id)})

        const idOption = document.querySelector(`#createCredentialIdSelect option[value="${id}"]`)
        if (idOption) idOption.selected = true

        const name = await getNameFromPublicKey(jwk)
        const nameOption = document.querySelector(`#createKeySelect option[value="${name}"]`)
        if (nameOption) nameOption.selected = true
    })

    editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
    editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
}

const applyPkcro = async (pkcro, origin, mode, crossOrigin=undefined, topOrigin=undefined) => {
    console.log("Apply PKCRO:", pkcro, origin, mode, crossOrigin, topOrigin)
    const { clientDataJSON, authenticatorData } = await pkcroToAssertion(pkcro, origin, mode, crossOrigin, topOrigin)

    // default user handle
    if (mode === "attacker" || mode === "victim") {
        const user = await getUserByRpIdAndMode(pkcro.rpId || (new URL(origin)).hostname, mode)
        if (user) {
            const userOption = document.querySelector(`#getUserHandleSelect option[value="${user.userId}"]`)
            if (userOption) {
                userOption.selected = true
                getUserHandleSelect.dispatchEvent(new Event("change"))
            }
        }
    }

    // mirror key select in assertion to interceptor
    signAssertionWithStoredKeySelect.addEventListener("change", async () => {
        const name = signAssertionWithStoredKeySelect.value
        const keyOption = document.querySelector(`#getKeySelect option[value="${name}"]`)
        if (keyOption) keyOption.selected = true
        const id = await getKey(name).then(key => key.credentialId)
        const idOption = document.querySelector(`#getCredentialIdSelect option[value="${id}"]`)
        if (idOption) idOption.selected = true
    })

    // default key is the first allow credentials key
    const allowCredentials = pkcro.allowCredentials || []
    if (allowCredentials.length > 0) {
        const defaultId = allowCredentials[0].id
        updateInterceptorResponseTextarea({id: defaultId})
        const defaultName = await getNameFromCredentialId(b64urlToHex(defaultId))
        if (defaultName) {
            verifyAssertionWithStoredKeySelect.value = defaultName
            verifyAssertionWithStoredKeySelect.dispatchEvent(new Event("change"))
            signAssertionWithStoredKeySelect.value = defaultName
            signAssertionWithStoredKeySelect.dispatchEvent(new Event("change"))
        }
    }

    editors.assertionClientDataJSONDecEditor.on("change", async () => {
        const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
        updateInterceptorResponseTextarea({clientDataJSON: encoders.clientDataJSON(clientDataJSON, "b64url")})
        const hash = uint8ToHex(await strSha256Uint8(JSON.stringify(clientDataJSON)))
        attestationClientDataJSONHashHexTextarea.value = hash
        signAssertionWithStoredKeyBtn.click() // resign on clientDataJSON change
    })

    editors.assertionAuthenticatorDataDecEditor.on("change", async () => {
        const authenticatorData = editors.assertionAuthenticatorDataDecEditor.getValue()
        updateInterceptorResponseTextarea({authenticatorData: encoders.authenticatorData(authenticatorData, "b64url")})
        signAssertionWithStoredKeyBtn.click() // resign on authenticatorData change
    })

    assertionSignatureEncB64urlTextarea.addEventListener("input", () => {
        const signature = assertionSignatureEncB64urlTextarea.value
        updateInterceptorResponseTextarea({signature: signature})
    })

    editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
    editors.assertionAuthenticatorDataDecEditor.setValue(authenticatorData)
}

export const parseInterceptParams = async () => {
    const hash = window.location.hash.substring(1)
    const hparams = new URLSearchParams(hash)

    // pkcco
    if (hparams.has("pkcco") && hparams.has("origin") && hparams.has("mode")) {
        const pkcco = JSON.parse(hparams.get("pkcco"))
        const origin = hparams.get("origin")
        const mode = hparams.get("mode")
        const crossOrigin = ["true", "false"].includes(hparams.get("crossOrigin")) ?
            (hparams.get("crossOrigin") == "true" ? true : false) : undefined
        const topOrigin = hparams.get("topOrigin") || undefined
        const mediation = hparams.get("mediation") || undefined

        loadPkcco(pkcco)
        await storeUserFromPkcco(pkcco, origin, mode)

        // overview
        interceptorControlsMode.innerText = mode
        interceptorControlsType.innerText = "Attestation / Create"
        interceptorControlsOrigin.innerText = origin
        interceptorControlsCrossOrigin.innerText = crossOrigin || "N/A"
        interceptorControlsTopOrigin.innerText = topOrigin || "N/A"
        interceptorControlsMediation.innerText = mediation || "N/A"
        addCopyAsJsonButton({
            origin: origin,
            crossOrigin: crossOrigin || "N/A",
            topOrigin: topOrigin || "N/A",
            mediation: mediation || "N/A"
        })

        // actions
        interceptorActions.innerHTML = ""
        await addCredentialIdSelect("create", pkcco.rp.id || (new URL(origin)).hostname, mode)
        await addKeySelect("create", pkcco.rp.id || (new URL(origin)).hostname, mode)
        addSendButton("create")

        // modifications
        renderModifications("create")

        await applyPkcco(pkcco, origin, mode, crossOrigin, topOrigin)

        highlightTabs(["create", "attestation", "interceptor"])
        showTab("interceptor")
    }

    // pkcro
    if (hparams.has("pkcro") && hparams.has("origin") && hparams.has("mode")) {
        const pkcro = JSON.parse(hparams.get("pkcro"))
        const origin = hparams.get("origin")
        const mode = hparams.get("mode")
        const crossOrigin = ["true", "false"].includes(hparams.get("crossOrigin")) ?
            (hparams.get("crossOrigin") == "true" ? true : false) : undefined
        const topOrigin = hparams.get("topOrigin") || undefined
        const mediation = hparams.get("mediation") || undefined

        loadPkcro(pkcro)

        // overview
        interceptorControlsMode.innerText = mode
        interceptorControlsType.innerText = "Assertion / Get"
        interceptorControlsOrigin.innerText = origin
        interceptorControlsCrossOrigin.innerText = crossOrigin || "N/A"
        interceptorControlsTopOrigin.innerText = topOrigin || "N/A"
        interceptorControlsMediation.innerText = mediation || "N/A"
        addCopyAsJsonButton({
            origin: origin,
            crossOrigin: crossOrigin || "N/A",
            topOrigin: topOrigin || "N/A",
            mediation: mediation || "N/A"
        })

        // actions
        interceptorActions.innerHTML = ""
        await addUserHandleSelect("get", pkcro.rpId || (new URL(origin)).hostname, mode)
        await addCredentialIdSelect("get", pkcro.rpId || (new URL(origin)).hostname, mode)
        await addKeySelect("get", pkcro.rpId || (new URL(origin)).hostname, mode)
        addSendButton("get")

        // modifications
        renderModifications("get")

        await applyPkcro(pkcro, origin, mode, crossOrigin, topOrigin)

        highlightTabs(["get", "assertion", "interceptor"])
        showTab("interceptor")
    }
}
