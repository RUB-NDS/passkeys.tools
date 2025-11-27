/**
 * WebAuthn API wrappers for credential creation and retrieval.
 */

import logger from "./logger.js"

export const navigatorCredentialsCreate = async (publicKeyCredentialCreationOptions, mediation = "") => {
    try {
        const options = { publicKey: publicKeyCredentialCreationOptions }
        if (mediation) options.mediation = mediation
        const publicKeyCredential = await navigator.credentials.create(options)
        logger.debug("PublicKeyCredential:", publicKeyCredential)
        logger.debug("PublicKeyCredential (JSON):", publicKeyCredential.toJSON())
        return publicKeyCredential
    } catch (error) {
        logger.error("navigator.credentials.create failed:", error)
        throw error
    }
}

export const navigatorCredentialsGet = async (publicKeyCredentialRequestOptions, mediation = "") => {
    try {
        const options = { publicKey: publicKeyCredentialRequestOptions }
        if (mediation) options.mediation = mediation
        const publicKeyCredential = await navigator.credentials.get(options)
        logger.debug("PublicKeyCredential:", publicKeyCredential)
        logger.debug("PublicKeyCredential (JSON):", publicKeyCredential.toJSON())
        return publicKeyCredential
    } catch (error) {
        logger.error("navigator.credentials.get failed:", error)
        throw error
    }
}
