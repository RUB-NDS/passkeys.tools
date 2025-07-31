import { storage } from "./storage.js"
import { renderUsers } from "./main.js"

export const storeUser = async (userId, user) => {
    await storage.setItem("users", userId, user)
}

export const deleteUser = async (userId) => {
    await storage.deleteItem("users", userId)
}

export const getUsers = async () => {
    const users = await storage.get("users")
    return users
}

export const getUserByRpIdAndMode = async (rpId, mode) => {
    const users = await getUsers()
    for (const [id, user] of Object.entries(users)) {
        if (user.rpId === rpId && user.mode === mode) {
            return user
        }
    }
    return undefined
}

export const clearUsers = async () => {
    await storage.set("users", {})
    await renderUsers()
}

export const exportUsers = async () => {
    const usersData = await storage.get("users")
    const dataStr = JSON.stringify(usersData || {}, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `passkey-users-${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
}

export const importUsers = async (file) => {
    try {
        const text = await file.text()
        const importedData = JSON.parse(text)

        // Validate the imported data
        if (typeof importedData !== "object" || importedData === null) {
            throw new Error("Invalid users format: expected an object")
        }

        // Get current users
        const currentUsers = await storage.get("users") || {}

        // Merge imported data with current users (imported overwrites existing)
        const mergedUsers = { ...currentUsers, ...importedData }

        // Save the merged users
        await storage.set("users", mergedUsers)

        // Re-render the users view
        await renderUsers()

        // Count how many users were imported
        const importedCount = Object.keys(importedData).length
        const overwrittenCount = Object.keys(importedData).filter(key => key in currentUsers).length
        const newCount = importedCount - overwrittenCount

        return {
            success: true,
            imported: importedCount,
            new: newCount,
            overwritten: overwrittenCount
        }
    } catch (error) {
        console.error("Error importing users:", error)
        return {
            success: false,
            error: error.message
        }
    }
}

// Set up event handlers when module loads
document.addEventListener("DOMContentLoaded", () => {
    const exportBtn = document.getElementById("exportUsersBtn")
    if (exportBtn) {
        exportBtn.addEventListener("click", exportUsers)
    }

    const clearBtn = document.getElementById("clearUsersBtn")
    if (clearBtn) {
        clearBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to clear all users?")) {
                await clearUsers()
            }
        })
    }

    const importBtn = document.getElementById("importUsersBtn")
    if (importBtn) {
        importBtn.addEventListener("click", () => {
            const input = document.createElement("input")
            input.type = "file"
            input.accept = ".json"
            input.onchange = async (e) => {
                const file = e.target.files[0]
                if (file) {
                    const result = await importUsers(file)
                    if (result.success) {
                        alert(`Import successful!\n\nTotal users: ${result.imported}\nNew users: ${result.new}\nOverwritten: ${result.overwritten}`)
                    } else {
                        alert(`Import failed: ${result.error}`)
                    }
                }
            }
            input.click()
        })
    }
})
