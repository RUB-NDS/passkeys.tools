/* Compatibility check */
const requiredFeatures = [
    ["navigator.credentials", navigator.credentials],
    ["navigator.credentials.get", navigator.credentials?.get],
    ["navigator.credentials.create", navigator.credentials?.create],
    ["PublicKeyCredential", typeof PublicKeyCredential !== "undefined" ? PublicKeyCredential : null]
]

for (const [name, feature] of requiredFeatures) {
    if (!feature) {
        _pk.log.error(`${name} not supported in this browser`)
        throw new Error(`${name} not supported in this browser`)
    }
}

/* Store original functions */
_pk.hooks = {
    get: navigator.credentials.get.bind(navigator.credentials),
    create: navigator.credentials.create.bind(navigator.credentials),
    getClientCapabilities: PublicKeyCredential.getClientCapabilities?.bind(PublicKeyCredential),
    isConditionalMediationAvailable: PublicKeyCredential.isConditionalMediationAvailable?.bind(PublicKeyCredential),
    isUserVerifyingPlatformAuthenticatorAvailable: PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.bind(PublicKeyCredential),
    parseCreationOptionsFromJSON: PublicKeyCredential.parseCreationOptionsFromJSON?.bind(PublicKeyCredential),
    parseRequestOptionsFromJSON: PublicKeyCredential.parseRequestOptionsFromJSON?.bind(PublicKeyCredential),
    signalAllAcceptedCredentials: PublicKeyCredential.signalAllAcceptedCredentials?.bind(PublicKeyCredential),
    signalCurrentUserDetails: PublicKeyCredential.signalCurrentUserDetails?.bind(PublicKeyCredential),
    signalUnknownCredential: PublicKeyCredential.signalUnknownCredential?.bind(PublicKeyCredential)
}

/* Hook: navigator.credentials.create */
navigator.credentials.create = async function (...args) {
    _pk.log.info("navigator.credentials.create is called with:", ...args)

    // Check if this is a publicKey request
    if (!args?.[0]?.publicKey) {
        return _pk.hooks.create(...args)
    }

    const publicKey = args[0].publicKey
    _pk.log.info("PublicKeyCredentialCreationOptions:", publicKey)

    const mediation = args[0].mediation
    _pk.log.info("Mediation:", mediation)

    // Parse creation options
    const pkcco = JSON.parse(JSON.stringify(publicKey))
    pkcco.challenge = _pk.helpers.uint8ToB64url(new Uint8Array(publicKey.challenge))
    pkcco.user.id = _pk.helpers.uint8ToB64url(new Uint8Array(publicKey.user.id))

    if (publicKey.excludeCredentials) {
        pkcco.excludeCredentials = publicKey.excludeCredentials.map(cred => ({
            ...cred,
            id: _pk.helpers.uint8ToB64url(new Uint8Array(cred.id))
        }))
    }

    _pk.log.info("Parsed PublicKeyCredentialCreationOptions:", pkcco)

    // Open popup and handle response
    const popupUrl = _pk.helpers.createPopupUrl(pkcco, "create", mediation)
    window.open(popupUrl, "passkey-interceptor", "width=1200,height=800")

    return _pk.helpers.handlePopupResponse("create")
}

/* Hook: navigator.credentials.get */
navigator.credentials.get = async function (...args) {
    _pk.log.info("navigator.credentials.get is called with:", ...args)

    // Check if this is a publicKey request
    if (!args?.[0]?.publicKey) {
        return _pk.hooks.get(...args)
    }

    const publicKey = args[0].publicKey
    _pk.log.info("PublicKeyCredentialRequestOptions:", publicKey)

    const mediation = args[0].mediation
    _pk.log.info("Mediation:", mediation)

    // Parse request options
    const pkcro = JSON.parse(JSON.stringify(publicKey))
    pkcro.challenge = _pk.helpers.uint8ToB64url(new Uint8Array(publicKey.challenge))

    if (publicKey.allowCredentials) {
        pkcro.allowCredentials = publicKey.allowCredentials.map(cred => ({
            ...cred,
            id: _pk.helpers.uint8ToB64url(new Uint8Array(cred.id))
        }))
    }

    _pk.log.info("Parsed PublicKeyCredentialRequestOptions:", pkcro)

    // Open popup and handle response
    const popupUrl = _pk.helpers.createPopupUrl(pkcro, "get", mediation)
    window.open(popupUrl, "passkey-interceptor", "width=1200,height=800")

    return _pk.helpers.handlePopupResponse("get")
}

