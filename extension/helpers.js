/**
 * Helper utilities for the Passkeys.Tools extension.
 * Provides encoding/decoding, popup handling, and response creation functions.
 */

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
_pk.helpers.createPopupUrl = (params, operation, mediation, frontendUrl) => {
    const origin = encodeURIComponent(window.location.origin)
    const mode = encodeURIComponent(_pk.interceptorMode || "default")
    const data = encodeURIComponent(JSON.stringify(params))
    const key = operation === "create" ? "pkcco" : "pkcro"

    let url = `${frontendUrl}/#${key}=${data}&origin=${origin}&mode=${mode}`

    if (mediation) url += `&mediation=${encodeURIComponent(mediation)}`

    // Check if we're in an iframe and add cross-origin parameters if applicable
    if (window.self !== window.top) {
        // Use ancestorOrigins to get the top origin in cross-origin scenarios
        if (location.ancestorOrigins && location.ancestorOrigins.length > 0) {
            const topOrigin = location.ancestorOrigins[location.ancestorOrigins.length - 1]
            const isCrossOrigin = topOrigin !== window.location.origin

            if (isCrossOrigin) {
                url += `&crossOrigin=true`
            } else {
                url += `&crossOrigin=false`
            }
            url += `&topOrigin=${encodeURIComponent(topOrigin)}`
        } else {
            // Fallback for browsers that don't support ancestorOrigins
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
    }

    return url
}

/* Handle popup response */
_pk.helpers.handlePopupResponse = (operation, frontendUrl) => {
    return new Promise((resolve, reject) => {
        let timeoutId
        const expectedOrigin = new URL(frontendUrl).origin

        const cleanup = () => {
            window.removeEventListener("message", messageHandler)
            window.removeEventListener("message", passthroughHandler)
            if (timeoutId) clearTimeout(timeoutId)
        }

        // Handler for passthrough requests from popup
        const passthroughHandler = async (event) => {
            if (event.origin !== expectedOrigin) return

            if (event.data?.type === "passkey-interceptor-passthrough" && event.data.operation === operation) {
                const request = event.data.request
                const originalHash = event.data.originalHash || ""
                _pk.log.info("Received passthrough request:", operation, request)

                // Wait for popup to close so we get focus
                await new Promise(resolve => setTimeout(resolve, 300))

                // Extract mediation from original hash if present
                const hashParams = new URLSearchParams(originalHash.substring(1))
                const mediation = hashParams.get("mediation")

                try {
                    let credential
                    let responseJson

                    if (operation === "create") {
                        const nativeOptions = _pk.helpers.jsonToPkcco(request)
                        const createOptions = { publicKey: nativeOptions }
                        if (mediation) createOptions.mediation = mediation
                        _pk.log.info("Calling native navigator.credentials.create with:", createOptions)
                        credential = await _pk.hooks.create(createOptions)
                        responseJson = await _pk.helpers.attestationResponseToJson(credential)
                    } else if (operation === "get") {
                        const nativeOptions = _pk.helpers.jsonToPkcro(request)
                        const getOptions = { publicKey: nativeOptions }
                        if (mediation) getOptions.mediation = mediation
                        _pk.log.info("Calling native navigator.credentials.get with:", getOptions)
                        credential = await _pk.hooks.get(getOptions)
                        responseJson = _pk.helpers.assertionResponseToJson(credential)
                    } else {
                        throw new Error(`Unknown operation: ${operation}`)
                    }

                    _pk.log.info("Native credential response:", responseJson)

                    // Reopen popup with original hash + passthrough response
                    const passthroughData = encodeURIComponent(JSON.stringify(responseJson))
                    const newHash = `${originalHash}&passthrough=${passthroughData}`
                    const popupUrl = `${frontendUrl}/${newHash}`
                    const popupMode = _pk.popupMode || "detached"

                    if (popupMode === "detached") {
                        window.open(popupUrl, "passkey-interceptor", "width=1200,height=800")
                    } else {
                        window.open(popupUrl, "passkey-interceptor")
                    }

                } catch (error) {
                    _pk.log.error("Passthrough error:", error)

                    // Reopen popup with error as passthrough response
                    const errorResponse = { error: error.message || "Passthrough failed" }
                    const passthroughData = encodeURIComponent(JSON.stringify(errorResponse))
                    const newHash = `${originalHash}&passthrough=${passthroughData}`
                    const popupUrl = `${frontendUrl}/${newHash}`
                    const popupMode = _pk.popupMode || "detached"

                    if (popupMode === "detached") {
                        window.open(popupUrl, "passkey-interceptor", "width=1200,height=800")
                    } else {
                        window.open(popupUrl, "passkey-interceptor")
                    }
                }
            }
        }

        // Handler for final response/reject from popup
        const messageHandler = (event) => {
            if (event.origin !== expectedOrigin) return

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
            } else if (event.data?.type === "passkey-interceptor-reject" && event.data.operation === operation) {
                cleanup()
                _pk.log.info("Received reject from interceptor")
                reject(new DOMException("The operation was aborted.", "AbortError"))
            }
        }

        window.addEventListener("message", messageHandler)
        window.addEventListener("message", passthroughHandler)

        // Timeout after 5 minutes
        timeoutId = setTimeout(() => {
            cleanup()
            reject(new DOMException("The operation was cancelled.", "NotAllowedError"))
        }, 300000)
    })
}

