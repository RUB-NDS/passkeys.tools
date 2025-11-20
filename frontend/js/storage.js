import { renderKeys } from "./main.js"
import { renderUsers } from "./main.js"
import { renderHistory } from "./history.js"

const STORAGE_CONFIG_KEY = "storageConfig"
const THEME_CONFIG_KEY = "themeConfig"

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
        // Validate secretKey and type
        if (config.secretKey && config.secretKey.includes("_")) {
            throw new Error("Secret key cannot contain underscores")
        }
        if (type && type.includes("_")) {
            throw new Error("Type cannot contain underscores")
        }

        try {
            const response = await fetch(`${config.url}/api/data/${config.secretKey}/${type}`, {
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
            return data || {}
        } catch (error) {
            console.error("Error fetching from remote storage:", error)
            throw error
        }
    }

    async setRemote(type, data, config) {
        // Validate secretKey and type
        if (config.secretKey && config.secretKey.includes("_")) {
            throw new Error("Secret key cannot contain underscores")
        }
        if (type && type.includes("_")) {
            throw new Error("Type cannot contain underscores")
        }

        try {
            const response = await fetch(`${config.url}/api/data/${config.secretKey}/${type}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
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
    async testConnection(url, secretKey) {
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
            const response = await fetch(`${config.url}/api/data/${config.secretKey}/${type}/${encodeURIComponent(key)}`, {
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

            return await response.json()
        } catch (error) {
            console.error("Error fetching item from remote storage:", error)
            throw error
        }
    }

    async setRemoteItem(type, key, value, config) {
        try {
            const response = await fetch(`${config.url}/api/data/${config.secretKey}/${type}/${encodeURIComponent(key)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(value)
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
            const response = await fetch(`${config.url}/api/data/${config.secretKey}/${type}/${encodeURIComponent(key)}`, {
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
    const remoteUrlInput = document.getElementById("storageRemoteUrl")
    const secretKeyInput = document.getElementById("storageSecretKey")
    const saveStatus = document.getElementById("storageStatus")
    const connectionStatus = document.getElementById("storageConnectionStatus")

    // Load current config
    const config = getStorageConfig()
    if (config.mode === "remote") {
        remoteMode.checked = true
        remoteConfig.style.display = "block"
        if (config.url) remoteUrlInput.value = config.url
        if (config.secretKey) secretKeyInput.value = config.secretKey
    }

    // Handle mode change
    const handleModeChange = () => {
        if (remoteMode.checked) {
            remoteConfig.style.display = "block"
        } else {
            remoteConfig.style.display = "none"
        }
    }

    localMode?.addEventListener("change", handleModeChange)
    remoteMode?.addEventListener("change", handleModeChange)

    // Test connection
    testButton?.addEventListener("click", async () => {
        const url = remoteUrlInput.value.trim()
        const secretKey = secretKeyInput.value.trim()

        if (!url || !secretKey) {
            connectionStatus.innerHTML = "<span class='text-danger'>Please enter both URL and secret key</span>"
            return
        }

        if (secretKey.includes("_")) {
            connectionStatus.innerHTML = "<span class='text-danger'>Secret key cannot contain underscores</span>"
            return
        }

        connectionStatus.innerHTML = "<span class='text-info'>Testing connection...</span>"

        const success = await storage.testConnection(url, secretKey)
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
            const secretKey = secretKeyInput.value.trim()

            if (!url || !secretKey) {
                saveStatus.innerHTML = "<span class='text-danger'>Please enter both URL and secret key for remote storage</span>"
                return
            }

            if (secretKey.includes("_")) {
                saveStatus.innerHTML = "<span class='text-danger'>Secret key cannot contain underscores</span>"
                return
            }

            config.url = url
            config.secretKey = secretKey
        }

        setStorageConfig(config)
        saveStatus.innerHTML = "<span class='text-success'>Settings saved successfully!</span>"

        await renderKeys()
        await renderUsers()
        await renderHistory()

        // Clear status after 3 seconds
        setTimeout(() => {
            saveStatus.innerHTML = ""
        }, 3000)
    })
}
