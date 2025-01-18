import { decode as decodeCbor, decodeFirst } from "cborg"
import { b64urlToStr, hexToStr, b64urlToUint8, uint8ToHex, uint8ToInt, hexToUint8, coseToJwk } from "./converters.js"

export const clientDataJSON = (data, codec) => {
    if (codec == "b64url") {
        return JSON.parse(b64urlToStr(data))
    } else if (codec == "hex") {
        return JSON.parse(hexToStr(data))
    } else {
        throw new Error(`Unsupported codec: ${codec}`)
    }
}

export const attestationObject = (data, codec) => {
    let uint8 = undefined
    if (codec == "b64url") {
        uint8 = b64urlToUint8(data)
    } else if (codec == "hex") {
        uint8 = hexToUint8(data)
    } else {
        throw new Error(`Unsupported codec: ${codec}`)
    }

    // attestationObject
    const [c0, c1] = decodeFirst(uint8)
    const attestationObject = {}
    console.log("attestationObject", c0)

    // attestationObject -> fmt
    const fmt = c0["fmt"]
    attestationObject["fmt"] = fmt

    // attestationObject -> attStmt
    const attStmt = c0["attStmt"]
    attestationObject["attStmt"] = {}

    if (fmt == "none") {
        // pass
    } else if (fmt == "packed") {
        // attestationObject -> attStmt -> alg
        const alg = attStmt["alg"]
        attestationObject["attStmt"]["alg"] = alg

        // attestationObject -> attStmt -> sig
        const sig = attStmt["sig"]
        attestationObject["attStmt"]["sig"] = uint8ToHex(sig)

        // attestationObject -> attStmt -> x5c
        if ("x5c" in attStmt) {
            const x5c = attStmt["x5c"]
            attestationObject["attStmt"]["x5c"] = x5c.map(x => uint8ToHex(x))
        }
    } else {
        throw new Error(`Unsupported fmt: ${fmt}`)
    }

    // attestationObject -> authData
    const authData = c0["authData"]
    attestationObject["authData"] = {}

    // attestationObject -> authData -> rpIdHash
    const rpIdHash = authData.slice(0, 32)
    attestationObject["authData"]["rpIdHash"] = uint8ToHex(rpIdHash)

    // attestationObject -> authData -> flags
    const flags = authData[32]
    attestationObject["authData"]["flags"] = {}
    if (flags & 0b0000_0001) attestationObject["authData"]["flags"]["up"] = true
    else attestationObject["authData"]["flags"]["up"] = false
    if (flags & 0b0000_0010) attestationObject["authData"]["flags"]["rfu1"] = true
    else attestationObject["authData"]["flags"]["rfu1"] = false
    if (flags & 0b0000_0100) attestationObject["authData"]["flags"]["uv"] = true
    else attestationObject["authData"]["flags"]["uv"] = false
    if (flags & 0b0000_1000) attestationObject["authData"]["flags"]["be"] = true
    else attestationObject["authData"]["flags"]["be"] = false
    if (flags & 0b0001_0000) attestationObject["authData"]["flags"]["bs"] = true
    else attestationObject["authData"]["flags"]["bs"] = false
    if (flags & 0b0010_0000) attestationObject["authData"]["flags"]["rfu2"] = true
    else attestationObject["authData"]["flags"]["rfu2"] = false
    if (flags & 0b0100_0000) attestationObject["authData"]["flags"]["at"] = true
    else attestationObject["authData"]["flags"]["at"] = false
    if (flags & 0b1000_0000) attestationObject["authData"]["flags"]["ed"] = true
    else attestationObject["authData"]["flags"]["ed"] = false

    // attestationObject -> authData -> signCount
    const signCount = authData.slice(33, 37)
    attestationObject["authData"]["signCount"] = uint8ToHex(signCount)

    // attestationObject -> authData -> attestedCredentialData
    attestationObject["authData"]["attestedCredentialData"] = {}

    // attestationObject -> authData -> attestedCredentialData -> aaguid
    const aaguid = authData.slice(37, 53)
    attestationObject["authData"]["attestedCredentialData"]["aaguid"] = uint8ToHex(aaguid)

    // attestationObject -> authData -> attestedCredentialData -> credentialIdLength
    const credentialIdLength = authData.slice(53, 55)
    attestationObject["authData"]["attestedCredentialData"]["credentialIdLength"] = uint8ToHex(credentialIdLength)

    // attestationObject -> authData -> attestedCredentialData -> credentialId
    const credentialId = authData.slice(55, 55 + uint8ToInt(credentialIdLength))
    attestationObject["authData"]["attestedCredentialData"]["credentialId"] = uint8ToHex(credentialId)

    // attestationObject -> authData -> attestedCredentialData -> credentialPublicKey
    // attestationObject -> authData -> extensions
    const [c2, c3] = decodeFirst(authData.slice(55 + uint8ToInt(credentialIdLength)), {useMaps: true})

    // attestationObject -> authData -> attestedCredentialData -> credentialPublicKey
    console.log("credentialPublicKey", c2)
    const jwk = coseToJwk(c2)
    attestationObject["authData"]["attestedCredentialData"]["credentialPublicKey"] = jwk

    // attestationObject -> authData -> extensions
    console.log("extensions", c3)
    attestationObject["authData"]["extensions"] = uint8ToHex(c3)

    return attestationObject
}

