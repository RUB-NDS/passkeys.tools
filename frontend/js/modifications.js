const modifications = {
    create: {
        "Context": "Verify that the value of C.type is webauthn.create. (§7.1.7)",
        "Challenge": "Verify that the value of C.challenge equals the base64url encoding of pkOptions.challenge. (§7.1.8)",
        "Origin": "Verify that the value of C.origin is an origin expected by the Relying Party. (§7.1.9)",
        "Cross Origin": "If C.crossOrigin is present and set to true, verify that the Relying Party expects that this credential would have been created within an iframe that is not same-origin with its ancestors. (§7.1.10)",
        "Top Origin": "If C.topOrigin is present: 1) Verify that the Relying Party expects that this credential would have been created within an iframe that is not same-origin with its ancestors. 2) Verify that the value of C.topOrigin matches the origin of a page that the Relying Party expects to be sub-framed within. (§7.1.11)",
        "RP ID Hash": "Verify that the rpIdHash in authData is the SHA-256 hash of the RP ID expected by the Relying Party. (§7.1.14)",
        "User Present": "If options.mediation is not set to conditional, verify that the UP bit of the flags in authData is set. (§7.1.15)",
        "User Verified": "If the Relying Party requires user verification for this registration, verify that the UV bit of the flags in authData is set. (§7.1.16)",
        "Backup State": "If the BE bit of the flags in authData is not set, verify that the BS bit is not set. (§7.1.17)",
        "Algorithm": "Verify that the \"alg\" parameter in the credential public key in authData matches the alg attribute of one of the items in pkOptions.pubKeyCredParams. (§7.1.20)",
        "Credential ID Length": "Verify that the credentialId is ≤ 1023 bytes. Credential IDs larger than this many bytes SHOULD cause the RP to fail this registration ceremony. (§7.1.25)",
        "Credential ID Unused": "Verify that the credentialId is not yet registered for any user. If the credentialId is already known then the Relying Party SHOULD fail this registration ceremony. (§7.1.26)",
    },
    get: {
        "Allow Credentials": "If pkOptions.allowCredentials is not empty, verify that credential.id identifies one of the public key credentials listed in pkOptions.allowCredentials. (§7.2.5)",
        "Non-Discoverable Identification": "If the user was identified before the authentication ceremony was initiated, e.g., via a username or cookie, verify that the identified user account contains a credential record whose id equals credential.rawId. If response.userHandle is present, verify that it equals the user handle of the user account. (§7.2.6)",
        "Discoverable Identification": "If the user was not identified before the authentication ceremony was initiated, verify that response.userHandle is present. Verify that the user account identified by response.userHandle contains a credential record whose id equals credential.rawId. (§7.2.6)",
        "Context": "Verify that the value of C.type is the string webauthn.get. (§7.2.10)",
        "Challenge": "Verify that the value of C.challenge equals the base64url encoding of pkOptions.challenge. (§7.2.11)",
        "Origin": "Verify that the value of C.origin is an origin expected by the Relying Party. (§7.2.12)",
        "Cross Origin": "If C.crossOrigin is present and set to true, verify that the Relying Party expects this credential to be used within an iframe that is not same-origin with its ancestors. (§7.2.13)",
        "Top Origin": "If C.topOrigin is present: 1) Verify that the Relying Party expects this credential to be used within an iframe that is not same-origin with its ancestors. 2) Verify that the value of C.topOrigin matches the origin of a page that the Relying Party expects to be sub-framed within. (§7.2.14)",
        "RP ID Hash": "Verify that the rpIdHash in authData is the SHA-256 hash of the RP ID expected by the Relying Party. (§7.2.15)",
        "User Present": "Verify that the UP bit of the flags in authData is set. (§7.2.16)",
        "User Verified": "Determine whether user verification is required for this assertion. User verification SHOULD be required if, and only if, pkOptions.userVerification is set to required. If user verification was determined to be required, verify that the UV bit of the flags in authData is set. Otherwise, ignore the value of the UV flag. (§7.2.17)",
        "Backup State": "If the BE bit of the flags in authData is not set, verify that the BS bit is not set. (§7.2.18)",
        "Backup Eligible": "If credentialRecord.backupEligible is set, verify that currentBe is set. If credentialRecord.backupEligible is not set, verify that currentBe is not set. (§7.2.19)",
        "Signature": "Using credentialRecord.publicKey, verify that sig is a valid signature over the binary concatenation of authData and hash. (§7.2.21)",
        "Signature Counter": "If authData.signCount is nonzero or credentialRecord.signCount is nonzero, then run the following sub-step: If authData.signCount is greater than credentialRecord.signCount: The signature counter is valid. (§7.2.22)",
    },
}

export const renderModifications = (operation) => {
    interceptorModifications.innerHTML = ""

    for (const [name, description] of Object.entries(modifications[operation])) {
        const check = document.createElement("div")
        check.classList.add("form-check", "ms-3")

        const input = document.createElement("input")
        input.classList.add("form-check-input")
        input.type = "radio"
        input.name = "modification"
        input.id = `modification-${name}`
        input.value = name

        const label = document.createElement("label")
        label.classList.add("form-check-label")
        label.setAttribute("for", `modification-${name}`)
        label.textContent = description

        check.appendChild(input)
        check.appendChild(label)
        interceptorModifications.appendChild(check)
    }
}