/* Create attestation response */
_pk.helpers.createAttestationResponse = (response) => {
    if (!response || !response.id || !response.clientDataJSON ||
        !response.attestationObject || !response.authenticatorData ||
        !response.publicKey || !response.publicKeyAlgorithm) {
        throw new Error("Invalid attestation response")
    }

    const transports = response.transports || ["internal", "hybrid"]
    const authenticatorAttachment = response.authenticatorAttachment || "platform"

    const authenticatorAttestationResponse = {
        clientDataJSON: _pk.helpers.b64urlToUint8(response.clientDataJSON).buffer,
        attestationObject: _pk.helpers.b64urlToUint8(response.attestationObject).buffer,
        getTransports: () => transports,
        getAuthenticatorData: () => _pk.helpers.b64urlToUint8(response.authenticatorData).buffer,
        getPublicKey: () => _pk.helpers.b64urlToUint8(response.publicKey).buffer,
        getPublicKeyAlgorithm: () => response.publicKeyAlgorithm
    }
    Object.setPrototypeOf(authenticatorAttestationResponse, AuthenticatorAttestationResponse.prototype)

    const publicKeyCredential = {
        type: "public-key",
        id: response.id,
        rawId: _pk.helpers.b64urlToUint8(response.id).buffer,
        authenticatorAttachment: authenticatorAttachment,
        response: authenticatorAttestationResponse,
        getClientExtensionResults: () => ({}),
        toJSON: () => ({
            type: "public-key",
            id: response.id,
            rawId: response.id,
            authenticatorAttachment: authenticatorAttachment,
            response: {
                clientDataJSON: response.clientDataJSON,
                attestationObject: response.attestationObject,
                authenticatorData: response.authenticatorData,
                publicKey: response.publicKey,
                publicKeyAlgorithm: response.publicKeyAlgorithm,
                transports: transports
            },
            clientExtensionResults: {}
        })
    }
    Object.setPrototypeOf(publicKeyCredential, PublicKeyCredential.prototype)

    return publicKeyCredential
}

/* Convert JSON PKCCO to native format */
_pk.helpers.jsonToPkcco = (pkcco) => {
    const options = JSON.parse(JSON.stringify(pkcco))

    // Convert challenge from base64url to ArrayBuffer
    if (options.challenge) {
        options.challenge = _pk.helpers.b64urlToUint8(options.challenge).buffer
    }

    // Convert user.id from base64url to ArrayBuffer
    if (options.user?.id) {
        options.user.id = _pk.helpers.b64urlToUint8(options.user.id).buffer
    }

    // Convert excludeCredentials IDs from base64url to ArrayBuffer
    if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map(cred => ({
            ...cred,
            id: _pk.helpers.b64urlToUint8(cred.id).buffer
        }))
    }

    return options
}

