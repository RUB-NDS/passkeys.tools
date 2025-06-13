_pk.helpers = {}

/* Base64url encoding/decoding utilities */
_pk.helpers.b64urlToUint8 = (b64url) => {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/")
    const bin = atob(b64)
    const uint8 = new Uint8Array(bin.split("").map(c => c.charCodeAt(0)))
    return uint8
}

_pk.helpers.uint8ToB64url = (uint8) => {
    const bin = Array.from(uint8).map(c => String.fromCharCode(c)).join("")
    const b64 = btoa(bin)
    const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    return b64url
}

/* Popup URL creation */
_pk.helpers.createPopupUrl = (params, operation) => {
    const origin = encodeURIComponent(window.location.origin)
    const mode = encodeURIComponent(_pk.interceptorMode || "default")
    const data = encodeURIComponent(JSON.stringify(params))
    const key = operation === "create" ? "pkcco" : "pkcro"

    let url = `http://localhost:5173/#${key}=${data}&origin=${origin}&mode=${mode}`

    // Check if we're in an iframe and add cross-origin parameters if applicable
    if (window.self !== window.top) {
        try {
            const topOrigin = window.top.location.origin
            const isCrossOrigin = topOrigin !== window.location.origin

            if (isCrossOrigin) {
                url += `&crossOrigin=true`
            } else {
                url += `&crossOrigin=false`
            }
            url += `&topOrigin=${encodeURIComponent(topOrigin)}`
        } catch (e) {
            // Cross-origin access denied - we're in a cross-origin iframe
            url += `&crossOrigin=true`
        }
    }

    return url
}

/* Handle popup response */
_pk.helpers.handlePopupResponse = (operation) => {
    return new Promise((resolve, reject) => {
        let timeoutId

        const cleanup = () => {
            window.removeEventListener("message", messageHandler)
            if (timeoutId) clearTimeout(timeoutId)
        }

        const messageHandler = (event) => {
            if (event.origin !== "http://localhost:5173") return

            if (event.data?.type === "passkey-interceptor-response" && event.data.operation === operation) {
                cleanup()

                const response = event.data.response
                _pk.log.info("Received response from interceptor:", response)

                try {
                    if (operation === "create") {
                        resolve(_pk.helpers.createAttestationResponse(response))
                    } else {
                        resolve(_pk.helpers.createAssertionResponse(response))
                    }
                } catch (error) {
                    _pk.log.error("Error creating response:", error)
                    reject(error)
                }
            }
        }

        window.addEventListener("message", messageHandler)

        // Timeout after 5 minutes
        timeoutId = setTimeout(() => {
            cleanup()
            reject(new DOMException("The operation was cancelled.", "NotAllowedError"))
        }, 300000)
    })
}

/* Create attestation response */
_pk.helpers.createAttestationResponse = (response) => {
    if (!response || !response.id || !response.clientDataJSON || !response.attestationObject) {
        throw new Error("Invalid attestation response")
    }

    const authenticatorAttestationResponse = {
        clientDataJSON: _pk.helpers.b64urlToUint8(response.clientDataJSON).buffer,
        attestationObject: _pk.helpers.b64urlToUint8(response.attestationObject).buffer,
        getTransports: () => ["internal", "hybrid"],
        getAuthenticatorData: () => _pk.helpers.b64urlToUint8(response.authenticatorData).buffer,
        getPublicKey: () => _pk.helpers.b64urlToUint8(response.publicKey).buffer,
        getPublicKeyAlgorithm: () => response.publicKeyAlgorithm
    }
    Object.setPrototypeOf(authenticatorAttestationResponse, AuthenticatorAttestationResponse.prototype)

    const publicKeyCredential = {
        type: "public-key",
        id: response.id,
        rawId: _pk.helpers.b64urlToUint8(response.id).buffer,
        authenticatorAttachment: "platform",
        response: authenticatorAttestationResponse,
        getClientExtensionResults: () => ({}),
        toJSON: () => ({
            type: "public-key",
            id: response.id,
            rawId: response.id,
            authenticatorAttachment: "platform",
            response: {
                clientDataJSON: response.clientDataJSON,
                attestationObject: response.attestationObject,
                authenticatorData: response.authenticatorData,
                publicKey: response.publicKey,
                publicKeyAlgorithm: response.publicKeyAlgorithm,
                transports: ["internal", "hybrid"]
            },
            clientExtensionResults: {}
        })
    }
    Object.setPrototypeOf(publicKeyCredential, PublicKeyCredential.prototype)

    return publicKeyCredential
}

/* Create assertion response */
_pk.helpers.createAssertionResponse = (response) => {
    if (!response || !response.id || !response.clientDataJSON ||
        !response.authenticatorData || !response.signature) {
        throw new Error("Invalid assertion response")
    }

    const authenticatorAssertionResponse = {
        clientDataJSON: _pk.helpers.b64urlToUint8(response.clientDataJSON).buffer,
        authenticatorData: _pk.helpers.b64urlToUint8(response.authenticatorData).buffer,
        signature: _pk.helpers.b64urlToUint8(response.signature).buffer,
        userHandle: _pk.helpers.b64urlToUint8(response.userHandle).buffer
    }
    Object.setPrototypeOf(authenticatorAssertionResponse, AuthenticatorAssertionResponse.prototype)

    const publicKeyCredential = {
        type: "public-key",
        id: response.id,
        rawId: _pk.helpers.b64urlToUint8(response.id).buffer,
        authenticatorAttachment: "platform",
        response: authenticatorAssertionResponse,
        getClientExtensionResults: () => ({}),
        toJSON: () => ({
            type: "public-key",
            id: response.id,
            rawId: response.id,
            authenticatorAttachment: "platform",
            response: {
                clientDataJSON: response.clientDataJSON,
                authenticatorData: response.authenticatorData,
                signature: response.signature,
                userHandle: response.userHandle,
                transports: ["internal", "hybrid"]
            },
            clientExtensionResults: {}
        })
    }
    Object.setPrototypeOf(publicKeyCredential, PublicKeyCredential.prototype)

    return publicKeyCredential
}
