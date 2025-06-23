document.addEventListener("DOMContentLoaded", async () => {
    const statusElement = document.getElementById("status")
    const modeOptions = document.querySelectorAll(".mode-option")
    const radioInputs = document.querySelectorAll("input[name='mode']")
    const enableToggle = document.getElementById("enableToggle")
    const popupModeInputs = document.querySelectorAll("input[name='popupMode']")

    function showStatus(message, type) {
        statusElement.textContent = message
        statusElement.className = `alert mt-3 alert-${type}`
        statusElement.classList.remove("d-none")
    }

    function updateSelectedOption(mode) {
        modeOptions.forEach(option => {
            const isSelected = option.dataset.mode === mode
            option.classList.toggle("selected", isSelected)
            if (isSelected) {
                option.querySelector("input").checked = true
            }
        })
    }

    function toggleModeOptions(enabled) {
        modeOptions.forEach(option => {
            option.style.opacity = enabled ? "1" : "0.5"
            option.style.pointerEvents = enabled ? "auto" : "none"
            option.querySelector("input").disabled = !enabled
        })
    }

    // Load current settings
    try {
        const { interceptorMode = "default", extensionEnabled = true, popupMode = "detached" } = await chrome.storage.local.get(["interceptorMode", "extensionEnabled", "popupMode"])
        updateSelectedOption(interceptorMode)
        enableToggle.checked = extensionEnabled
        toggleModeOptions(extensionEnabled)
        
        // Set popup mode radio
        const popupModeRadio = document.querySelector(`input[name="popupMode"][value="${popupMode}"]`)
        if (popupModeRadio) {
            popupModeRadio.checked = true
        }
        
        showStatus(extensionEnabled ? `Current mode: ${interceptorMode}` : "Extension disabled", extensionEnabled ? "info" : "secondary")
    } catch (error) {
        console.error("Error loading settings:", error)
        showStatus("Error loading saved settings", "danger")
    }

    // Handle mode changes
    modeOptions.forEach(option => {
        option.addEventListener("click", async (e) => {
            if (e.target.type === "radio") return

            const mode = option.dataset.mode
            const radio = option.querySelector("input")
            radio.checked = true

            try {
                await chrome.storage.local.set({ interceptorMode: mode })
                updateSelectedOption(mode)
                showStatus(`Mode changed to: ${mode}`, "success")

                setTimeout(() => {
                    showStatus(`Current mode: ${mode}`, "info")
                }, 2000)
            } catch (error) {
                console.error("Error saving mode:", error)
                showStatus("Error saving mode", "danger")
            }
        })
    })

    radioInputs.forEach(input => {
        input.addEventListener("change", async (e) => {
            const mode = e.target.value

            try {
                await chrome.storage.local.set({ interceptorMode: mode })
                updateSelectedOption(mode)
                showStatus(`Mode changed to: ${mode}`, "success")

                setTimeout(() => {
                    showStatus(`Current mode: ${mode}`, "info")
                }, 2000)
            } catch (error) {
                console.error("Error saving mode:", error)
                showStatus("Error saving mode", "danger")
            }
        })
    })

    // Handle enable/disable toggle
    enableToggle.addEventListener("change", async (e) => {
        const enabled = e.target.checked

        try {
            await chrome.storage.local.set({ extensionEnabled: enabled })
            toggleModeOptions(enabled)
            
            if (enabled) {
                const { interceptorMode = "default" } = await chrome.storage.local.get(["interceptorMode"])
                showStatus(`Extension enabled - Mode: ${interceptorMode}`, "success")
            } else {
                showStatus("Extension disabled", "secondary")
            }
        } catch (error) {
            console.error("Error saving enabled state:", error)
            showStatus("Error saving enabled state", "danger")
        }
    })

    // Handle popup mode changes
    popupModeInputs.forEach(input => {
        input.addEventListener("change", async (e) => {
            const popupMode = e.target.value

            try {
                await chrome.storage.local.set({ popupMode: popupMode })
                showStatus(`Popup mode changed to: ${popupMode}`, "success")

                setTimeout(() => {
                    const currentMode = document.querySelector("input[name='mode']:checked")?.value || "default"
                    showStatus(`Current mode: ${currentMode}`, "info")
                }, 2000)
            } catch (error) {
                console.error("Error saving popup mode:", error)
                showStatus("Error saving popup mode", "danger")
            }
        })
    })
})
