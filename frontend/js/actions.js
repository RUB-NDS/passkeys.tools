const actions = {
    "createDefault": {
        type: "Attestation",
        subtype: "General",
        name: "Default behavior"
    },
    "getDefault": {
        type: "Assertion",
        subtype: "General",
        name: "Default behavior"
    },
    "createNoUpNoUv": {
        type: "Attestation",
        subtype: "Conformance",
        name: "No user presence or verification",
    },
}

export const renderActions = () => {
    interceptorActions.innerHTML = ""

    const groupedActions = {}
    for (const [key, value] of Object.entries(actions)) {
        const type = value.type
        const subtype = value.subtype
        if (!groupedActions[type]) {
            groupedActions[type] = {}
        }
        if (!groupedActions[type][subtype]) {
            groupedActions[type][subtype] = []
        }
        groupedActions[type][subtype].push({ key, ...value })
    }

    for (const [type, subtypes] of Object.entries(groupedActions)) {
        const typeHeading = document.createElement("h5")
        typeHeading.classList.add("text-primary")
        typeHeading.textContent = type
        interceptorActions.appendChild(typeHeading)

        for (const [subtype, actionList] of Object.entries(subtypes)) {
            const subtypeHeading = document.createElement("h6")
            subtypeHeading.classList.add("text-secondary")
            subtypeHeading.textContent = subtype
            interceptorActions.appendChild(subtypeHeading)

            for (const action of actionList) {
                const check = document.createElement("div")
                check.classList.add("form-check", "ms-3")

                const input = document.createElement("input")
                input.classList.add("form-check-input")
                input.type = "radio"
                input.name = "action"
                input.id = `action-${action.key}`
                input.value = action.key

                const label = document.createElement("label")
                label.classList.add("form-check-label")
                label.setAttribute("for", `action-${action.key}`)
                label.textContent = action.name

                check.appendChild(input)
                check.appendChild(label)
                interceptorActions.appendChild(check)
            }
        }
    }
}
