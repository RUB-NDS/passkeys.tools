import * as editors from "./editors.js"
import * as encoders from "./encoders.js"
import { showTab, highlightTabs } from "./main.js"
import { algs, getKeys } from "./keys.js"
import { pkccoToAttestation } from "./pkcco.js"
import { pkcroToAssertion } from "./pkcro.js"
import { b64urlToHex, hexToB64url } from "./converters.js"
import { storeUser, getUsers } from "./users.js"
import { renderUsers } from "./main.js"
import { renderModifications } from "./modifications.js"

const updateInterceptorResponseTextarea = (dict) => {
    let response = JSON.parse(interceptorResponseTextarea.value || "{}")
    response = {...response, ...dict}
    interceptorResponseTextarea.value = JSON.stringify(response, null, 2)
}

const addSendButton = (operation) => {
    const sendButton = document.createElement("button")
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
            setTimeout(() => { window.close() }, 1000)
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
        // todo
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
        // todo
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

    select.addEventListener("change", () => {
        const name = select.value
        console.log("Selected Key Name:", name)
        // todo
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
    })

    editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
    editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
}

const applyPkcro = async (pkcro, origin, mode, crossOrigin=undefined, topOrigin=undefined) => {
    console.log("Apply PKCRO:", pkcro, origin, mode, crossOrigin, topOrigin)
    const { clientDataJSON, authenticatorData } = await pkcroToAssertion(pkcro, origin, mode, crossOrigin, topOrigin)

    editors.assertionClientDataJSONDecEditor.on("change", async () => {
        const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
        updateInterceptorResponseTextarea({clientDataJSON: encoders.clientDataJSON(clientDataJSON, "b64url")})
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

    // todo: remove hardcoded values
    updateInterceptorResponseTextarea({
        id: "G1h7XQSGUTk10J7A9QTiJaleLapZfPmbmwo9lXT8tl4",
        userHandle: "Y0dGcFpDNHhNaTVvYTJwNVpHUmtaR1JrWkhjPQ"
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

        loadPkcco(pkcco)
        await storeUserFromPkcco(pkcco, origin, mode)
        await applyPkcco(pkcco, origin, mode, crossOrigin, topOrigin)

        highlightTabs(["create", "attestation", "interceptor"])
        showTab("interceptor")

        interceptorControlsMode.innerText = mode
        interceptorControlsType.innerText = "Attestation / Create"
        interceptorControlsOrigin.innerText = origin
        interceptorControlsCrossOrigin.innerText = crossOrigin || "N/A"
        interceptorControlsTopOrigin.innerText = topOrigin || "N/A"

        await addCredentialIdSelect("create", pkcco.rp.id || (new URL(origin)).hostname, mode)
        await addKeySelect("create", pkcco.rp.id || (new URL(origin)).hostname, mode)
        renderModifications("create")
        addSendButton("create")
    }

    // pkcro
    if (hparams.has("pkcro") && hparams.has("origin") && hparams.has("mode")) {
        const pkcro = JSON.parse(hparams.get("pkcro"))
        const origin = hparams.get("origin")
        const mode = hparams.get("mode")
        const crossOrigin = ["true", "false"].includes(hparams.get("crossOrigin")) ?
            (hparams.get("crossOrigin") == "true" ? true : false) : undefined
        const topOrigin = hparams.get("topOrigin") || undefined

        loadPkcro(pkcro)
        await applyPkcro(pkcro, origin, mode, crossOrigin, topOrigin)

        highlightTabs(["get", "assertion", "interceptor"])
        showTab("interceptor")

        interceptorControlsMode.innerText = mode
        interceptorControlsType.innerText = "Assertion / Get"
        interceptorControlsOrigin.innerText = origin
        interceptorControlsCrossOrigin.innerText = crossOrigin || "N/A"
        interceptorControlsTopOrigin.innerText = topOrigin || "N/A"

        await addUserHandleSelect("get", pkcro.rpId || (new URL(origin)).hostname, mode)
        await addCredentialIdSelect("get", pkcro.rpId || (new URL(origin)).hostname, mode)
        await addKeySelect("get", pkcro.rpId || (new URL(origin)).hostname, mode)
        renderModifications("get")
        addSendButton("get")
    }
}
