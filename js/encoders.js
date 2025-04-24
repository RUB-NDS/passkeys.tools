import { encode as encodeCbor } from "cborg"
import {
    strToB64url, strToHex, intToHex, hexToB64url, hexToUint8, jwkToCose,
    uint8ToHex, uint8ToB64url, jwkToPem, b64ToB64url, b64urlToHex,
    hexToB64, strToB64, uint8ToB64,
} from "./converters.js"

export const clientDataJSON = (data, codec) => {
    if (codec == "b64url") {
        return strToB64url(JSON.stringify(data))
    } else if (codec == "b64") {
        return strToB64(JSON.stringify(data))
    } else if (codec == "hex") {
        return strToHex(JSON.stringify(data))
    } else {
        throw new Error(`Unsupported codec: ${codec}`)
    }
}

export const attestationObject = (data, codec, limit="") => {
    // attestationObject
    const attestationObject = {}

    // attestationObject -> fmt
    const fmt = data["fmt"]
    attestationObject["fmt"] = fmt

    // attestationObject -> attStmt
    const attStmt = data["attStmt"]
    attestationObject["attStmt"] = {}

    if (fmt == "none") {
        // pass
    } else if (fmt == "packed") {
        // attestationObject -> attStmt -> alg
        const alg = attStmt["alg"]
        attestationObject["attStmt"]["alg"] = alg

        // attestationObject -> attStmt -> sig
        const sig = attStmt["sig"]
        attestationObject["attStmt"]["sig"] = sig ? hexToUint8(sig) : new Uint8Array()

        // attestationObject -> attStmt -> x5c
        if ("x5c" in attStmt) {
            const x5c = attStmt["x5c"]
            attestationObject["attStmt"]["x5c"] = x5c.map(x => hexToUint8(x))
        }
    } else {
        throw new Error(`Unsupported fmt: ${fmt}`)
    }

    // attestationObject -> authData
    const authData = data["authData"]
    attestationObject["authData"] = ""

    // attestationObject -> authData -> rpIdHash
    const rpIdHash = authData["rpIdHash"]
    attestationObject["authData"] = attestationObject["authData"].concat(rpIdHash)

    // attestationObject -> authData -> flags
    let flags = 0b0000_0000
    if (authData["flags"]["up"]) flags |= 0b0000_0001
    if (authData["flags"]["rfu1"]) flags |= 0b0000_0010
    if (authData["flags"]["uv"]) flags |= 0b0000_0100
    if (authData["flags"]["be"]) flags |= 0b0000_1000
    if (authData["flags"]["bs"]) flags |= 0b0001_0000
    if (authData["flags"]["rfu2"]) flags |= 0b0010_0000
    if (authData["flags"]["at"]) flags |= 0b0100_0000
    if (authData["flags"]["ed"]) flags |= 0b1000_0000
    attestationObject["authData"] = attestationObject["authData"].concat(intToHex(flags, 1))

    // attestationObject -> authData -> signCount
    const signCount = authData["signCount"]
    attestationObject["authData"] = attestationObject["authData"].concat(intToHex(signCount, 4))

    // attestationObject -> authData -> attestedCredentialData
    const attestedCredentialData = authData["attestedCredentialData"]

    // attestationObject -> authData -> attestedCredentialData -> aaguid
    const aaguid = attestedCredentialData["aaguid"]
    attestationObject["authData"] = attestationObject["authData"].concat(aaguid)

    // attestationObject -> authData -> attestedCredentialData -> credentialIdLength
    const credentialIdLength = attestedCredentialData["credentialIdLength"]
    attestationObject["authData"] = attestationObject["authData"].concat(intToHex(credentialIdLength, 2))

    // attestationObject -> authData -> attestedCredentialData -> credentialId
    const credentialId = attestedCredentialData["credentialId"]
    attestationObject["authData"] = attestationObject["authData"].concat(credentialId)

    // attestationObject -> authData -> attestedCredentialData -> credentialPublicKey
    const credentialPublicKey = attestedCredentialData["credentialPublicKey"]
    console.log("credentialPublicKey (jwk)", credentialPublicKey)
    const credentialPublicKeyCose = jwkToCose(credentialPublicKey)
    console.log("credentialPublicKey (cose)", credentialPublicKeyCose)
    const credentialPublicKeyCbor = encodeCbor(credentialPublicKeyCose)
    attestationObject["authData"] = attestationObject["authData"].concat(uint8ToHex(credentialPublicKeyCbor))

    // attestationObject -> authData -> extensions
    const extensions = authData["extensions"]
    attestationObject["authData"] = attestationObject["authData"].concat(extensions)

    // cbor encode
    attestationObject["authData"] = hexToUint8(attestationObject["authData"])
    const attestationObjectCbor = encodeCbor(attestationObject)
    console.log("attestationObject", attestationObject)

    if (codec == "b64url") {
        if (limit == "authData") {
            return uint8ToB64url(attestationObject["authData"])
        } else {
            return uint8ToB64url(attestationObjectCbor)
        }
    } else if (codec == "b64") {
        if (limit == "authData") {
            return uint8ToB64(attestationObject["authData"])
        } else {
            return uint8ToB64(attestationObjectCbor)
        }
    } else if (codec == "hex") {
        if (limit == "authData") {
            return uint8ToHex(attestationObject["authData"])
        } else {
            return uint8ToHex(attestationObjectCbor)
        }
    } else {
        throw new Error(`Unsupported codec: ${codec}`)
    }
}

