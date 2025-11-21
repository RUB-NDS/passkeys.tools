const STORAGE_CONFIG_KEY = "storageConfig"
const THEME_CONFIG_KEY = "themeConfig"

// Generate a human-readable secret with high entropy (192 bits)
const generateSecret = () => {
    const bytes = new Uint8Array(24) // 24 bytes = 192 bits of entropy
    crypto.getRandomValues(bytes)

    // Convert to base64url (URL-safe base64)
    const base64 = btoa(String.fromCharCode(...bytes))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// Crypto utility functions for E2EE

// Hash the secret using SHA-256 (returns hex string)
const hashSecret = async (secret) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(secret)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

// Derive an AES-GCM encryption key from the secret
const deriveEncryptionKey = async (secret) => {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    )

    // Use a static salt for deterministic key derivation
    // This is acceptable for this use case where the secret is the main security factor
    const salt = encoder.encode("passkey-storage-e2ee-v1")

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    )
}

// Encrypt a value (returns object with enc and iv fields)
const encryptValue = async (value, secret) => {
    const key = await deriveEncryptionKey(secret)
    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(value))

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
    )

    // Convert to base64 for storage
    const encryptedArray = Array.from(new Uint8Array(encryptedBuffer))
    const ivArray = Array.from(iv)

    return {
        enc: btoa(String.fromCharCode(...encryptedArray)),
        iv: btoa(String.fromCharCode(...ivArray))
    }
}

// Decrypt a value (expects object with enc and iv fields)
const decryptValue = async (encryptedData, secret) => {
    const key = await deriveEncryptionKey(secret)

    // Convert from base64
    const encryptedArray = Uint8Array.from(atob(encryptedData.enc), c => c.charCodeAt(0))
    const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0))

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encryptedArray
    )

    const decoder = new TextDecoder()
    const jsonString = decoder.decode(decryptedBuffer)
    return JSON.parse(jsonString)
}

// Get current theme config
export const getThemeConfig = () => {
    return localStorage.getItem(THEME_CONFIG_KEY) || "auto"
}

// Set theme config
export const setThemeConfig = (theme) => {
    localStorage.setItem(THEME_CONFIG_KEY, theme)
    // Dispatch custom event to notify theme.js
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }))
}

// Get current storage configuration
export const getStorageConfig = () => {
    const config = localStorage.getItem(STORAGE_CONFIG_KEY)
    return config ? JSON.parse(config) : { mode: "local" }
}

// Set storage configuration
export const setStorageConfig = (config) => {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config))
}

// Generic storage interface
class StorageInterface {
    async get(type) {
        const config = getStorageConfig()
        if (config.mode === "local") {
            return this.getLocal(type)
        } else {
            return this.getRemote(type, config)
        }
    }

    async set(type, data) {
        const config = getStorageConfig()
        if (config.mode === "local") {
            return this.setLocal(type, data)
        } else {
            return this.setRemote(type, data, config)
        }
    }

    // Local storage methods
    getLocal(type) {
        const data = localStorage.getItem(type)
        return JSON.parse(data || "{}")
    }

    setLocal(type, data) {
        localStorage.setItem(type, JSON.stringify(data))
        return true
    }

    // Remote storage methods
    async getRemote(type, config) {
        try {
            // Hash the secret for backend identification
            const hashedSecret = await hashSecret(config.secret)

            // Add encryption suffix to type
            const typeSuffix = config.e2ee ? "_enc" : "_plain"
            const fullType = type + typeSuffix

            const response = await fetch(`${config.url}/api/data/${hashedSecret}/${fullType}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                if (response.status === 404) {
                    return {} // Return empty object if not found
                }
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            const data = await response.json()

            // If E2EE is enabled, decrypt each value
            if (config.e2ee && data) {
                const decryptedData = {}
                for (const [key, encryptedValue] of Object.entries(data)) {
                    if (encryptedValue && encryptedValue.enc && encryptedValue.iv) {
                        decryptedData[key] = await decryptValue(encryptedValue, config.secret)
                    } else {
                        decryptedData[key] = encryptedValue
                    }
                }
                return decryptedData
            }

            return data || {}
        } catch (error) {
            console.error("Error fetching from remote storage:", error)
            throw error
        }
    }

    async setRemote(type, data, config) {
        try {
            // Hash the secret for backend identification
            const hashedSecret = await hashSecret(config.secret)

            // Add encryption suffix to type
            const typeSuffix = config.e2ee ? "_enc" : "_plain"
            const fullType = type + typeSuffix

            // If E2EE is enabled, encrypt each value
            let dataToSend = data
            if (config.e2ee && data) {
                const encryptedData = {}
                for (const [key, value] of Object.entries(data)) {
                    encryptedData[key] = await encryptValue(value, config.secret)
                }
                dataToSend = encryptedData
            }

            const response = await fetch(`${config.url}/api/data/${hashedSecret}/${fullType}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataToSend)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            return true
        } catch (error) {
            console.error("Error saving to remote storage:", error)
            throw error
        }
    }

