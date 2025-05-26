
export const navigatorCredentialsCreate = (publicKeyCredentialCreationOptions, mediation="") => {
    return new Promise((resolve, reject) => {
        const options = { publicKey: publicKeyCredentialCreationOptions }
        if (mediation) options.mediation = mediation
        navigator.credentials.create(options)
        .then(publicKeyCredential => {
            console.log(publicKeyCredential)
            resolve(publicKeyCredential)
        }).catch(error => {
            console.error(error)
            reject(error)
        })
    })
}

export const navigatorCredentialsGet = (publicKeyCredentialRequestOptions, mediation="") => {
    return new Promise((resolve, reject) => {
        const options = { publicKey: publicKeyCredentialRequestOptions }
        if (mediation) options.mediation = mediation
        navigator.credentials.get(options)
        .then(publicKeyCredential => {
            console.log(publicKeyCredential)
            resolve(publicKeyCredential)
        }).catch(error => {
            console.error(error)
            reject(error)
        })
    })
}