export const authenticatorData = (data, codec) => {
    // authenticatorData
    let authenticatorData = ""

    // authenticatorData -> rpIdHash
    authenticatorData = authenticatorData.concat(data["rpIdHash"])

    // authenticatorData -> flags
    let flags = 0b0000_0000
    if (data["flags"]["up"]) flags |= 0b0000_0001
    if (data["flags"]["rfu1"]) flags |= 0b0000_0010
    if (data["flags"]["uv"]) flags |= 0b0000_0100
    if (data["flags"]["be"]) flags |= 0b0000_1000
    if (data["flags"]["bs"]) flags |= 0b0001_0000
    if (data["flags"]["rfu2"]) flags |= 0b0010_0000
    if (data["flags"]["at"]) flags |= 0b0100_0000
    if (data["flags"]["ed"]) flags |= 0b1000_0000
    authenticatorData = authenticatorData.concat(intToHex(flags, 1))

    // authenticatorData -> signCount
    authenticatorData = authenticatorData.concat(intToHex(data["signCount"], 4))

    // authenticatorData -> extensions
    authenticatorData = authenticatorData.concat(data["extensions"])

    if (codec == "b64url") {
        return hexToB64url(authenticatorData)
    } else if (codec == "b64") {
        return hexToB64(authenticatorData)
    } else if (codec == "hex") {
        return authenticatorData
    } else {
        throw new Error(`Unsupported codec: ${codec}`)
    }
}

export const keys = async (data, format, codec) => {
    if (format == "cose" && codec == "b64url") {
        const cose = jwkToCose(data)
        const cbor = encodeCbor(cose)
        return uint8ToB64url(cbor)
    } else if (format == "cose" && codec == "b64") {
        const cose = jwkToCose(data)
        const cbor = encodeCbor(cose)
        return uint8ToB64(cbor)
    } else if (format == "cose" && codec == "hex") {
        const cose = jwkToCose(data)
        const cbor = encodeCbor(cose)
        return uint8ToHex(cbor)
    } else if (format == "pem" && codec == "b64") {
        const pem = await jwkToPem(data)
        return pem
    } else if (format == "der" && codec == "b64url") {
        const pem = await jwkToPem(data)
        const der = b64ToB64url(pem.replace(/-----BEGIN .*-----|-----END .*-----|[\r\n]/g, ""))
        return der
    } else if (format == "der" && codec == "hex") {
        const pem = await jwkToPem(data)
        const derB64url = b64ToB64url(pem.replace(/-----BEGIN .*-----|-----END .*-----|[\r\n]/g, ""))
        const derHex = b64urlToHex(derB64url)
        return derHex
    } else {
        throw new Error(`Unsupported format and codec: ${format}, ${codec}`)
    }
}
