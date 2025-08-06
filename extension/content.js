(() => {
    const SCRIPTS = ["init.js", "globals.js", "helpers.js", "hooks.js"]
    const MODE_ELEMENT_ID = "pk-interceptor-mode"
    const MODE_CHANGE_EVENT = "pk-mode-changed"
    const POPUP_MODE_CHANGE_EVENT = "pk-popup-mode-changed"
    const FRONTEND_URL_CHANGE_EVENT = "pk-frontend-url-changed"

    function createModeElement(mode, popupMode, frontendUrl) {
        const element = document.createElement("div")
        element.id = MODE_ELEMENT_ID
        element.setAttribute("data-mode", mode)
        element.setAttribute("data-popup-mode", popupMode)
        element.setAttribute("data-frontend-url", frontendUrl)
        element.style.display = "none"
        return element
    }

    function loadScripts(scripts) {
        return scripts.reduce((promise, scriptFile) => {
            return promise.then(() => new Promise((resolve, reject) => {
                const script = document.createElement("script")
                script.src = chrome.runtime.getURL(scriptFile)
                script.type = "text/javascript"
                script.onload = resolve
                script.onerror = () => {
                    console.error(`[Passkeys.Tools] Failed to load ${scriptFile}`)
                    reject(new Error(`Failed to load ${scriptFile}`))
                }
                // Insert as first element in head
                const head = document.head || document.getElementsByTagName("head")[0]
                if (head.firstChild) {
                    head.insertBefore(script, head.firstChild)
                } else {
                    head.appendChild(script)
                }
            }))
        }, Promise.resolve())
    }

    // Initialize extension
    chrome.storage.local.get(["interceptorMode", "extensionEnabled", "popupMode", "frontendUrl"], (result) => {
        const mode = result.interceptorMode || "default"
        const enabled = result.extensionEnabled !== false // Default to true if not set
        const popupMode = result.popupMode || "detached"
        const frontendUrl = result.frontendUrl || "https://passkeys.tools"

        // Inject mode element
        document.documentElement.appendChild(createModeElement(mode, popupMode, frontendUrl))

        // Only load scripts if extension is enabled
        if (enabled) {
            loadScripts(SCRIPTS).catch(console.error)
        } else {
            console.log("[Passkeys.Tools] Extension is disabled - hooks not loaded")
        }
    })

    // Listen for mode changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === "local") {
            const modeElement = document.getElementById(MODE_ELEMENT_ID)

            if (changes.interceptorMode && modeElement) {
                const newMode = changes.interceptorMode.newValue || "default"
                modeElement.setAttribute("data-mode", newMode)
                document.dispatchEvent(
                    new CustomEvent(MODE_CHANGE_EVENT, { detail: { mode: newMode } })
                )
            }

            if (changes.popupMode && modeElement) {
                const newPopupMode = changes.popupMode.newValue || "detached"
                modeElement.setAttribute("data-popup-mode", newPopupMode)
                document.dispatchEvent(
                    new CustomEvent(POPUP_MODE_CHANGE_EVENT, { detail: { popupMode: newPopupMode } })
                )
            }

            if (changes.frontendUrl && modeElement) {
                const newFrontendUrl = changes.frontendUrl.newValue || "https://passkeys.tools"
                modeElement.setAttribute("data-frontend-url", newFrontendUrl)
                document.dispatchEvent(
                    new CustomEvent(FRONTEND_URL_CHANGE_EVENT, { detail: { frontendUrl: newFrontendUrl } })
                )
            }
        }
    })
})()