    // Test connection to remote storage
    async testConnection(url, secret) {
        try {
            const response = await fetch(`${url}/api/health`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            const data = await response.json()
            if (data.status !== "ok") {
                throw new Error("Health check failed: status is not ok")
            }

            return true
        } catch (error) {
            console.error("Connection test failed:", error)
            return false
        }
    }

    // Single-item operations
    async getItem(type, key) {
        const config = getStorageConfig()
        if (config.mode === "local") {
            const data = this.getLocal(type)
            return data[key]
        } else {
            return this.getRemoteItem(type, key, config)
        }
    }

    async setItem(type, key, value) {
        const config = getStorageConfig()
        if (config.mode === "local") {
            const data = this.getLocal(type)
            data[key] = value
            this.setLocal(type, data)
            return true
        } else {
            return this.setRemoteItem(type, key, value, config)
        }
    }

    async deleteItem(type, key) {
        const config = getStorageConfig()
        if (config.mode === "local") {
            const data = this.getLocal(type)
            delete data[key]
            this.setLocal(type, data)
            return true
        } else {
            return this.deleteRemoteItem(type, key, config)
        }
    }

    // Remote single-item methods
    async getRemoteItem(type, key, config) {
        try {
            // Hash the secret for backend identification
            const hashedSecret = await hashSecret(config.secret)

            // Add encryption suffix to type
            const typeSuffix = config.e2ee ? "_enc" : "_plain"
            const fullType = type + typeSuffix

            const response = await fetch(`${config.url}/api/data/${hashedSecret}/${fullType}/${encodeURIComponent(key)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (response.status === 404) {
                return undefined
            }

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            const value = await response.json()

            // If E2EE is enabled, decrypt the value
            if (config.e2ee && value && value.enc && value.iv) {
                return await decryptValue(value, config.secret)
            }

            return value
        } catch (error) {
            console.error("Error fetching item from remote storage:", error)
            throw error
        }
    }

    async setRemoteItem(type, key, value, config) {
        try {
            // Hash the secret for backend identification
            const hashedSecret = await hashSecret(config.secret)

            // Add encryption suffix to type
            const typeSuffix = config.e2ee ? "_enc" : "_plain"
            const fullType = type + typeSuffix

            // If E2EE is enabled, encrypt the value
            let valueToSend = value
            if (config.e2ee) {
                valueToSend = await encryptValue(value, config.secret)
            }

            const response = await fetch(`${config.url}/api/data/${hashedSecret}/${fullType}/${encodeURIComponent(key)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(valueToSend)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            return true
        } catch (error) {
            console.error("Error saving item to remote storage:", error)
            throw error
        }
    }

    async deleteRemoteItem(type, key, config) {
        try {
            // Hash the secret for backend identification
            const hashedSecret = await hashSecret(config.secret)

            // Add encryption suffix to type
            const typeSuffix = config.e2ee ? "_enc" : "_plain"
            const fullType = type + typeSuffix

            const response = await fetch(`${config.url}/api/data/${hashedSecret}/${fullType}/${encodeURIComponent(key)}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            return true
        } catch (error) {
            console.error("Error deleting item from remote storage:", error)
            throw error
        }
    }
}

// Export singleton instance
export const storage = new StorageInterface()

// Initialize theme settings UI
export const renderThemeSettings = () => {
    const themeAuto = document.getElementById("themeAuto")
    const themeLight = document.getElementById("themeLight")
    const themeDark = document.getElementById("themeDark")
    const saveButton = document.getElementById("saveTheme")
    const themeStatus = document.getElementById("themeStatus")

    // Load current config
    const config = getThemeConfig()
    if (config === "light") {
        themeLight.checked = true
    } else if (config === "dark") {
        themeDark.checked = true
    } else {
        themeAuto.checked = true
    }

    // Save theme config
    saveButton?.addEventListener("click", () => {
        let selectedTheme = "auto"
        if (themeLight.checked) {
            selectedTheme = "light"
        } else if (themeDark.checked) {
            selectedTheme = "dark"
        }

        setThemeConfig(selectedTheme)
        themeStatus.innerHTML = "<span class='text-success'>Theme saved successfully!</span>"

        // Clear status after 3 seconds
        setTimeout(() => {
            themeStatus.innerHTML = ""
        }, 3000)
    })
}

// Initialize settings UI
export const renderStorageSettings = () => {
    const localMode = document.getElementById("storageLocal")
    const remoteMode = document.getElementById("storageRemote")
    const remoteConfig = document.getElementById("storageRemoteConfig")
    const saveButton = document.getElementById("saveStorage")
    const testButton = document.getElementById("storageTestConnection")
    const regenerateButton = document.getElementById("storageRegenerateKey")
    const remoteUrlInput = document.getElementById("storageRemoteUrl")
    const secretInput = document.getElementById("storageSecret")
    const e2eeCheckbox = document.getElementById("storageE2EE")
    const saveStatus = document.getElementById("storageStatus")
    const connectionStatus = document.getElementById("storageConnectionStatus")

    // Load current config
    const config = getStorageConfig()
    if (config.mode === "remote") {
        remoteMode.checked = true
        remoteConfig.style.display = "block"
        if (config.url) remoteUrlInput.value = config.url
        if (config.secret) secretInput.value = config.secret
        if (config.e2ee) e2eeCheckbox.checked = true
    } else {
        localMode.checked = true
    }

    // Handle mode change
    const handleModeChange = () => {
        if (remoteMode.checked) {
            remoteConfig.style.display = "block"

            // Auto-populate with smart defaults only if this is a fresh setup
            const isFirstTimeSetup = !remoteUrlInput.value.trim() && !secretInput.value.trim()
            if (isFirstTimeSetup) {
                remoteUrlInput.value = "https://db.passkeys.tools"
                secretInput.value = generateSecret()
                e2eeCheckbox.checked = true
            }
        } else {
            remoteConfig.style.display = "none"
        }
    }

    localMode?.addEventListener("change", handleModeChange)
    remoteMode?.addEventListener("change", handleModeChange)

    // Initialize display state
    handleModeChange()

    // Regenerate secret
    regenerateButton?.addEventListener("click", () => {
        secretInput.value = generateSecret()
    })

    // Test connection
    testButton?.addEventListener("click", async () => {
        const url = remoteUrlInput.value.trim()
        const secret = secretInput.value.trim()

        if (!url || !secret) {
            connectionStatus.innerHTML = "<span class='text-danger'>Please enter both URL and secret</span>"
            return
        }

        connectionStatus.innerHTML = "<span class='text-info'>Testing connection...</span>"

        const success = await storage.testConnection(url, secret)
        if (success) {
            connectionStatus.innerHTML = "<span class='text-success'>Connection successful!</span>"
        } else {
            connectionStatus.innerHTML = "<span class='text-danger'>Connection failed. Please check your URL.</span>"
        }
    })

    // Save settings
    saveButton?.addEventListener("click", async () => {
        const config = {
            mode: localMode.checked ? "local" : "remote"
        }

        if (config.mode === "remote") {
            const url = remoteUrlInput.value.trim()
            const secret = secretInput.value.trim()

            if (!url || !secret) {
                saveStatus.innerHTML = "<span class='text-danger'>Please enter both URL and secret for remote storage</span>"
                return
            }

            config.url = url
            config.secret = secret
            config.e2ee = e2eeCheckbox.checked
        }

        setStorageConfig(config)
        saveStatus.innerHTML = "<span class='text-success'>Settings saved successfully!</span>"

        // Dynamic imports to avoid circular dependency
        const { renderKeys } = await import("./main.js")
        const { renderUsers } = await import("./main.js")
        const { renderHistory } = await import("./history.js")

        await renderKeys()
        await renderUsers()
        await renderHistory()

        // Clear status after 3 seconds
        setTimeout(() => {
            saveStatus.innerHTML = ""
        }, 3000)
    })
}
