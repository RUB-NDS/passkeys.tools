import { renderKeys } from "./main.js"
import { renderUsers } from "./main.js"

const STORAGE_CONFIG_KEY = "storageConfig"

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

            return true
        } catch (error) {
            console.error("Connection test failed:", error)
            return false
        }
    }
}

// Export singleton instance
export const storage = new StorageInterface()

// Initialize settings UI
export const renderStorageSettings = () => {
    const localMode = document.getElementById("localStorageMode")
    const remoteMode = document.getElementById("remoteStorageMode")
    const remoteConfig = document.getElementById("remoteStorageConfig")
    const saveButton = document.getElementById("saveSettings")
    const testButton = document.getElementById("testConnection")
    const remoteUrlInput = document.getElementById("remoteUrl")
    const secretKeyInput = document.getElementById("secretKey")
    const saveStatus = document.getElementById("saveStatus")
    const connectionStatus = document.getElementById("connectionStatus")

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

            config.url = url
            config.secretKey = secretKey
        }

        setStorageConfig(config)
        saveStatus.innerHTML = "<span class='text-success'>Settings saved successfully!</span>"

        await renderKeys()
        await renderUsers()

        // Clear status after 3 seconds
        setTimeout(() => {
            saveStatus.innerHTML = ""
        }, 3000)
    })
}
