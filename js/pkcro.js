import { uint8ToHex, strSha256Uint8 } from "./converters.js"
import { getKeys } from "./keys.js"

export const pkcroToAssertion = async (pkcro, origin, crossOrigin=undefined, topOrigin=undefined) => {
    console.log("PKCRO to Assertion:", pkcro, origin, crossOrigin, topOrigin)

    // clientDataJSON
    const clientDataJSON = {}
    clientDataJSON.type = "webauthn.get"
    clientDataJSON.challenge = pkcro.challenge
    clientDataJSON.origin = origin
    if (crossOrigin != undefined) clientDataJSON.crossOrigin = crossOrigin
    if (topOrigin != undefined) clientDataJSON.topOrigin = topOrigin

    // authenticatorData
    const authenticatorData = {}

    // authenticatorData.rpIdHash
    authenticatorData.rpIdHash = uint8ToHex(await strSha256Uint8(pkcro.rpId))

    // authenticatorData.flags
    authenticatorData.flags = {}
    authenticatorData.flags.up = true // user present
    authenticatorData.flags.uv = true // user verified
    authenticatorData.flags.be = true // backup eligible
    authenticatorData.flags.bs = true // backup state
    authenticatorData.flags.at = false // attestation credential data included
    authenticatorData.flags.ed = false // extension data included

    // authenticatorData.signCount
    authenticatorData.signCount = 0

    // key for current user and RP
    // todo

    // signature
    const signature = new Uint8Array([0x00, 0x01, 0x02, 0x03])
    // todo

    return { clientDataJSON, authenticatorData, signature }
}
