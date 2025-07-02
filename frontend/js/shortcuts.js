import { showTab } from "./main.js"

const shortcuts = {
    "Ctrl+1": { action: () => showTab("info"), description: "Navigate to Info tab" },
    "Ctrl+2": { action: () => showTab("create"), description: "Navigate to Create tab" },
    "Ctrl+3": { action: () => showTab("get"), description: "Navigate to Get tab" },
    "Ctrl+4": { action: () => showTab("attestation"), description: "Navigate to Attestation tab" },
    "Ctrl+5": { action: () => showTab("assertion"), description: "Navigate to Assertion tab" },
    "Ctrl+6": { action: () => showTab("keys"), description: "Navigate to Keys tab" },
    "Ctrl+7": { action: () => showTab("users"), description: "Navigate to Users tab" },
    "Ctrl+8": { action: () => showTab("converters"), description: "Navigate to Converters tab" },
    "Ctrl+9": { action: () => showTab("interceptor"), description: "Navigate to Interceptor tab" },
    "Ctrl+0": { action: () => showTab("settings"), description: "Navigate to Settings tab" },
    "Ctrl+H": { action: () => showTab("history"), description: "Navigate to History tab" },

    "Ctrl+S": {
        action: () => {
            const sendBtn = document.querySelector("#interceptorSendButton")
            if (sendBtn) sendBtn.click()
        },
        description: "Send response in Interceptor tab"
    }
}

export const initShortcuts = () => {
    document.addEventListener("keydown", (e) => {
        let key = ""
        if (e.ctrlKey) key += "Ctrl+"
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
        } else {
            return
        }

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
