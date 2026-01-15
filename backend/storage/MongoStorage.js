/**
 * MongoDB storage implementation.
 * Stores data in a MongoDB database with indexes for efficient queries.
 */

import { MongoClient } from "mongodb"
import { StorageInterface } from "./StorageInterface.js"
import logger from "../logger.js"

const COLLECTIONS = [
    "keys_plain", "keys_enc",
    "users_plain", "users_enc",
    "history_plain", "history_enc"
]

export class MongoStorage extends StorageInterface {
    /**
     * Create a new MongoStorage instance.
     * @param {string} mongoUrl - MongoDB connection URL (database name parsed from path, defaults to passkeys-tools)
     */
    constructor(mongoUrl) {
        super()
        this.mongoUrl = mongoUrl
        this.dbName = this.parseDbName(mongoUrl)
        this.client = null
        this.db = null
    }

    /**
     * Parse database name from MongoDB URL.
     * @param {string} url - MongoDB connection URL
     * @returns {string} Database name or default
     */
    parseDbName(url) {
        try {
            const parsed = new URL(url)
            const dbName = parsed.pathname.slice(1).split("?")[0]
            return dbName || "passkeys-tools"
        } catch {
            return "passkeys-tools"
        }
    }

    /**
     * Initialize MongoDB connection and create indexes.
     */
    async initialize() {
        try {
            this.client = new MongoClient(this.mongoUrl)
            await this.client.connect()
            logger.info("Connected to MongoDB")

            const db = this.getDatabase()

            // Create indexes for all collections
            for (const collectionName of COLLECTIONS) {
                const collection = db.collection(collectionName)

                // Compound index for efficient single-item lookups
                await collection.createIndex(
                    { secret: 1, key: 1 },
                    { unique: true, background: true }
                )

                // Index for fetching all data for a user
                await collection.createIndex(
                    { secret: 1 },
                    { background: true }
                )

                logger.debug(`Created indexes for collection: ${collectionName}`)
            }

            logger.info("MongoDB indexes created successfully")
        } catch (error) {
            logger.error("Error connecting to MongoDB:", error.message)
            throw error
        }
    }

    /**
     * Close the MongoDB connection.
     */
    async close() {
        if (this.client) {
            await this.client.close()
            logger.info("Disconnected from MongoDB")
        }
    }

    /**
     * Get the database instance.
     * @returns {Db} The MongoDB database
     * @throws {Error} If client is not initialized
     */
    getDatabase() {
        if (!this.client) {
            throw new Error("MongoDB client not initialized")
        }
        return this.client.db(this.dbName)
    }

    /**
     * Get all data for a specific type and secret.
     * @param {string} secret - The secret hash for data isolation
     * @param {string} type - The collection name
     * @returns {Promise<Object>} The data as a key-value object
     */
    async getData(secret, type) {
        const db = this.getDatabase()
        const collection = db.collection(type)

        const docs = await collection.find({ secret }).toArray()

        // Convert array to object format
        const result = {}
        for (const doc of docs) {
            result[doc.key] = doc.value
        }

        return result
    }

    /**
     * Set all data for a specific type and secret.
     * Replaces all existing data for this secret/type combination.
     * @param {string} secret - The secret hash
     * @param {string} type - The collection name
     * @param {Object} data - The data to store
     */
    async setData(secret, type, data) {
        const db = this.getDatabase()
        const collection = db.collection(type)

        // Clear existing data for this secret
        await collection.deleteMany({ secret })

        // Convert object to array of documents
        const docs = Object.entries(data).map(([key, value]) => ({
            secret,
            key,
            value
        }))

        // Insert new data if any
        if (docs.length > 0) {
            await collection.insertMany(docs)
            logger.debug(`Inserted ${docs.length} documents into ${type}`)
        }
    }

    /**
     * Get a single item by key.
     * @param {string} secret - The secret hash
     * @param {string} type - The collection name
     * @param {string} key - The item key
     * @returns {Promise<any>} The item value or undefined
     */
    async getItem(secret, type, key) {
        const db = this.getDatabase()
        const collection = db.collection(type)

        const doc = await collection.findOne({ secret, key })
        return doc?.value
    }

    /**
     * Set a single item (upsert).
     * @param {string} secret - The secret hash
     * @param {string} type - The collection name
     * @param {string} key - The item key
     * @param {any} value - The item value
     */
    async setItem(secret, type, key, value) {
        const db = this.getDatabase()
        const collection = db.collection(type)

        await collection.replaceOne(
            { secret, key },
            { secret, key, value },
            { upsert: true }
        )
    }

    /**
     * Delete a single item by key.
     * @param {string} secret - The secret hash
     * @param {string} type - The collection name
     * @param {string} key - The item key
     */
    async deleteItem(secret, type, key) {
        const db = this.getDatabase()
        const collection = db.collection(type)

        await collection.deleteOne({ secret, key })
    }
}
