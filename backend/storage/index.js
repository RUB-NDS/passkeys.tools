import { FileStorage } from "./FileStorage.js"
import { MongoStorage } from "./MongoStorage.js"

let storageInstance = null

export async function createStorage() {
    // Check if we should use MongoDB
    const isProduction = process.env.NODE_ENV === "production"
    const mongoUrl = process.env.MONGO_URL

    if (isProduction && mongoUrl) {
        console.log("Using MongoDB storage")
        storageInstance = new MongoStorage(mongoUrl)
    } else {
        console.log("Using file storage")
        const dataFile = process.env.DATA_FILE || "data.json"
        storageInstance = new FileStorage(dataFile)
    }

    await storageInstance.initialize()
    return storageInstance
}

export async function getStorage() {
    if (!storageInstance) {
        storageInstance = await createStorage()
    }
    return storageInstance
}

export async function closeStorage() {
    if (storageInstance) {
        await storageInstance.close()
        storageInstance = null
    }
}
