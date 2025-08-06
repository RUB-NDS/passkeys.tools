import { showTab } from "./main.js"

const selectCredentialAndKey = (keyName) => {
    console.log(`Selecting credential and key: ${keyName}`)

    // Find the select elements
    const createCredentialIdSelect = document.querySelector("#createCredentialIdSelect")
    const createKeySelect = document.querySelector("#createKeySelect")
    const getCredentialIdSelect = document.querySelector("#getCredentialIdSelect")
    const getKeySelect = document.querySelector("#getKeySelect")

    if (createCredentialIdSelect && createKeySelect) {
        // Select credential ID by text
        for (const option of createCredentialIdSelect.options) {
            if (option.text === keyName) {
                createCredentialIdSelect.value = option.value
                createCredentialIdSelect.dispatchEvent(new Event("change"))
                break
            }
        }
        // Select key by text
        for (const option of createKeySelect.options) {
            if (option.text === keyName) {
                createKeySelect.value = option.value
                createKeySelect.dispatchEvent(new Event("change"))
                break
            }
        }
    } else if (getCredentialIdSelect && getKeySelect) {
        // Select credential ID by text
        for (const option of getCredentialIdSelect.options) {
            if (option.text === keyName) {
                getCredentialIdSelect.value = option.value
                getCredentialIdSelect.dispatchEvent(new Event("change"))
                break
            }
        }
        // Select key by text
        for (const option of getKeySelect.options) {
            if (option.text === keyName) {
                getKeySelect.value = option.value
                getKeySelect.dispatchEvent(new Event("change"))
                break
            }
        }
    }
}

const shortcuts = {
    "Ctrl+0": { action: () => showTab("info"), description: "Navigate to Info tab" },
    "Ctrl+1": { action: () => showTab("create"), description: "Navigate to Create tab" },
    "Ctrl+2": { action: () => showTab("get"), description: "Navigate to Get tab" },
    "Ctrl+3": { action: () => showTab("attestation"), description: "Navigate to Attestation tab" },
    "Ctrl+4": { action: () => showTab("assertion"), description: "Navigate to Assertion tab" },
    "Ctrl+K": { action: () => showTab("keys"), description: "Navigate to Keys tab" },
    "Ctrl+U": { action: () => showTab("users"), description: "Navigate to Users tab" },
    "Ctrl+T": { action: () => showTab("converters"), description: "Navigate to Converters tab" },
    "Ctrl+I": { action: () => showTab("interceptor"), description: "Navigate to Interceptor tab" },
    "Ctrl+H": { action: () => showTab("history"), description: "Navigate to History tab" },
    "Ctrl+#": { action: () => showTab("settings"), description: "Navigate to Settings tab" },

    "Ctrl+S": {
        action: () => {
            const sendBtn = document.querySelector("#interceptorSendButton")
            if (sendBtn) sendBtn.click()
        },
        description: "Send response in Interceptor tab"
    },

    // Attacker credentials - using Ctrl+Shift+letters
    "Ctrl+Shift+Q": {
        action: () => selectCredentialAndKey("attacker | ES256"),
        description: "Select attacker | ES256 credential and key"
    },
    "Ctrl+Shift+W": {
        action: () => selectCredentialAndKey("attacker | ES384"),
        description: "Select attacker | ES384 credential and key"
    },
    "Ctrl+Shift+E": {
        action: () => selectCredentialAndKey("attacker | ES512"),
        description: "Select attacker | ES512 credential and key"
    },
    "Ctrl+Shift+R": {
        action: () => selectCredentialAndKey("attacker | PS256"),
        description: "Select attacker | PS256 credential and key"
    },
    "Ctrl+Shift+T": {
        action: () => selectCredentialAndKey("attacker | PS384"),
        description: "Select attacker | PS384 credential and key"
    },
    "Ctrl+Shift+Z": {
        action: () => selectCredentialAndKey("attacker | PS512"),
        description: "Select attacker | PS512 credential and key"
    },
    "Ctrl+Shift+U": {
        action: () => selectCredentialAndKey("attacker | RS256"),
        description: "Select attacker | RS256 credential and key"
    },
    "Ctrl+Shift+I": {
        action: () => selectCredentialAndKey("attacker | RS384"),
        description: "Select attacker | RS384 credential and key"
    },
    "Ctrl+Shift+O": {
        action: () => selectCredentialAndKey("attacker | RS512"),
        description: "Select attacker | RS512 credential and key"
    },
    "Ctrl+Shift+P": {
        action: () => selectCredentialAndKey("attacker | EdDSA"),
        description: "Select attacker | EdDSA credential and key"
    },

    // Victim credentials - using Ctrl+Shift+letters A-J
    "Ctrl+Shift+A": {
        action: () => selectCredentialAndKey("victim | ES256"),
        description: "Select victim | ES256 credential and key"
    },
    "Ctrl+Shift+S": {
        action: () => selectCredentialAndKey("victim | ES384"),
        description: "Select victim | ES384 credential and key"
    },
    "Ctrl+Shift+D": {
        action: () => selectCredentialAndKey("victim | ES512"),
        description: "Select victim | ES512 credential and key"
    },
    "Ctrl+Shift+F": {
        action: () => selectCredentialAndKey("victim | PS256"),
        description: "Select victim | PS256 credential and key"
    },
    "Ctrl+Shift+G": {
        action: () => selectCredentialAndKey("victim | PS384"),
        description: "Select victim | PS384 credential and key"
    },
    "Ctrl+Shift+H": {
        action: () => selectCredentialAndKey("victim | PS512"),
        description: "Select victim | PS512 credential and key"
    },
    "Ctrl+Shift+J": {
        action: () => selectCredentialAndKey("victim | RS256"),
        description: "Select victim | RS256 credential and key"
    },
    "Ctrl+Shift+K": {
        action: () => selectCredentialAndKey("victim | RS384"),
        description: "Select victim | RS384 credential and key"
    },
    "Ctrl+Shift+L": {
        action: () => selectCredentialAndKey("victim | RS512"),
        description: "Select victim | RS512 credential and key"
    },
    "Ctrl+Shift+Y": {
        action: () => selectCredentialAndKey("victim | EdDSA"),
        description: "Select victim | EdDSA credential and key"
    },

    // Special credential ID selection
    "Ctrl+Shift+X": {
        action: () => {
            const createCredentialIdSelect = document.querySelector("#createCredentialIdSelect")
            const getCredentialIdSelect = document.querySelector("#getCredentialIdSelect")

            if (createCredentialIdSelect) {
                // Find and select the "32 random bytes" option
                for (const option of createCredentialIdSelect.options) {
                    if (option.text === "32 random bytes") {
                        createCredentialIdSelect.value = option.value
                        createCredentialIdSelect.dispatchEvent(new Event("change"))
                        break
                    }
                }
            } else if (getCredentialIdSelect) {
                // Find and select the "32 random bytes" option
                for (const option of getCredentialIdSelect.options) {
                    if (option.text === "32 random bytes") {
                        getCredentialIdSelect.value = option.value
                        getCredentialIdSelect.dispatchEvent(new Event("change"))
                        break
                    }
                }
            }
        },
        description: "Select 32 random bytes for credential ID"
    }
}

