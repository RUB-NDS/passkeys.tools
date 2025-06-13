import { renderKeys } from "./main.js"
import { getSupportedAlgorithm } from "./keys.js"
import { uint8ToHex, strSha256Uint8 } from "./converters.js"
import { generateKey, storeKey, getKey } from "./keys.js"

export const pkccoToAttestation = async (pkcco, origin, mode, crossOrigin=undefined, topOrigin=undefined) => {
    console.log("PKCCO to Attestation:", pkcco, origin, mode, crossOrigin, topOrigin)

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

    // key handle
    let keyHandle = undefined
    const alg = getSupportedAlgorithm(pkcco.pubKeyCredParams)
    if (mode === "attacker" || mode === "victim") {
        // attacker or victim mode
        keyHandle = `${mode} | ${alg}`
    } else {
        // default mode
        keyHandle = `${pkcco.rp.id} | ${pkcco.user.name} | ${alg}`
    }

    // key
    let key = undefined
    if (!(await getKey(keyHandle))) {
        key = await generateKey(alg)
        await storeKey(keyHandle, key)
        await renderKeys()
    } else {
        key = await getKey(keyHandle)
    }

    // attestationObject.authData.attestedCredentialData
    attestationObject.authData.attestedCredentialData = {}
    attestationObject.authData.attestedCredentialData.aaguid = "ea9b8d664d011d213ce4b6b48cb575d4" // Google Password Manager
    attestationObject.authData.attestedCredentialData.credentialIdLength = key.credentialId.length / 2 // hex length
    attestationObject.authData.attestedCredentialData.credentialId = key.credentialId // hex
    attestationObject.authData.attestedCredentialData.credentialPublicKey = key.publicKey // JWK

    // attestationObject.authData.extensions
    attestationObject.authData.extensions = ""

    return { clientDataJSON, attestationObject }
}
