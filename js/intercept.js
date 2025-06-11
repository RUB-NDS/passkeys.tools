import * as editors from "./editors.js"
import * as encoders from "./encoders.js"
import { showTab } from "./main.js"
import { algs } from "./keys.js"
import { pkccoToAttestation } from "./pkcco.js"
import { pkcroToAssertion } from "./pkcro.js"
import { uint8ToHex } from "./converters.js"

const updateInterceptorResponseTextarea = (dict) => {
    let response = JSON.parse(interceptorResponseTextarea.value || "{}")
    response = {...response, ...dict}
    interceptorResponseTextarea.value = JSON.stringify(response, null, 2)
}

const loadPkcco = (pkcco) => {
    console.log("Load PKCCO:", pkcco)
    editors.createEditor.on("change", async () => {
        interceptorRequestTextarea.value = JSON.stringify(editors.createEditor.getValue(), null, 2)
    })
    editors.createEditor.setValue(pkcco)
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
}

const applyPkcro = async (pkcro, origin, crossOrigin=undefined, topOrigin=undefined) => {
    console.log("Apply PKCRO:", pkcro, origin, crossOrigin, topOrigin)
    const { clientDataJSON, authenticatorData, signature } = await pkcroToAssertion(pkcro, origin, crossOrigin, topOrigin)
    editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
    editors.assertionAuthenticatorDataDecEditor.setValue(authenticatorData)
    assertionSignatureEncHexTextarea.value = uint8ToHex(signature)
    assertionSignatureEncHexTextarea.dispatchEvent(new Event("input"))
}

export const parseInterceptParams = async () => {
    const hash = window.location.hash.substring(1)
    const hparams = new URLSearchParams(hash)

    // pkcco
    if (hparams.has("pkcco") && hparams.has("origin")) {
        const pkcco = JSON.parse(hparams.get("pkcco"))
        const origin = hparams.get("origin")
        const crossOrigin = ["true", "false"].includes(hparams.get("crossOrigin")) ?
            (hparams.get("crossOrigin") == "true" ? true : false) : undefined
        const topOrigin = hparams.get("topOrigin") || undefined

        loadPkcco(pkcco)
        await applyPkcco(pkcco, origin, crossOrigin, topOrigin)

        showTab("interceptor")
    }

    // pkcro
    if (hparams.has("pkcro") && hparams.has("origin")) {
        const pkcro = JSON.parse(hparams.get("pkcro"))
        const origin = hparams.get("origin")
        const crossOrigin = ["true", "false"].includes(hparams.get("crossOrigin")) ?
            (hparams.get("crossOrigin") == "true" ? true : false) : undefined
        const topOrigin = hparams.get("topOrigin") || undefined

        loadPkcro(pkcro)
        await applyPkcro(pkcro, origin, crossOrigin, topOrigin)

        showTab("interceptor")
    }
}
