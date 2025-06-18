const modifications = {
    create: {
        "Conformance": {
            "attestationTypeCreate": "Verify that the value of C.type is webauthn.create.",
            "attestationUserPresent": "If options.mediation is not set to conditional, verify that the UP bit of the flags in authData is set.",
            "attestationUserVerified": "If the Relying Party requires user verification for this registration, verify that the UV bit of the flags in authData is set."
        },
    },
    get: {
        "Conformance": {
            "assertionTypeGet": "Verify that the value of C.type is the string webauthn.get.",
            "assertionUserPresent": "Verify that the UP bit of the flags in authData is set.",
            "assertionUserVerified": "Determine whether user verification is required for this assertion. User verification SHOULD be required if, and only if, pkOptions.userVerification is set to required. If user verification was determined to be required, verify that the UV bit of the flags in authData is set. Otherwise, ignore the value of the UV flag."
        },
    },
}

export const renderModifications = (operation) => {
    interceptorModifications.innerHTML = ""

    for (const [subtype, mods] of Object.entries(modifications[operation])) {
        const heading = document.createElement("h6")
        heading.classList.add("text-secondary")
        heading.textContent = subtype
        interceptorModifications.appendChild(heading)
        for (const [name, description] of Object.entries(mods)) {
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
}