export const authenticatorData = (data, codec) => {
    let uint8 = undefined
    if (codec == "b64url") {
        uint8 = b64urlToUint8(data)
    } else if (codec == "hex") {
        uint8 = hexToUint8(data)
    } else {
        throw new Error(`Unsupported codec: ${codec}`)
    }

    // authenticatorData
    const authenticatorData = {}
    console.log("authenticatorData", uint8)

    // authenticatorData -> rpIdHash
    const rpIdHash = uint8.slice(0, 32)
    authenticatorData["rpIdHash"] = uint8ToHex(rpIdHash)

    // authenticatorData -> flags
    const flags = uint8[32]
    authenticatorData["flags"] = {}
    if (flags & 0b0000_0001) authenticatorData["flags"]["up"] = true
    else authenticatorData["flags"]["up"] = false
    if (flags & 0b0000_0010) authenticatorData["flags"]["rfu1"] = true
    else authenticatorData["flags"]["rfu1"] = false
    if (flags & 0b0000_0100) authenticatorData["flags"]["uv"] = true
    else authenticatorData["flags"]["uv"] = false
    if (flags & 0b0000_1000) authenticatorData["flags"]["be"] = true
    else authenticatorData["flags"]["be"] = false
    if (flags & 0b0001_0000) authenticatorData["flags"]["bs"] = true
    else authenticatorData["flags"]["bs"] = false
    if (flags & 0b0010_0000) authenticatorData["flags"]["rfu2"] = true
    else authenticatorData["flags"]["rfu2"] = false
    if (flags & 0b0100_0000) authenticatorData["flags"]["at"] = true
    else authenticatorData["flags"]["at"] = false
    if (flags & 0b1000_0000) authenticatorData["flags"]["ed"] = true
    else authenticatorData["flags"]["ed"] = false

    // authenticatorData -> signCount
    const signCount = uint8.slice(33, 37)
    authenticatorData["signCount"] = uint8ToHex(signCount)

    // authenticatorData -> extensions
    const extensions = uint8.slice(37)
    console.log("extensions", extensions)
    authenticatorData["extensions"] = uint8ToHex(extensions)

    return authenticatorData
}

export const keys = (data, format, codec) => {
    if (format == "cose" && codec == "b64url") {
        const uint8 = b64urlToUint8(data)
        const cbor = decodeCbor(uint8, {useMaps: true})
        const jwk = coseToJwk(cbor)
        return jwk
    } else if (format == "cose" && codec == "hex") {
        const uint8 = hexToUint8(data)
        const cbor = decodeCbor(uint8, {useMaps: true})
        const jwk = coseToJwk(cbor)
        return jwk
    } else {
        throw new Error(`Unsupported format and codec: ${format}, ${codec}`)
    }
}
