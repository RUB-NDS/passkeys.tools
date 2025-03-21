
export const navigatorCredentialsCreate = (publicKeyCredentialCreationOptions) => {
    return new Promise((resolve, reject) => {
        navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions
        }).then(publicKeyCredential => {
            console.log(publicKeyCredential)
            resolve(publicKeyCredential)
        }).catch(error => {
            console.error(error)
            reject(error)
        })
    })
}

export const navigatorCredentialsGet = (publicKeyCredentialRequestOptions) => {
    return new Promise((resolve, reject) => {
        navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
        }).then(publicKeyCredential => {
            console.log(publicKeyCredential)
            resolve(publicKeyCredential)
        }).catch(error => {
            console.error(error)
            reject(error)
        })
    })
}
