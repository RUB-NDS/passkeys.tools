import * as editors from "./editors.js"
import * as encoders from "./encoders.js"
import { showTab, highlightTabs } from "./main.js"
import { algs } from "./keys.js"
import { pkccoToAttestation } from "./pkcco.js"
import { pkcroToAssertion } from "./pkcro.js"
import { uint8ToB64url, b64urlToHex } from "./converters.js"
import { storeUser } from "./users.js"
import { renderUsers } from "./main.js"

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

        // Send message to opener window
        if (window.opener) {
            window.opener.postMessage({
                type: "passkey-interceptor-response",
                operation: operation,
                response: response
            }, "*")

            // Update button to show success
            sendButton.textContent = "Response Sent!"
            sendButton.className = "btn btn-success"
            sendButton.disabled = true

            // Close window after a short delay
            setTimeout(() => { window.close() }, 1000)
        } else {
            sendButton.textContent = "Error: No opener window"
            sendButton.className = "btn btn-danger"
        }
    })

    interceptorControlsActions.appendChild(sendButton)
}

const loadPkcco = (pkcco) => {
    console.log("Load PKCCO:", pkcco)
    editors.createEditor.on("change", async () => {
        interceptorRequestTextarea.value = JSON.stringify(editors.createEditor.getValue(), null, 2)
    })
    editors.createEditor.setValue(pkcco)
}

const loadUserFromPkcco = async (pkcco, origin, mode) => {
    console.log("Load User from PKCCO:", pkcco, origin, mode)
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

const applyPkcco = async (pkcco, origin, crossOrigin=undefined, topOrigin=undefined) => {
    console.log("Apply PKCCO:", pkcco, origin, crossOrigin, topOrigin)
    const { clientDataJSON, attestationObject } = await pkccoToAttestation(pkcco, origin, crossOrigin, topOrigin)

    updateInterceptorResponseTextarea({id: pkcco.user.id})

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
        updateInterceptorResponseTextarea({publicKeyAlgorithm: algs[alg] || 0})
    })

    editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
    editors.attestationAttestationObjectDecEditor.setValue(attestationObject)

    addSendButton("create")
}

const applyPkcro = async (pkcro, origin, crossOrigin=undefined, topOrigin=undefined) => {
    console.log("Apply PKCRO:", pkcro, origin, crossOrigin, topOrigin)
    const { clientDataJSON, authenticatorData, signature } = await pkcroToAssertion(pkcro, origin, crossOrigin, topOrigin)

    // todo: select credential and user handle from ui
    updateInterceptorResponseTextarea({
        id: pkcro.allowCredentials?.[0]?.id || "TODO",
        userHandle: "TODO"
    })

    const updateSignatureFromTextarea = () => {
        const signatureB64url = assertionSignatureEncB64urlTextarea.value
        updateInterceptorResponseTextarea({signature: signatureB64url})
    }

    editors.assertionClientDataJSONDecEditor.on("change", async () => {
        const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
        updateInterceptorResponseTextarea({clientDataJSON: encoders.clientDataJSON(clientDataJSON, "b64url")})
        updateSignatureFromTextarea()
    })

    editors.assertionAuthenticatorDataDecEditor.on("change", async () => {
        const authenticatorData = editors.assertionAuthenticatorDataDecEditor.getValue()
        updateInterceptorResponseTextarea({authenticatorData: encoders.authenticatorData(authenticatorData, "b64url")})
        updateSignatureFromTextarea()
    })

    assertionSignatureEncB64urlTextarea.addEventListener("input", () => {
        updateSignatureFromTextarea()
    })

    editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
    editors.assertionAuthenticatorDataDecEditor.setValue(authenticatorData)
    assertionSignatureEncB64urlTextarea.value = uint8ToB64url(signature)
    assertionSignatureEncB64urlTextarea.dispatchEvent(new Event("input"))

    addSendButton("get")
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
        await loadUserFromPkcco(pkcco, origin, hparams.get("mode") || "")
        await applyPkcco(pkcco, origin, crossOrigin, topOrigin)

        highlightTabs(["create", "attestation", "interceptor"])
        showTab("interceptor")

        interceptorControlsMode.innerText = mode
        interceptorControlsType.innerText = "Attestation / Create"
        interceptorControlsOrigin.innerText = origin
        interceptorControlsCrossOrigin.innerText = crossOrigin || "N/A"
        interceptorControlsTopOrigin.innerText = topOrigin || "N/A"
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
        await applyPkcro(pkcro, origin, crossOrigin, topOrigin)

        highlightTabs(["get", "assertion", "interceptor"])
        showTab("interceptor")

        interceptorControlsMode.innerText = mode
        interceptorControlsType.innerText = "Assertion / Get"
        interceptorControlsOrigin.innerText = origin
        interceptorControlsCrossOrigin.innerText = crossOrigin || "N/A"
        interceptorControlsTopOrigin.innerText = topOrigin || "N/A"
    }
}
