import cosekey from "./parse-cosekey"

export const b64urlToUint8 = (b64url) => {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/")
    const bin = atob(b64)
    const uint8 = new Uint8Array(bin.split("").map(c => c.charCodeAt(0)))
    return uint8
}

export const b64urlToHex = (b64url) => {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/")
    const bin = atob(b64)
    const hex = Array.from(bin).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    return hex
}

export const b64urlToStr = (b64url) => {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/")
    const bin = atob(b64)
    const str = Array.from(bin).map(c => String.fromCharCode(c.charCodeAt(0))).join("")
    return str
}

export const hexToStr = (hex) => {
    const bin = hex.match(/.{2}/g).map(c => String.fromCharCode(parseInt(c, 16))).join("")
    return bin
}

export const strToHex = (str) => {
    const hex = Array.from(str).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    return hex
}

export const hexToB64url = (hex) => {
    const bin = hex.match(/.{2}/g).map(c => String.fromCharCode(parseInt(c, 16))).join("")
    const b64 = btoa(bin)
    const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    return b64url
}

export const hexToUint8 = (hex) => {
    const uint8 = new Uint8Array(hex.match(/.{2}/g).map(c => parseInt(c, 16)))
    return uint8
}

export const uint8ToHex = (uint8) => {
    return Array.from(uint8).map(c => c.toString(16).padStart(2, "0")).join("")
}

export const uint8ToB64url = (uint8) => {
    const bin = Array.from(uint8).map(c => String.fromCharCode(c)).join("")
    const b64 = btoa(bin)
    const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    return b64url
}

export const uint8ToInt = (uint8) => {
    let int = 0
    for (let i = 0; i < uint8.length; i++) {
        int = (int << 8) | uint8[i]
    }
    return int
}

export const strToB64url = (str) => {
    const b64 = btoa(str)
    const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    return b64url
}

export const intToHex = (int, octets) => {
    let hex = int.toString(16)
    if (hex.length < octets * 2) {
        hex = hex.padStart(octets * 2, "0")
    } else if (hex.length % 2 !== 0) {
        hex = hex.padStart(hex.length + 1, "0")
    }
    return hex
}

export const coseToJwk = (cose) => {
    const jwt = cosekey.KeyParser.cose2jwk(cose)
    for (const k in jwt) {
        if (jwt[k] instanceof Uint8Array) {
            jwt[k] = "0x" + uint8ToHex(jwt[k])
        }
    }
    return jwt
}

export const jwkToCose = (jwk) => {
    const jwkUint8 = {...jwk}
    for (const k in jwkUint8) {
        if (typeof jwkUint8[k] === "string" && jwkUint8[k].startsWith("0x")) {
            jwkUint8[k] = hexToUint8(jwkUint8[k].slice(2))
        }
    }
    const cose = cosekey.KeyParser.jwk2cose(jwkUint8)
    return cose
}
