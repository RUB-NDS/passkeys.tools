/* Initialize global namespace */
window._pk = window._pk || {}

/* Read initial mode from DOM */
const modeElement = document.getElementById("pk-interceptor-mode")
if (modeElement) {
    window._pk.interceptorMode = modeElement.getAttribute("data-mode") || "default"
}

/* Listen for mode changes */
document.addEventListener("pk-mode-changed", (event) => {
    if (event.detail?.mode) {
        window._pk.interceptorMode = event.detail.mode
    }
})
