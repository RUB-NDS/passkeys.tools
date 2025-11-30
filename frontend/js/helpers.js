/**
 * General helper utilities for the frontend.
 * Provides DOM manipulation helpers and utility functions.
 */

export const deepEqual = (a, b) => {
    if (a === b) return true

    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null)
        return false

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length)
        return false

    for (const key of keysA) {
        if (!keysB.includes(key) || !deepEqual(a[key], b[key]))
            return false
    }

    return true
}

// Helper to create icon element safely
export const createIcon = (iconClass, extraClasses = "") => {
    const icon = document.createElement("i")
    icon.className = `bi ${iconClass}${extraClasses ? " " + extraClasses : ""}`
    return icon
}

// Helper to set button content with icon safely
export const setButtonContent = (button, iconClass, text, iconExtraClasses = "me-1") => {
    button.replaceChildren()
    button.appendChild(createIcon(iconClass, iconExtraClasses))
    button.appendChild(document.createTextNode(text))
}

// Helper to set button icon only
export const setButtonIcon = (button, iconClass) => {
    button.replaceChildren()
    button.appendChild(createIcon(iconClass))
}

// Helper to set status message safely
export const setStatusMessage = (element, message, type = "info") => {
    element.replaceChildren()
    const span = document.createElement("span")
    span.className = `text-${type}`
    span.textContent = message
    element.appendChild(span)
}

// Helper to clear status message
export const clearStatus = (element) => {
    element.replaceChildren()
}

// Helper to change hostname to a different site (handles localhost and single-part domains)
export const toCrossSiteHostname = (hostname) => {
    // If hostname has a dot, replace the TLD
    if (hostname.includes(".")) {
        return hostname.replace(/\.[^.]+$/, ".rocks")
    }
    // For localhost or single-part domains, append .rocks
    return hostname + ".rocks"
}
