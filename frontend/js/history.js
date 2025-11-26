import { storage } from "./storage.js"
import { searchHistory } from "./search.js"
import { showStorageError } from "./main.js"
import { setButtonContent, setButtonIcon } from "./helpers.js"

/* History entry structure:
{
    timestamp: number,
    mode: string,
    type: string,
    status: string, // "resolved" or "rejected"
    origin: string,
    info: object,
    credentialId: string,
    key: string,
    userHandle: string,
    modification: string,
    request: object,
    response: object
}
*/

export const getHistory = async () => {
    const history = await storage.get("history")
    return Object.values(history || {})
        .sort((a, b) => b.timestamp - a.timestamp)
}

export const addHistoryEntry = async (entry) => {
    await storage.setItem("history", entry.timestamp.toString(), entry)
}

export const deleteHistoryEntry = async (timestamp) => {
    await storage.deleteItem("history", timestamp.toString())
}

export const clearHistory = async () => {
    await storage.set("history", {})
}

export const exportHistory = async () => {
    const historyData = await storage.get("history")
    const dataStr = JSON.stringify(historyData || {}, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `passkey-history-${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
}

export const importHistory = async (file) => {
    try {
        const text = await file.text()
        const importedData = JSON.parse(text)

        // Validate the imported data
        if (typeof importedData !== "object" || importedData === null) {
            throw new Error("Invalid history format: expected an object")
        }

        // Get current history to count overwrites
        const currentHistory = await storage.get("history") || {}

        // Import each entry individually using single-item operations
        const importedEntries = Object.entries(importedData)
        for (const [timestamp, entry] of importedEntries) {
            await storage.setItem("history", timestamp, entry)
        }

        // Re-render the history view with current search
        await renderHistory(currentSearchQuery)

        // Count how many entries were imported
        const importedCount = importedEntries.length
        const overwrittenCount = importedEntries.filter(([timestamp]) => timestamp in currentHistory).length
        const newCount = importedCount - overwrittenCount

        return {
            success: true,
            imported: importedCount,
            new: newCount,
            overwritten: overwrittenCount
        }
    } catch (error) {
        console.error("Error importing history:", error)
        return {
            success: false,
            error: error.message
        }
    }
}

const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
}

const truncateText = (text, maxLength = 30) => {
    if (!text) return "N/A"
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
}

const showHistoryDetails = (entry) => {
    const modal = new bootstrap.Modal(document.getElementById("historyDetailsModal"))

    // Overview info
    document.getElementById("historyDetailsInfo").textContent = JSON.stringify(entry.info, null, 2)

    // Controls
    document.getElementById("historyDetailsStatus").textContent = entry.status || "resolved"
    document.getElementById("historyDetailsCredentialId").textContent = entry.credentialId || "N/A"
    document.getElementById("historyDetailsKey").textContent = entry.key || "N/A"
    document.getElementById("historyDetailsUserHandle").textContent = entry.userHandle || "N/A"
    document.getElementById("historyDetailsModification").textContent = entry.modification || "None"

    // Request and Response
    document.getElementById("historyDetailsRequest").textContent = JSON.stringify(entry.request, null, 2)
    document.getElementById("historyDetailsResponse").textContent = JSON.stringify(entry.response, null, 2)

    // Copy button
    const copyBtn = document.getElementById("historyDetailsCopyBtn")
    copyBtn.onclick = async () => {
        await navigator.clipboard.writeText(JSON.stringify(entry, null, 2))
        setButtonContent(copyBtn, "bi-check", "Copied!")
        copyBtn.classList.add("btn-success")
        copyBtn.classList.remove("btn-secondary")
        setTimeout(() => {
            setButtonContent(copyBtn, "bi-clipboard", "Copy Full Entry")
            copyBtn.classList.remove("btn-success")
            copyBtn.classList.add("btn-secondary")
        }, 2000)
    }

    modal.show()
}

export const renderHistory = async (searchQuery = "") => {
    let allHistory = []
    try {
        allHistory = await getHistory()
    } catch (error) {
        console.error("Error loading history:", error)
        showStorageError()
    }

    const history = searchQuery ? searchHistory(allHistory, searchQuery) : allHistory
    const tbody = document.getElementById("historyTableBody")
    const emptyMessage = document.getElementById("historyEmptyMessage")
    const searchResultsInfo = document.getElementById("searchResultsInfo")

    // Update search results info
    if (searchResultsInfo) {
        if (searchQuery) {
            searchResultsInfo.textContent = `Showing ${history.length} of ${allHistory.length} entries`
        } else {
            searchResultsInfo.textContent = ""
        }
    }

    if (history.length === 0) {
        tbody.replaceChildren()
        if (searchQuery && allHistory.length > 0) {
            emptyMessage.textContent = "No entries match your search criteria."
        } else {
            emptyMessage.textContent = "No history entries yet. Interceptions will appear here."
        }
        emptyMessage.style.display = "block"
        return
    }

    emptyMessage.style.display = "none"
    tbody.replaceChildren()

    history.forEach(entry => {
        const row = document.createElement("tr")

        // Timestamp
        const timestampCell = document.createElement("td")
        timestampCell.textContent = formatTimestamp(entry.timestamp)
        row.appendChild(timestampCell)

        // Info (Mode, Type, Status, Modification)
        const infoCell = document.createElement("td")
        const infoDiv = document.createElement("div")
        infoDiv.className = "history-info"

        const modeBadge = document.createElement("span")
        modeBadge.className = "badge bg-secondary"
        modeBadge.textContent = entry.mode
        infoDiv.appendChild(modeBadge)

        const typeBadge = document.createElement("span")
        typeBadge.className = "badge bg-info"
        typeBadge.textContent = entry.type
        infoDiv.appendChild(typeBadge)

        const statusBadge = document.createElement("span")
        statusBadge.className = entry.status === "resolved" ? "badge bg-success" :
                                entry.status === "dismissed" ? "badge bg-warning" : "badge bg-danger"
        statusBadge.textContent = entry.status || "resolved"
        infoDiv.appendChild(statusBadge)

        if (entry.modification) {
            const modBadge = document.createElement("span")
            modBadge.className = "badge bg-primary"
            modBadge.textContent = entry.modification
            modBadge.title = entry.modification
            infoDiv.appendChild(modBadge)
        }

        infoCell.appendChild(infoDiv)
        row.appendChild(infoCell)

        // Origin
        const originCell = document.createElement("td")
        const originCode = document.createElement("code")
        originCode.className = "history-key-user-value"
        originCode.textContent = entry.origin || "-"
        originCode.title = entry.origin
        originCell.appendChild(originCode)
        row.appendChild(originCell)

        // Credential / Key / User
        const credKeyUserCell = document.createElement("td")
        const credKeyUserDiv = document.createElement("div")
        credKeyUserDiv.className = "history-key-user"

        // Credential ID
        const credItem = document.createElement("div")
        credItem.className = "history-key-user-item"
        const credLabel = document.createElement("span")
        credLabel.className = "history-key-user-label"
        credLabel.textContent = "Cred"
        const credValue = document.createElement("span")
        credValue.className = "history-key-user-value"
        credValue.textContent = entry.credentialId || "N/A"
        credItem.appendChild(credLabel)
        credItem.appendChild(credValue)
        credKeyUserDiv.appendChild(credItem)

        // Key
        const keyItem = document.createElement("div")
        keyItem.className = "history-key-user-item"
        const keyLabel = document.createElement("span")
        keyLabel.className = "history-key-user-label"
        keyLabel.textContent = "Key"
        const keyValue = document.createElement("span")
        keyValue.className = "history-key-user-value"
        keyValue.textContent = entry.key || "N/A"
        keyItem.appendChild(keyLabel)
        keyItem.appendChild(keyValue)
        credKeyUserDiv.appendChild(keyItem)

        // User
        const userItem = document.createElement("div")
        userItem.className = "history-key-user-item"
        const userLabel = document.createElement("span")
        userLabel.className = "history-key-user-label"
        userLabel.textContent = "User"
        const userValue = document.createElement("span")
        userValue.className = "history-key-user-value"
        userValue.textContent = entry.userHandle || "N/A"
        userItem.appendChild(userLabel)
        userItem.appendChild(userValue)
        credKeyUserDiv.appendChild(userItem)

        credKeyUserCell.appendChild(credKeyUserDiv)
        row.appendChild(credKeyUserCell)

        // Actions
        const actionsCell = document.createElement("td")
        const actionsDiv = document.createElement("div")
        actionsDiv.className = "btn-group btn-group-sm"

        const viewBtn = document.createElement("button")
        viewBtn.className = "btn btn-outline-primary"
        setButtonIcon(viewBtn, "bi-eye")
        viewBtn.title = "View Details"
        viewBtn.onclick = () => showHistoryDetails(entry)

        const copyBtn = document.createElement("button")
        copyBtn.className = "btn btn-outline-secondary"
        setButtonIcon(copyBtn, "bi-clipboard")
        copyBtn.title = "Copy JSON"
        copyBtn.onclick = async () => {
            await navigator.clipboard.writeText(JSON.stringify(entry, null, 2))
            setButtonIcon(copyBtn, "bi-check")
            setTimeout(() => {
                setButtonIcon(copyBtn, "bi-clipboard")
            }, 2000)
        }

        const deleteBtn = document.createElement("button")
        deleteBtn.className = "btn btn-outline-danger"
        setButtonIcon(deleteBtn, "bi-trash")
        deleteBtn.title = "Delete"
        deleteBtn.onclick = async () => {
            if (confirm("Delete this history entry?")) {
                await deleteHistoryEntry(entry.timestamp)
                await renderHistory(currentSearchQuery)
            }
        }

        actionsDiv.appendChild(viewBtn)
        actionsDiv.appendChild(copyBtn)
        actionsDiv.appendChild(deleteBtn)
        actionsCell.appendChild(actionsDiv)
        row.appendChild(actionsCell)

        tbody.appendChild(row)
    })
}

// Variables to track search state
let currentSearchQuery = ""
let searchDebounceTimer = null

// Search functionality
const performSearch = () => {
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
        currentSearchQuery = searchInput.value
        renderHistory(currentSearchQuery)
    }
}

// Set up event handlers when module loads
document.addEventListener("DOMContentLoaded", () => {
    // Search input handlers
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchDebounceTimer)
            searchDebounceTimer = setTimeout(performSearch, 300)
        })

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                clearTimeout(searchDebounceTimer)
                performSearch()
            }
        })
    }

    // Search help button
    const searchHelpBtn = document.getElementById("searchHelpBtn")
    if (searchHelpBtn) {
        searchHelpBtn.addEventListener("click", () => {
            const modal = new bootstrap.Modal(document.getElementById("searchHelpModal"))
            modal.show()
        })
    }

    // Clear search button
    const searchClearBtn = document.getElementById("searchClearBtn")
    if (searchClearBtn) {
        searchClearBtn.addEventListener("click", () => {
            if (searchInput) {
                searchInput.value = ""
                currentSearchQuery = ""
                renderHistory("")
            }
        })
    }

    const exportBtn = document.getElementById("exportHistoryBtn")
    if (exportBtn) {
        exportBtn.addEventListener("click", exportHistory)
    }

    const clearBtn = document.getElementById("clearHistoryBtn")
    if (clearBtn) {
        clearBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to clear all history?")) {
                await clearHistory()
                currentSearchQuery = ""
                const searchInputEl = document.getElementById("searchInput")
                if (searchInputEl) {
                    searchInputEl.value = ""
                }
                await renderHistory("")
            }
        })
    }

    const importBtn = document.getElementById("importHistoryBtn")
    if (importBtn) {
        importBtn.addEventListener("click", () => {
            const input = document.createElement("input")
            input.type = "file"
            input.accept = ".json"
            input.onchange = async (e) => {
                const file = e.target.files[0]
                if (file) {
                    const result = await importHistory(file)
                    if (result.success) {
                        alert(`Import successful!\n\nTotal entries: ${result.imported}\nNew entries: ${result.new}\nOverwritten: ${result.overwritten}`)
                    } else {
                        alert(`Import failed: ${result.error}`)
                    }
                }
            }
            input.click()
        })
    }
})
