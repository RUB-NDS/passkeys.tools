import * as editors from "./editors.js"
import * as encoders from "./encoders.js"
import * as decoders from "./decoders.js"
import { b64urlToHex, hexToB64url } from "./converters.js"

/* attestation -> clientDataJSON */

const encodeAttestationClientDataJSON = () => {
    const data = editors.attestationClientDataJSONDecEditor.getValue()
    const b64url = encoders.clientDataJSON(data, "b64url")
    attestationClientDataJSONEncB64urlTextarea.value = b64url
    const hex = encoders.clientDataJSON(data, "hex")
    attestationClientDataJSONEncHexTextarea.value = hex
}

const decodeAttestationClientDataJSON = () => {
    const b64url = attestationClientDataJSONEncB64urlTextarea.value
    const data = decoders.clientDataJSON(b64url, "b64url")
    editors.attestationClientDataJSONDecEditor.setValue(data)
}

attestationClientDataJSONEncB64urlTextarea.oninput = () => {
    attestationClientDataJSONEncHexTextarea.value = b64urlToHex(attestationClientDataJSONEncB64urlTextarea.value)
    decodeAttestationClientDataJSON()
}

attestationClientDataJSONEncHexTextarea.oninput = () => {
    attestationClientDataJSONEncB64urlTextarea.value = hexToB64url(attestationClientDataJSONEncHexTextarea.value)
    decodeAttestationClientDataJSON()
}

editors.attestationClientDataJSONDecEditor.on("change", () => {
    encodeAttestationClientDataJSON()
})

/* attestation -> attestationObject */

const encodeAttestationAttestationObject = () => {
    const data = editors.attestationAttestationObjectDecEditor.getValue()
    const b64url = encoders.attestationObject(data, "b64url")
    attestationAttestationObjectEncB64urlTextarea.value = b64url
    const hex = encoders.attestationObject(data, "hex")
    attestationAttestationObjectEncHexTextarea.value = hex
}

const decodeAttestationAttestationObject = () => {
    const b64url = attestationAttestationObjectEncB64urlTextarea.value
    const data = decoders.attestationObject(b64url, "b64url")
    editors.attestationAttestationObjectDecEditor.setValue(data)
}

attestationAttestationObjectEncB64urlTextarea.oninput = () => {
    attestationAttestationObjectEncHexTextarea.value = b64urlToHex(attestationAttestationObjectEncB64urlTextarea.value)
    decodeAttestationAttestationObject()
}

attestationAttestationObjectEncHexTextarea.oninput = () => {
    attestationAttestationObjectEncB64urlTextarea.value = hexToB64url(attestationAttestationObjectEncHexTextarea.value)
    decodeAttestationAttestationObject()
}

editors.attestationAttestationObjectDecEditor.on("change", () => {
    encodeAttestationAttestationObject()
})

/* assertion -> clientDataJSON */

const encodeAssertionClientDataJSON = () => {
    const data = editors.assertionClientDataJSONDecEditor.getValue()
    const b64url = encoders.clientDataJSON(data, "b64url")
    assertionClientDataJSONEncB64urlTextarea.value = b64url
    const hex = encoders.clientDataJSON(data, "hex")
    assertionClientDataJSONEncHexTextarea.value = hex
}

const decodeAssertionClientDataJSON = () => {
    const b64url = assertionClientDataJSONEncB64urlTextarea.value
    const data = decoders.clientDataJSON(b64url, "b64url")
    editors.assertionClientDataJSONDecEditor.setValue(data)
}

assertionClientDataJSONEncB64urlTextarea.oninput = () => {
    assertionClientDataJSONEncHexTextarea.value = b64urlToHex(assertionClientDataJSONEncB64urlTextarea.value)
    decodeAssertionClientDataJSON()
}

assertionClientDataJSONEncHexTextarea.oninput = () => {
    assertionClientDataJSONEncB64urlTextarea.value = hexToB64url(assertionClientDataJSONEncHexTextarea.value)
    decodeAssertionClientDataJSON()
}

editors.assertionClientDataJSONDecEditor.on("change", () => {
    encodeAssertionClientDataJSON()
})

/* assertion -> authenticatorData */

const encodeAssertionAuthenticatorData = () => {
    const data = editors.assertionAuthenticatorDataDecEditor.getValue()
    const b64url = encoders.authenticatorData(data, "b64url")
    assertionAuthenticatorDataEncB64urlTextarea.value = b64url
    const hex = encoders.authenticatorData(data, "hex")
    assertionAuthenticatorDataEncHexTextarea.value = hex
}

const decodeAssertionAuthenticatorData = () => {
    const b64url = assertionAuthenticatorDataEncB64urlTextarea.value
    const data = decoders.authenticatorData(b64url, "b64url")
    editors.assertionAuthenticatorDataDecEditor.setValue(data)
}

assertionAuthenticatorDataEncB64urlTextarea.oninput = () => {
    assertionAuthenticatorDataEncHexTextarea.value = b64urlToHex(assertionAuthenticatorDataEncB64urlTextarea.value)
    decodeAssertionAuthenticatorData()
}

assertionAuthenticatorDataEncHexTextarea.oninput = () => {
    assertionAuthenticatorDataEncB64urlTextarea.value = hexToB64url(assertionAuthenticatorDataEncHexTextarea.value)
    decodeAssertionAuthenticatorData()
}

editors.assertionAuthenticatorDataDecEditor.on("change", () => {
    encodeAssertionAuthenticatorData()
})
