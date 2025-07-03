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
import { addHistoryEntry } from "./history.js"

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
    const buttonDiv = document.createElement("div")
    buttonDiv.className = "mb-2"

    const sendButton = document.createElement("button")
    sendButton.id = `interceptorSendButton`
    sendButton.className = "btn btn-primary w-100"
    sendButton.textContent = "Send Response to Extension"
    sendButton.addEventListener("click", async () => {
        const response = JSON.parse(interceptorResponseTextarea.value || "{}")

        const historyEntry = {
            timestamp: Date.now(),
            mode: interceptorControlsMode.innerText || "",
            type: operation,
            origin: interceptorControlsOrigin.innerText || "",
            status: "resolved",
            info: {
                mode: interceptorControlsMode.innerText || "",
                type: interceptorControlsType.innerText || "",
                origin: interceptorControlsOrigin.innerText || "",
                crossOrigin: interceptorControlsCrossOrigin.innerText || "N/A",
                topOrigin: interceptorControlsTopOrigin.innerText || "N/A",
                mediation: interceptorControlsMediation.innerText || "N/A"
            },
            credentialId: document.querySelector(`#${operation}CredentialIdSelect`)?.value || "",
            key: document.querySelector(`#${operation}KeySelect`)?.value || "",
            userHandle: operation === "get" ? document.querySelector(`#${operation}UserHandleSelect`)?.value || "" : "",
            modification: document.querySelector('input[name="modification"]:checked')?.value || "",
            request: JSON.parse(interceptorRequestTextarea.value || "{}"),
            response: response
        }
        await addHistoryEntry(historyEntry)

        if (window.opener) {
            window.opener.postMessage({
                type: "passkey-interceptor-response",
                operation: operation,
                response: response
            }, "*")
            sendButton.textContent = "Response Sent!"
            sendButton.className = "btn btn-success w-100"
            sendButton.disabled = true
            setTimeout(() => { window.close() }, 200)
        } else {
            sendButton.textContent = "Error: No opener window"
            sendButton.className = "btn btn-danger w-100"
        }
    })
    buttonDiv.appendChild(sendButton)
    interceptorActions.appendChild(buttonDiv)
}

const addRejectButton = (operation) => {
    const buttonDiv = document.createElement("div")
    buttonDiv.className = "mb-2"

    const rejectButton = document.createElement("button")
    rejectButton.id = `interceptorRejectButton`
    rejectButton.className = "btn btn-danger w-100"
    rejectButton.textContent = "Send Reject to Extension"
    rejectButton.addEventListener("click", async () => {
        const response = JSON.parse(interceptorResponseTextarea.value || "{}")

        const historyEntry = {
            timestamp: Date.now(),
            mode: interceptorControlsMode.innerText || "",
            type: operation,
            origin: interceptorControlsOrigin.innerText || "",
            status: "rejected",
            info: {
                mode: interceptorControlsMode.innerText || "",
                type: interceptorControlsType.innerText || "",
                origin: interceptorControlsOrigin.innerText || "",
                crossOrigin: interceptorControlsCrossOrigin.innerText || "N/A",
                topOrigin: interceptorControlsTopOrigin.innerText || "N/A",
                mediation: interceptorControlsMediation.innerText || "N/A"
            },
            credentialId: document.querySelector(`#${operation}CredentialIdSelect`)?.value || "",
            key: document.querySelector(`#${operation}KeySelect`)?.value || "",
            userHandle: operation === "get" ? document.querySelector(`#${operation}UserHandleSelect`)?.value || "" : "",
            modification: document.querySelector('input[name="modification"]:checked')?.value || "",
            request: JSON.parse(interceptorRequestTextarea.value || "{}"),
            response: response
        }
        await addHistoryEntry(historyEntry)

        if (window.opener) {
            window.opener.postMessage({
                type: "passkey-interceptor-reject",
                operation: operation,
                response: response
            }, "*")
            rejectButton.textContent = "Reject Sent!"
            rejectButton.className = "btn btn-success w-100"
            rejectButton.disabled = true
            setTimeout(() => { window.close() }, 200)
        } else {
            rejectButton.textContent = "Error: No opener window"
            rejectButton.className = "btn btn-danger w-100"
        }
    })
    buttonDiv.appendChild(rejectButton)
    interceptorActions.appendChild(buttonDiv)
}

