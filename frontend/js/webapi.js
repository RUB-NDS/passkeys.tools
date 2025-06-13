
export const navigatorCredentialsCreate = async (publicKeyCredentialCreationOptions, mediation="") => {
    try {
        const options = { publicKey: publicKeyCredentialCreationOptions }
        if (mediation) options.mediation = mediation
        const publicKeyCredential = await navigator.credentials.create(options)
        console.log("PublicKeyCredential:", publicKeyCredential)
        console.log("PublicKeyCredential (JSON):", publicKeyCredential.toJSON())
        return publicKeyCredential
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const navigatorCredentialsGet = async (publicKeyCredentialRequestOptions, mediation="") => {
    try {
        const options = { publicKey: publicKeyCredentialRequestOptions }
        if (mediation) options.mediation = mediation
        const publicKeyCredential = await navigator.credentials.get(options)
        console.log("PublicKeyCredential:", publicKeyCredential)
        console.log("PublicKeyCredential (JSON):", publicKeyCredential.toJSON())
        return publicKeyCredential
    } catch (error) {
        console.error(error)
        throw error
    }
}