/* Convert JSON PKCRO to native format */
_pk.helpers.jsonToPkcro = (pkcro) => {
    const options = JSON.parse(JSON.stringify(pkcro))

    // Convert challenge from base64url to ArrayBuffer
    if (options.challenge) {
        options.challenge = _pk.helpers.b64urlToUint8(options.challenge).buffer
    }

    // Convert allowCredentials IDs from base64url to ArrayBuffer
    if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map(cred => ({
            ...cred,
            id: _pk.helpers.b64urlToUint8(cred.id).buffer
        }))
    }

    return options
}

/* Convert native attestation response to JSON */
_pk.helpers.attestationResponseToJson = async (credential) => {
    const response = credential.response

    return {
        id: credential.id,
        clientDataJSON: _pk.helpers.uint8ToB64url(new Uint8Array(response.clientDataJSON)),
        attestationObject: _pk.helpers.uint8ToB64url(new Uint8Array(response.attestationObject)),
        authenticatorData: response.getAuthenticatorData ?
            _pk.helpers.uint8ToB64url(new Uint8Array(response.getAuthenticatorData())) : undefined,
        publicKey: response.getPublicKey ?
            _pk.helpers.uint8ToB64url(new Uint8Array(response.getPublicKey())) : undefined,
        publicKeyAlgorithm: response.getPublicKeyAlgorithm ?
            response.getPublicKeyAlgorithm() : undefined,
        transports: response.getTransports ? response.getTransports() : ["internal", "hybrid"],
        authenticatorAttachment: credential.authenticatorAttachment || "platform"
    }
}

/* Convert native assertion response to JSON */
_pk.helpers.assertionResponseToJson = (credential) => {
    const response = credential.response

    return {
        id: credential.id,
        clientDataJSON: _pk.helpers.uint8ToB64url(new Uint8Array(response.clientDataJSON)),
        authenticatorData: _pk.helpers.uint8ToB64url(new Uint8Array(response.authenticatorData)),
        signature: _pk.helpers.uint8ToB64url(new Uint8Array(response.signature)),
        userHandle: response.userHandle ?
            _pk.helpers.uint8ToB64url(new Uint8Array(response.userHandle)) : null,
        transports: ["internal", "hybrid"],
        authenticatorAttachment: credential.authenticatorAttachment || "platform"
    }
}

/* Create assertion response */
_pk.helpers.createAssertionResponse = (response) => {
    if (!response || !response.id || !response.clientDataJSON ||
        !response.authenticatorData || !response.signature) {
        throw new Error("Invalid assertion response")
    }

    const transports = response.transports || ["internal", "hybrid"]
    const authenticatorAttachment = response.authenticatorAttachment || "platform"

    const authenticatorAssertionResponse = {
        clientDataJSON: _pk.helpers.b64urlToUint8(response.clientDataJSON).buffer,
        authenticatorData: _pk.helpers.b64urlToUint8(response.authenticatorData).buffer,
        signature: _pk.helpers.b64urlToUint8(response.signature).buffer,
        userHandle: response.userHandle ? _pk.helpers.b64urlToUint8(response.userHandle).buffer : null
    }
    Object.setPrototypeOf(authenticatorAssertionResponse, AuthenticatorAssertionResponse.prototype)

    const publicKeyCredential = {
        type: "public-key",
        id: response.id,
        rawId: _pk.helpers.b64urlToUint8(response.id).buffer,
        authenticatorAttachment: authenticatorAttachment,
        response: authenticatorAssertionResponse,
        getClientExtensionResults: () => ({}),
        toJSON: () => ({
            type: "public-key",
            id: response.id,
            rawId: response.id,
            authenticatorAttachment: authenticatorAttachment,
            response: {
                clientDataJSON: response.clientDataJSON,
                authenticatorData: response.authenticatorData,
                signature: response.signature,
                userHandle: response.userHandle,
                transports: transports
            },
            clientExtensionResults: {}
        })
    }
    Object.setPrototypeOf(publicKeyCredential, PublicKeyCredential.prototype)

    return publicKeyCredential
}
