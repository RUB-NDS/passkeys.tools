import { storage } from "./storage.js"
import { searchHistory } from "./search.js"

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
        copyBtn.innerHTML = '<i class="bi bi-check"></i> Copied!'
        copyBtn.classList.add("btn-success")
        copyBtn.classList.remove("btn-secondary")
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copy Full Entry'
            copyBtn.classList.remove("btn-success")
            copyBtn.classList.add("btn-secondary")
        }, 2000)
    }

    modal.show()
}

export const renderHistory = async (searchQuery = "") => {
    const allHistory = await getHistory()
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
        tbody.innerHTML = ""
        if (searchQuery && allHistory.length > 0) {
            emptyMessage.textContent = "No entries match your search criteria."
        } else {
            emptyMessage.textContent = "No history entries yet. Interceptions will appear here."
        }
        emptyMessage.style.display = "block"
        return
    }

    emptyMessage.style.display = "none"
    tbody.innerHTML = ""

    history.forEach(entry => {
        const row = document.createElement("tr")

        // Timestamp
        const timestampCell = document.createElement("td")
        timestampCell.textContent = formatTimestamp(entry.timestamp)
        row.appendChild(timestampCell)

        // Mode
        const modeCell = document.createElement("td")
        const modeBadge = document.createElement("span")
        modeBadge.className = "badge bg-secondary"
        modeBadge.textContent = entry.mode
        modeCell.appendChild(modeBadge)
        row.appendChild(modeCell)

        // Type
        const typeCell = document.createElement("td")
        const typeBadge = document.createElement("span")
        typeBadge.className = "badge bg-secondary"
        typeBadge.textContent = entry.type
        typeCell.appendChild(typeBadge)
        row.appendChild(typeCell)

        // Status
        const statusCell = document.createElement("td")
        const statusBadge = document.createElement("span")
        statusBadge.className = entry.status === "resolved" ? "badge bg-success" :
                                entry.status === "dismissed" ? "badge bg-warning" : "badge bg-danger"
        statusBadge.textContent = entry.status || "resolved"
        statusCell.appendChild(statusBadge)
        row.appendChild(statusCell)

        // Origin
        const originCell = document.createElement("td")
        originCell.textContent = truncateText(entry.origin, 40)
        originCell.title = entry.origin
        row.appendChild(originCell)

        // Credential ID
        const credentialIdCell = document.createElement("td")
        credentialIdCell.textContent = truncateText(entry.credentialId, 20)
        credentialIdCell.title = entry.credentialId || "N/A"
        row.appendChild(credentialIdCell)

        // Key
        const keyCell = document.createElement("td")
        keyCell.textContent = truncateText(entry.key, 30)
        keyCell.title = entry.key || "N/A"
        row.appendChild(keyCell)

        // User Handle
        const userHandleCell = document.createElement("td")
        userHandleCell.textContent = truncateText(entry.userHandle, 20)
        userHandleCell.title = entry.userHandle || "N/A"
        row.appendChild(userHandleCell)

        // Modification
        const modificationCell = document.createElement("td")
        if (entry.modification) {
            const modBadge = document.createElement("span")
            modBadge.className = "badge bg-secondary"
            modBadge.textContent = truncateText(entry.modification, 25)
            modBadge.title = entry.modification
            modificationCell.appendChild(modBadge)
        } else {
            modificationCell.textContent = "None"
        }
        row.appendChild(modificationCell)

        // Actions
        const actionsCell = document.createElement("td")
        const actionsDiv = document.createElement("div")
        actionsDiv.className = "btn-group btn-group-sm"

        const viewBtn = document.createElement("button")
        viewBtn.className = "btn btn-outline-primary"
        viewBtn.innerHTML = '<i class="bi bi-eye"></i>'
        viewBtn.title = "View Details"
        viewBtn.onclick = () => showHistoryDetails(entry)

        const copyBtn = document.createElement("button")
        copyBtn.className = "btn btn-outline-secondary"
        copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>'
        copyBtn.title = "Copy JSON"
        copyBtn.onclick = async () => {
            await navigator.clipboard.writeText(JSON.stringify(entry, null, 2))
            copyBtn.innerHTML = '<i class="bi bi-check"></i>'
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>'
            }, 2000)
        }

        const deleteBtn = document.createElement("button")
        deleteBtn.className = "btn btn-outline-danger"
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>'
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
