import * as editors from "./editors.js"
import { b64urlToUint8, uint8ToB64url } from "./converters.js"

const modifications = {
    create: {
        "Context | Nonsense": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            clientDataJSON.type = "abc.def"
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },
        "Context | Swap": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            clientDataJSON.type = "webauthn.get"
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },
        "Challenge | Bit Flip": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            const challenge = b64urlToUint8(clientDataJSON.challenge)
            challenge[challenge.length - 1] ^= 0x01 // flip the last bit
            clientDataJSON.challenge = uint8ToB64url(challenge)
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },
        "Challenge | Reuse": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            const challenge = prompt("Provide an old challenge to reuse (b64url encoded):") // todo: use history to grab old challenge
            clientDataJSON.challenge = challenge
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },
        "Challenge | Session Binding": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            const challenge = prompt("Provide a challenge from another session (b64url encoded):") // todo: use history to grab challenge from another session
            clientDataJSON.challenge = challenge
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },
        "Origin | Cross Site": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Origin | Cross Origin": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Cross Origin": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Top Origin | Cross Site": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Top Origin | Cross Origin": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "RP ID Hash | Cross Site": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "RP ID Hash | Upscoping": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "RP ID Hash | Downscoping": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "User Present": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "User Verified": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Backup State": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Algorithm": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Credential ID Length": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Credential ID Unused | ID+Pubkey Swap": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Credential ID Unused | ID Swap": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Credential ID Unused | Pubkey Swap": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
    },
    get: {
        "Allow Credentials": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Non-Discoverable Identification": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Discoverable Identification": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Context | Nonsense": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Context | Swap": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Challenge | Bit Flip": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Challenge | Reuse": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Challenge | Session Binding": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Origin | Cross Site": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Origin | Cross Origin": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Cross Origin": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Top Origin | Cross Site": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Top Origin | Cross Origin": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "RP ID Hash | Cross Site": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "RP ID Hash | Upscoping": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "RP ID Hash | Downscoping": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "User Present": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "User Verified": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Backup State": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Backup Eligible | Swap to Off": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Backup Eligible | Swap to On": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Signature": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
        "Signature Counter": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},
    },
}

export const renderModifications = (operation, pkco, origin, mode, crossOrigin, topOrigin, mediation) => {
    interceptorModifications.innerHTML = ""

    for (const [name, action] of Object.entries(modifications[operation])) {
        const check = document.createElement("div")
        check.classList.add("form-check", "ms-3")

        const input = document.createElement("input")
        input.classList.add("form-check-input")
        input.type = "radio"
        input.name = "modification"
        input.id = `modification-${name}`
        input.value = name

        input.addEventListener("change", () => {
            if (input.checked) {
                action(pkco, origin, mode, crossOrigin, topOrigin, mediation)
            }
        })

        const label = document.createElement("label")
        label.classList.add("form-check-label")
        label.setAttribute("for", `modification-${name}`)
        label.textContent = name

        check.appendChild(input)
        check.appendChild(label)
        interceptorModifications.appendChild(check)
    }
}
