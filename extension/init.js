/**
 * Extension initialization script (runs in page context).
 * Sets up the global namespace and listens for configuration changes.
 */

/* Initialize global namespace */
window._pk = window._pk || {}

/* Read initial mode from DOM */
const modeElement = document.getElementById("pk-interceptor-mode")
if (modeElement) {
    window._pk.interceptorMode = modeElement.getAttribute("data-mode") || "default"
    window._pk.popupMode = modeElement.getAttribute("data-popup-mode") || "detached"
    window._pk.frontendUrl = modeElement.getAttribute("data-frontend-url") || "https://passkeys.tools"
}

/* Listen for mode changes */
document.addEventListener("pk-mode-changed", (event) => {
    if (event.detail?.mode) {
        window._pk.interceptorMode = event.detail.mode
    }
})

/* Listen for popup mode changes */
document.addEventListener("pk-popup-mode-changed", (event) => {
    if (event.detail?.popupMode) {
        window._pk.popupMode = event.detail.popupMode
    }
})

/* Listen for frontend URL changes */
document.addEventListener("pk-frontend-url-changed", (event) => {
    if (event.detail?.frontendUrl) {
        window._pk.frontendUrl = event.detail.frontendUrl
    }
})
