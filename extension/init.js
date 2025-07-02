/* Initialize global namespace */
window._pk = window._pk || {}

/* Read initial mode from DOM */
const modeElement = document.getElementById("pk-interceptor-mode")
if (modeElement) {
    window._pk.interceptorMode = modeElement.getAttribute("data-mode") || "default"
    window._pk.popupMode = modeElement.getAttribute("data-popup-mode") || "detached"
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
