import express from "express"
import cors from "cors"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const DATA_FILE = process.env.DATA_FILE || "data.json"

// Middleware
app.use(cors())
app.use(express.json({ limit: "1mb" })) // 1MB limit
app.use(express.urlencoded({ extended: true, limit: "1mb" }))

// Ensure data file exists
async function ensureDataFile() {
    try {
        await fs.access(DATA_FILE)
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify({}), "utf8")
    }
}

// Read data from file
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf8")
        return JSON.parse(data)
    } catch (error) {
        console.error("Error reading data:", error)
        return {}
    }
}

// Write data to file
async function writeData(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8")
    } catch (error) {
        console.error("Error writing data:", error)
        throw error
    }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Get data for a specific secret key and type
app.get("/api/data/:secretKey/:type", async (req, res) => {
    const { secretKey, type } = req.params

    if (!secretKey || !type) {
        return res.status(400).json({ error: "Missing secretKey or type" })
    }


    try {
        const data = await readData()
        const userData = data[secretKey]

        if (!userData || !userData[type]) {
            return res.json({})
        }

        res.json(userData[type])
    } catch (error) {
        console.error("Error getting data:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Store data for a specific secret key and type
app.post("/api/data/:secretKey/:type", async (req, res) => {
    const { secretKey, type } = req.params
    const payload = req.body

    if (!secretKey || !type) {
        return res.status(400).json({ error: "Missing secretKey or type" })
    }


    if (!payload || typeof payload !== "object") {
        return res.status(400).json({ error: "Invalid payload" })
    }

    try {
        const data = await readData()

        // Initialize user data if it doesn't exist
        if (!data[secretKey]) {
            data[secretKey] = {}
        }

        // Update the specific type data
        data[secretKey][type] = payload

        await writeData(data)
        res.json({ success: true })
    } catch (error) {
        console.error("Error storing data:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Start server
async function start() {
    await ensureDataFile()
    app.listen(PORT, () => {
        console.log(`Backend server running on port ${PORT}`)
        console.log(`Data file: ${DATA_FILE}`)
    })
}

start()
