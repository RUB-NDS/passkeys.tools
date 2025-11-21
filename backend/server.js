import express from "express"
import cors from "cors"
import { getStorage, closeStorage } from "./storage/index.js"

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: "500mb" }))
app.use(express.urlencoded({ extended: true, limit: "500mb" }))

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Get data for a specific secret and type
app.get("/api/data/:secret/:type", async (req, res) => {
    const { secret, type } = req.params

    if (!secret || !type) {
        return res.status(400).json({ error: "Missing secret or type" })
    }

    try {
        const storage = await getStorage()
        const data = await storage.getData(secret, type)
        res.json(data || {})
    } catch (error) {
        console.error("Error getting data:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Store data for a specific secret and type
app.post("/api/data/:secret/:type", async (req, res) => {
    const { secret, type } = req.params
    const payload = req.body

    if (!secret || !type) {
        return res.status(400).json({ error: "Missing secret or type" })
    }

    if (!payload || typeof payload !== "object") {
        return res.status(400).json({ error: "Invalid payload" })
    }

    try {
        const storage = await getStorage()
        await storage.setData(secret, type, payload)
        res.json({ success: true })
    } catch (error) {
        console.error("Error storing data:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Get a single item
app.get("/api/data/:secret/:type/:key", async (req, res) => {
    const { secret, type, key } = req.params

    if (!secret || !type || !key) {
        return res.status(400).json({ error: "Missing secret, type, or key" })
    }

    try {
        const storage = await getStorage()
        const item = await storage.getItem(secret, type, key)

        if (item === undefined) {
            return res.status(404).json({ error: "Item not found" })
        }

        res.json(item)
    } catch (error) {
        console.error("Error getting item:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Set/update a single item
app.post("/api/data/:secret/:type/:key", async (req, res) => {
    const { secret, type, key } = req.params
    const value = req.body

    if (!secret || !type || !key) {
        return res.status(400).json({ error: "Missing secret, type, or key" })
    }

    if (!value || typeof value !== "object") {
        return res.status(400).json({ error: "Invalid value" })
    }

    try {
        const storage = await getStorage()
        await storage.setItem(secret, type, key, value)
        res.json({ success: true })
    } catch (error) {
        console.error("Error setting item:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Delete a single item
app.delete("/api/data/:secret/:type/:key", async (req, res) => {
    const { secret, type, key } = req.params

    if (!secret || !type || !key) {
        return res.status(400).json({ error: "Missing secret, type, or key" })
    }

    try {
        const storage = await getStorage()
        await storage.deleteItem(secret, type, key)
        res.json({ success: true })
    } catch (error) {
        console.error("Error deleting item:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Start server
async function start() {
    try {
        // Initialize storage
        await getStorage()

        const server = app.listen(PORT, () => {
            console.log(`Backend server running on port ${PORT}`)
            console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
            if (process.env.NODE_ENV === "production" && process.env.MONGO_URL) {
                console.log(`Using MongoDB storage: ${process.env.MONGO_URL}`)
            } else {
                console.log(`Using file storage: ${process.env.DATA_FILE || "data.json"}`)
            }
        })

        // Graceful shutdown
        process.on("SIGTERM", async () => {
            console.log("SIGTERM signal received: closing HTTP server")
            server.close(async () => {
                await closeStorage()
                console.log("HTTP server closed")
                process.exit(0)
            })
        })

        process.on("SIGINT", async () => {
            console.log("SIGINT signal received: closing HTTP server")
            server.close(async () => {
                await closeStorage()
                console.log("HTTP server closed")
                process.exit(0)
            })
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
}

start()
