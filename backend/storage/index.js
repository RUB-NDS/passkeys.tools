/**
 * Storage factory module.
 * Provides a unified interface for different storage backends.
 */

import { FileStorage } from "./FileStorage.js"
import { MongoStorage } from "./MongoStorage.js"
import logger from "../logger.js"

let storageInstance = null

/**
 * Create and initialize the appropriate storage backend.
 * Uses MongoDB if USE_MONGO=true, otherwise uses file storage.
 * @returns {Promise<StorageInterface>} The initialized storage instance
 */
export async function createStorage() {
    const useMongo = process.env.USE_MONGO === "true"
    const mongoUrl = process.env.MONGO_URL

    if (useMongo) {
        if (!mongoUrl) {
            throw new Error("MONGO_URL is required when USE_MONGO=true")
        }
        logger.info("Initializing MongoDB storage")
        storageInstance = new MongoStorage(mongoUrl)
    } else {
        const dataFile = process.env.DATA_FILE || "data.json"
        logger.info(`Initializing file storage: ${dataFile}`)
        storageInstance = new FileStorage(dataFile)
    }

    await storageInstance.initialize()
    return storageInstance
}

/**
 * Get the current storage instance, creating it if necessary.
 * @returns {Promise<StorageInterface>} The storage instance
 */
export async function getStorage() {
    if (!storageInstance) {
        storageInstance = await createStorage()
    }
    return storageInstance
}

/**
 * Close the storage connection and reset the instance.
 */
export async function closeStorage() {
    if (storageInstance) {
        await storageInstance.close()
        storageInstance = null
        logger.info("Storage connection closed")
    }
}