/* PublicKeyCredential method hooks */
if (PublicKeyCredential.getClientCapabilities) {
    PublicKeyCredential.getClientCapabilities = async function (...args) {
        _pk.log.info("PublicKeyCredential.getClientCapabilities is called with:", ...args)
        return _pk.hooks.getClientCapabilities(...args)
    }
} else {
    _pk.log.warn("PublicKeyCredential.getClientCapabilities not supported in this browser")
}

if (PublicKeyCredential.isConditionalMediationAvailable) {
    PublicKeyCredential.isConditionalMediationAvailable = async function (...args) {
        _pk.log.info("PublicKeyCredential.isConditionalMediationAvailable is called with:", ...args)
        return _pk.hooks.isConditionalMediationAvailable(...args)
    }
} else {
    _pk.log.warn("PublicKeyCredential.isConditionalMediationAvailable not supported in this browser")
}

if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = async function (...args) {
        _pk.log.info("PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable is called with:", ...args)
        return _pk.hooks.isUserVerifyingPlatformAuthenticatorAvailable(...args)
    }
} else {
    _pk.log.warn("PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable not supported in this browser")
}

if (PublicKeyCredential.parseCreationOptionsFromJSON) {
    PublicKeyCredential.parseCreationOptionsFromJSON = function (...args) {
        _pk.log.info("PublicKeyCredential.parseCreationOptionsFromJSON is called with:", ...args)
        return _pk.hooks.parseCreationOptionsFromJSON(...args)
    }
} else {
    _pk.log.warn("PublicKeyCredential.parseCreationOptionsFromJSON not supported in this browser")
}

if (PublicKeyCredential.parseRequestOptionsFromJSON) {
    PublicKeyCredential.parseRequestOptionsFromJSON = function (...args) {
        _pk.log.info("PublicKeyCredential.parseRequestOptionsFromJSON is called with:", ...args)
        return _pk.hooks.parseRequestOptionsFromJSON(...args)
    }
} else {
    _pk.log.warn("PublicKeyCredential.parseRequestOptionsFromJSON not supported in this browser")
}

if (PublicKeyCredential.signalAllAcceptedCredentials) {
    PublicKeyCredential.signalAllAcceptedCredentials = async function (...args) {
        _pk.log.info("PublicKeyCredential.signalAllAcceptedCredentials is called with:", ...args)
        return _pk.hooks.signalAllAcceptedCredentials(...args)
    }
} else {
    _pk.log.warn("PublicKeyCredential.signalAllAcceptedCredentials not supported in this browser")
}

if (PublicKeyCredential.signalCurrentUserDetails) {
    PublicKeyCredential.signalCurrentUserDetails = async function (...args) {
        _pk.log.info("PublicKeyCredential.signalCurrentUserDetails is called with:", ...args)
        return _pk.hooks.signalCurrentUserDetails(...args)
    }
} else {
    _pk.log.warn("PublicKeyCredential.signalCurrentUserDetails not supported in this browser")
}

if (PublicKeyCredential.signalUnknownCredential) {
    PublicKeyCredential.signalUnknownCredential = async function (...args) {
        _pk.log.info("PublicKeyCredential.signalUnknownCredential is called with:", ...args)
        return _pk.hooks.signalUnknownCredential(...args)
    }
} else {
    _pk.log.warn("PublicKeyCredential.signalUnknownCredential not supported in this browser")
}
