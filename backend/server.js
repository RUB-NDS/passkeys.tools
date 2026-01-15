/**
 * Backend server for Passkeys Tools.
 * Provides REST API endpoints for storing and retrieving passkey-related data.
 */

import express from "express"
import cors from "cors"
import { getStorage, closeStorage } from "./storage/index.js"
import logger from "./logger.js"

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "X-Secret-Hash"],
    exposedHeaders: ["Content-Type"],
    methods: ["GET", "POST", "DELETE", "OPTIONS"]
}))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

/**
 * Health check endpoint.
 * Returns server status and current timestamp.
 */
app.get("/api/health", (req, res) => {
    logger.debug("Health check requested")
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

/**
 * Get all data for a specific type.
 * Requires X-Secret-Hash header for data isolation.
 */
app.get("/api/data/:type", async (req, res) => {
    const { type } = req.params
    const secret = req.headers["x-secret-hash"]

    if (!secret || !type) {
        logger.warn("GET /api/data/:type - Missing secret or type")
        return res.status(400).json({ error: "Missing secret or type" })
    }

    try {
        logger.debug(`Getting data for type: ${type}`)
        const storage = await getStorage()
        const data = await storage.getData(secret, type)
        res.json(data || {})
    } catch (error) {
        logger.error("Error getting data:", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
})

/**
 * Store all data for a specific type.
 * Replaces existing data for the type.
 */
app.post("/api/data/:type", async (req, res) => {
    const { type } = req.params
    const secret = req.headers["x-secret-hash"]
    const payload = req.body

    if (!secret || !type) {
        logger.warn("POST /api/data/:type - Missing secret or type")
        return res.status(400).json({ error: "Missing secret or type" })
    }

    if (!payload || typeof payload !== "object") {
        logger.warn("POST /api/data/:type - Invalid payload")
        return res.status(400).json({ error: "Invalid payload" })
    }

    try {
        logger.debug(`Storing data for type: ${type}`)
        const storage = await getStorage()
        await storage.setData(secret, type, payload)
        res.json({ success: true })
    } catch (error) {
        logger.error("Error storing data:", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
})

/**
 * Get a single item by key.
 * Returns 404 if item not found.
 */
app.get("/api/data/:type/:key", async (req, res) => {
    const { type, key } = req.params
    const secret = req.headers["x-secret-hash"]

    if (!secret || !type || !key) {
        logger.warn("GET /api/data/:type/:key - Missing secret, type, or key")
        return res.status(400).json({ error: "Missing secret, type, or key" })
    }

    try {
        logger.debug(`Getting item: type=${type}, key=${key}`)
        const storage = await getStorage()
        const item = await storage.getItem(secret, type, key)

        if (item === undefined) {
            logger.debug(`Item not found: type=${type}, key=${key}`)
            return res.status(404).json({ error: "Item not found" })
        }

        res.json(item)
    } catch (error) {
        logger.error("Error getting item:", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
})

/**
 * Set or update a single item.
 * Creates the item if it doesn't exist.
 */
app.post("/api/data/:type/:key", async (req, res) => {
    const { type, key } = req.params
    const secret = req.headers["x-secret-hash"]
    const value = req.body

    if (!secret || !type || !key) {
        logger.warn("POST /api/data/:type/:key - Missing secret, type, or key")
        return res.status(400).json({ error: "Missing secret, type, or key" })
    }

    if (!value || typeof value !== "object") {
        logger.warn("POST /api/data/:type/:key - Invalid value")
        return res.status(400).json({ error: "Invalid value" })
    }

    try {
        logger.debug(`Setting item: type=${type}, key=${key}`)
        const storage = await getStorage()
        await storage.setItem(secret, type, key, value)
        res.json({ success: true })
    } catch (error) {
        logger.error("Error setting item:", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
})

/**
 * Delete a single item by key.
 * Silently succeeds if item doesn't exist.
 */
app.delete("/api/data/:type/:key", async (req, res) => {
    const { type, key } = req.params
    const secret = req.headers["x-secret-hash"]

    if (!secret || !type || !key) {
        logger.warn("DELETE /api/data/:type/:key - Missing secret, type, or key")
        return res.status(400).json({ error: "Missing secret, type, or key" })
    }

    try {
        logger.debug(`Deleting item: type=${type}, key=${key}`)
        const storage = await getStorage()
        await storage.deleteItem(secret, type, key)
        res.json({ success: true })
    } catch (error) {
        logger.error("Error deleting item:", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
})

/**
 * Initialize and start the server.
 * Sets up graceful shutdown handlers for SIGTERM and SIGINT.
 */
async function start() {
    try {
        // Initialize storage
        await getStorage()

        const server = app.listen(PORT, () => {
            logger.info(`Backend server running on port ${PORT}`)
            logger.info(`Environment: ${process.env.NODE_ENV || "development"}`)
            logger.info(`Log level: ${logger.getLevel()}`)

            if (process.env.USE_MONGO === "true") {
                logger.info(`Using MongoDB storage`)
            } else {
                logger.info(`Using file storage: ${process.env.DATA_FILE || "data.json"}`)
            }
        })

        // Graceful shutdown handler
        const shutdown = async (signal) => {
            logger.info(`${signal} received: closing HTTP server`)
            server.close(async () => {
                await closeStorage()
                logger.info("HTTP server closed")
                process.exit(0)
            })
        }

        process.on("SIGTERM", () => shutdown("SIGTERM"))
        process.on("SIGINT", () => shutdown("SIGINT"))
    } catch (error) {
        logger.error("Failed to start server:", error.message)
        process.exit(1)
    }
}

start()