export const initShortcuts = () => {
    document.addEventListener("keydown", (e) => {
        let key = ""
        if (e.ctrlKey || e.metaKey) key += "Ctrl+"
        if (e.altKey) key += "Alt+"
        if (e.shiftKey) key += "Shift+"

        if (e.key === "Enter") {
            key += "Enter"
        }
        else if (e.key >= "0" && e.key <= "9") {
            key += e.key
        }
        else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
            key += e.key.toUpperCase()
        }
        else if (e.key === ",") {
            key += ","
        }
        else if (e.key === "#") {
            key += "#"
        } else {
            return
        }

        console.log(`Shortcut: ${key}`)
        const shortcut = shortcuts[key]
        if (shortcut) {
            e.preventDefault()
            shortcut.action()
        }
    })
}

export const renderShortcuts = () => {
    const shortcutsTable = document.querySelector("#shortcutsTable")
    const tbody = shortcutsTable.querySelector("tbody")
    tbody.innerHTML = ""

    Object.entries(shortcuts).forEach(([key, shortcut]) => {
        const row = document.createElement("tr")

        const keyCell = document.createElement("td")
        const keys = key.split("+")
        keys.forEach((k, index) => {
            const kbd = document.createElement("kbd")
            kbd.textContent = k
            keyCell.appendChild(kbd)
            if (index < keys.length - 1) {
                keyCell.appendChild(document.createTextNode(" + "))
            }
        })
        row.appendChild(keyCell)

        const descCell = document.createElement("td")
        descCell.textContent = shortcut.description
        row.appendChild(descCell)

        tbody.appendChild(row)
    })
}
