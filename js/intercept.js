import * as editors from "./editors.js"
import { pkccoToAttestation } from "./pkcco.js"
import { pkcroToAssertion } from "./pkcro.js"
import { uint8ToHex } from "./converters.js"

const loadPkcco = (pkcco) => {
    console.log("Load PKCCO:", pkcco)
    editors.createEditor.setValue(pkcco)
}

const loadPkcro = (pkcro) => {
    console.log("Load PKCRO:", pkcro)
    editors.getEditor.setValue(pkcro)
}

const applyPkcco = async (pkcco, origin, crossOrigin=undefined, topOrigin=undefined) => {
    console.log("Apply PKCCO:", pkcco, origin, crossOrigin, topOrigin)
    const { clientDataJSON, attestationObject } = await pkccoToAttestation(pkcco, origin, crossOrigin, topOrigin)
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

    // create + get forms
    if (hparams.has("pkcco")) {
        const pkcco = JSON.parse(hparams.get("pkcco"))
        loadPkcco(pkcco)
    } else if (hparams.has("pkcro")) {
        const pkcro = JSON.parse(hparams.get("pkcro"))
        loadPkcro(pkcro)
    }

    // attestation + assertion forms
    if (hparams.has("pkcco") && hparams.has("origin")) {
        const pkcco = JSON.parse(hparams.get("pkcco"))
        const origin = hparams.get("origin")
        const crossOrigin = ["true", "false"].includes(hparams.get("crossOrigin")) ?
            (hparams.get("crossOrigin") == "true" ? true : false) : undefined
        const topOrigin = hparams.get("topOrigin") || undefined
        await applyPkcco(pkcco, origin, crossOrigin, topOrigin)
    } else if (hparams.has("pkcro") && hparams.has("origin")) {
        const pkcro = JSON.parse(hparams.get("pkcro"))
        const origin = hparams.get("origin")
        const crossOrigin = ["true", "false"].includes(hparams.get("crossOrigin")) ?
            (hparams.get("crossOrigin") == "true" ? true : false) : undefined
        const topOrigin = hparams.get("topOrigin") || undefined
        await applyPkcro(pkcro, origin, crossOrigin, topOrigin)
    }
}
