(() => {
    const SCRIPTS = ["init.js", "globals.js", "helpers.js", "hooks.js"]
    const MODE_ELEMENT_ID = "pk-interceptor-mode"
    const MODE_CHANGE_EVENT = "pk-mode-changed"

    function createModeElement(mode) {
        const element = document.createElement("div")
        element.id = MODE_ELEMENT_ID
        element.setAttribute("data-mode", mode)
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
                    console.error(`[Interceptor] Failed to load ${scriptFile}`)
                    reject(new Error(`Failed to load ${scriptFile}`))
                }
                document.documentElement.appendChild(script)
            }))
        }, Promise.resolve())
    }

    // Initialize extension
    chrome.storage.local.get(["interceptorMode", "extensionEnabled"], (result) => {
        const mode = result.interceptorMode || "default"
        const enabled = result.extensionEnabled !== false // Default to true if not set

        // Inject mode element
        document.documentElement.appendChild(createModeElement(mode))

        // Only load scripts if extension is enabled
        if (enabled) {
            loadScripts(SCRIPTS).catch(console.error)
        } else {
            console.log("[Interceptor] Extension is disabled - hooks not loaded")
        }
    })

    // Listen for mode changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === "local" && changes.interceptorMode) {
            const newMode = changes.interceptorMode.newValue || "default"
            const modeElement = document.getElementById(MODE_ELEMENT_ID)

            if (modeElement) {
                modeElement.setAttribute("data-mode", newMode)
                document.dispatchEvent(
                    new CustomEvent(MODE_CHANGE_EVENT, { detail: { mode: newMode } })
                )
            }
        }
    })
})()
