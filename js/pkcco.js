import { uint8ToHex, strSha256Uint8 } from "./converters.js"
import { generateKey, storeKey, getKey } from "./keys.js"

export const pkccoToAttestation = async (pkcco, origin, crossOrigin=undefined, topOrigin=undefined) => {
    console.log("PKCCO to Attestation:", pkcco, origin, crossOrigin, topOrigin)

    // clientDataJSON
    const clientDataJSON = {}
    clientDataJSON.type = "webauthn.create"
    clientDataJSON.challenge = pkcco.challenge
    clientDataJSON.origin = origin
    if (crossOrigin != undefined) clientDataJSON.crossOrigin = crossOrigin
    if (topOrigin != undefined) clientDataJSON.topOrigin = topOrigin

    // attestationObject
    const attestationObject = {}

    // attestationObject.format
    attestationObject.format = "none"

    // attestationObject.attStmt
    attestationObject.attStmt = {}

    // attestationObject.authData
    attestationObject.authData = {}

    // attestationObject.authData.rpIdHash
    attestationObject.authData.rpIdHash = uint8ToHex(await strSha256Uint8(pkcco.rp.id))

    // attestationObject.authData.flags
    attestationObject.authData.flags = {}
    attestationObject.authData.flags.up = true // user present
    attestationObject.authData.flags.uv = true // user verified
    attestationObject.authData.flags.be = true // backup eligible
    attestationObject.authData.flags.bs = true // backup state
    attestationObject.authData.flags.at = true // attestation credential data included
    attestationObject.authData.flags.ed = false // extension data included

    // attestationObject.authData.signCount
    attestationObject.authData.signCount = 0

    // key for current user and RP
    const keyHandle = `${pkcco.user.name} | ${pkcco.rp.id}`
    let key = undefined
    if (!getKey(keyHandle)) {
        key = await generateKey("ES256")
        storeKey(keyHandle, key)
    } else {
        key = getKey(keyHandle)
    }

    // attestationObject.authData.attestedCredentialData
    attestationObject.authData.attestedCredentialData = {}
    attestationObject.authData.attestedCredentialData.aaguid = "ea9b8d664d011d213ce4b6b48cb575d4" // Google Password Manager
    attestationObject.authData.attestedCredentialData.credentialIdLength = key.credentialId.length / 2 // hex length
    attestationObject.authData.attestedCredentialData.credentialId = key.credentialId // hex
    attestationObject.authData.attestedCredentialData.credentialPublicKey = key.publicKey // JWK

    return { clientDataJSON, attestationObject }
}
