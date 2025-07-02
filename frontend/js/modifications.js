import * as editors from "./editors.js"
import { b64urlToUint8, uint8ToB64url } from "./converters.js"

const modifications = {
    create: {
        "Context | Nonsense": () => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            clientDataJSON.type = "abc.def"
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },
        "Context | Swap": () => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            clientDataJSON.type = "webauthn.get"
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },
        "Challenge | Bit Flip": () => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            const challenge = b64urlToUint8(clientDataJSON.challenge)
            challenge[challenge.length - 1] ^= 0x01 // flip the last bit
            clientDataJSON.challenge = uint8ToB64url(challenge)
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },
        "Challenge | Reuse": () => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            const challenge = prompt("Provide an old challenge to reuse (b64url encoded):") // todo: use history to grab old challenge
            clientDataJSON.challenge = challenge
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },
        "Challenge | Session Binding": () => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            const challenge = prompt("Provide a challenge from another session (b64url encoded):") // todo: use history to grab challenge from another session
            clientDataJSON.challenge = challenge
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },
        "Origin | Cross Site": () => {},
        "Origin | Cross Origin": () => {},
        "Cross Origin": () => {},
        "Top Origin | Cross Site": () => {},
        "Top Origin | Cross Origin": () => {},
        "RP ID Hash | Cross Site": () => {},
        "RP ID Hash | Upscoping": () => {},
        "RP ID Hash | Downscoping": () => {},
        "User Present": () => {},
        "User Verified": () => {},
        "Backup State": () => {},
        "Algorithm": () => {},
        "Credential ID Length": () => {},
        "Credential ID Unused | ID+Pubkey Swap": () => {},
        "Credential ID Unused | ID Swap": () => {},
        "Credential ID Unused | Pubkey Swap": () => {},
    },
    get: {
        "Allow Credentials": () => {},
        "Non-Discoverable Identification": () => {},
        "Discoverable Identification": () => {},
        "Context | Nonsense": () => {},
        "Context | Swap": () => {},
        "Challenge | Bit Flip": () => {},
        "Challenge | Reuse": () => {},
        "Challenge | Session Binding": () => {},
        "Origin | Cross Site": () => {},
        "Origin | Cross Origin": () => {},
        "Cross Origin": () => {},
        "Top Origin | Cross Site": () => {},
        "Top Origin | Cross Origin": () => {},
        "RP ID Hash | Cross Site": () => {},
        "RP ID Hash | Upscoping": () => {},
        "RP ID Hash | Downscoping": () => {},
        "User Present": () => {},
        "User Verified": () => {},
        "Backup State": () => {},
        "Backup Eligible | Swap to Off": () => {},
        "Backup Eligible | Swap to On": () => {},
        "Signature": () => {},
        "Signature Counter": () => {},
    },
}

export const renderModifications = (operation) => {
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
            if (input.checked) action()
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