const addDismissButton = (operation) => {
    const buttonDiv = document.createElement("div")
    buttonDiv.className = "mb-2"

    const dismissButton = document.createElement("button")
    dismissButton.id = `interceptorDismissButton`
    dismissButton.className = "btn btn-secondary w-100"
    dismissButton.textContent = "Dismiss"
    dismissButton.addEventListener("click", async () => {
        const response = JSON.parse(interceptorResponseTextarea.value || "{}")

        const historyEntry = {
            timestamp: Date.now(),
            mode: interceptorControlsMode.innerText || "",
            type: operation,
            origin: interceptorControlsOrigin.innerText || "",
            status: "dismissed",
            info: {
                mode: interceptorControlsMode.innerText || "",
                type: interceptorControlsType.innerText || "",
                origin: interceptorControlsOrigin.innerText || "",
                crossOrigin: interceptorControlsCrossOrigin.innerText || "N/A",
                topOrigin: interceptorControlsTopOrigin.innerText || "N/A",
                mediation: interceptorControlsMediation.innerText || "N/A"
            },
            credentialId: document.querySelector(`#${operation}CredentialIdSelect`)?.value || "",
            key: document.querySelector(`#${operation}KeySelect`)?.value || "",
            userHandle: operation === "get" ? document.querySelector(`#${operation}UserHandleSelect`)?.value || "" : "",
            modification: document.querySelector('input[name="modification"]:checked')?.value || "",
            request: JSON.parse(interceptorRequestTextarea.value || "{}"),
            response: response
        }
        await addHistoryEntry(historyEntry)

        dismissButton.textContent = "Dismissed!"
        dismissButton.className = "btn btn-success w-100"
        dismissButton.disabled = true
        setTimeout(() => { window.close() }, 200)
    })
    buttonDiv.appendChild(dismissButton)
    interceptorActions.appendChild(buttonDiv)
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

    const option = document.createElement("option")
    option.value = "ab1a67b5ada09a0d26d10494ec41c79ef1284ce1e89f9295d8a3442e8721a4f1121a2c7bd23f3ade56a5c7ffc5f52e9c83fd046cba3fd7e93aab49b021572899b109dec079b4a95ae94ac9c5e097527ae6dfff985e54c8c7ee93c743cda192bfd33543787fcf522da34f577ca5dea1391f9e6e90668636720d3db00a6c1f82a7033abd93cd4d26045e5e3e7c88f5e176d7f21e709cef75c60604e9b901acdba2be9005520b092ce3a97bcfa74c97890cd7b4dca9b6864af0c6f2d907817f09d090067077c5c87087da83acba8049b78b7e9e9f425a19f2aa24dcf4da2654b4f93fe08b74a458c96b0c91781d417b35fe25edac746e3f3165da26b545a3e115c8683e0115a35b97e15d972decd0c22be7860aa5c95b24a856ed8b3d36f86c4f0f895f4a948977982c28970547dd314aba2df7003a072859d2d69c67e8496fc8e6fdcffac18a7af48eb50a1a889d5610ac7e93ef440bf67f4fdcca9b0974459b27bfa1c4c033cb85d6f1b1a1fc0dbd9c21e3c05fb24b78996b4034528fd3c71d2a8da2c90afe251250d1eb0d37693d7c1d2acbe753b958515d8d7f2956fa6aef5fe735b7c9f96d8c8f0bd8a43da567ad89d94d8a833f44922accd9ba426516b7d2428960db34ad25908b4835947d74228b1e0b0018b2097ca1cc4b20ee84e7db43a225cc73a4455b224d5e07b3316406b75b8d3db3b2c033a54d692db79af976e707c91bdeb676363f1d65152c66b0bd268262e8d0ec3e94c3ec9b31c091c9a4d37d54ab858ee945a054776a2f7aa050bbd02b2b75c1b228e67ae3826e3fa3a77a4dc6d0fc9891aa208b3c7f352e677b6c345288f3619aa31969262471f317ecb2c7930bc9b445f4e925f9e27e6f67652952fb510bcc749b92dcfac03bba009923e506ef12b7ee197645d9698ae883ba890eb0dd15f662179b7bb1813317b743a2d56dcebbd0d06098ae489cf56a2c94c754aae4b1461657d4200a8af23fa0f0fcce053e46b5834413221df322db4d2774b34c113bce0cd151f6a00c0525ecef5c234498eebaf8624611b49b02fb53fa71e4179a62b176697287aeeffef49effefbb29901f212a55f4c534cb736d168b987937a459434d515f842af569e1d02e9381983829a2e81bebf9680075de75e58429341ba28971102352f19bce038d8bddde10430e8cc8fb374188e7cf7ea4f910fb6ad4603d7e83ceebf84db31c117cfa8c96930a19dd7e81d622f78f884799e8fafaf4ed2cb3fd41e01f977b532b84fcd6c32f8b34929b202430b6566cad818604a8ac8038b3bcd729ce0d59acd086e739d4a058729f6dfc774dcd9c3652728d66b58cda9bd38f7ebc9c7222e93b482865fbfedef8f7383e4c2514f78bcae1fbc63849f769c6a9c71c244de2b6144e7cb5944e186c1e2e5d84ec2b9cba0cbb124468b01e814fe271d8c40c47e908b308"
    option.text = "1024 byte test"
    select.appendChild(option)

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
        addRejectButton("create")
        addDismissButton("create")

        // modifications
        renderModifications("create", pkcco, origin, mode, crossOrigin, topOrigin, mediation)

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
        addRejectButton("get")
        addDismissButton("get")

        // modifications
        renderModifications("get", pkcro, origin, mode, crossOrigin, topOrigin, mediation)

        await applyPkcro(pkcro, origin, mode, crossOrigin, topOrigin)

        highlightTabs(["get", "assertion", "interceptor"])
        showTab("interceptor")
    }
}
