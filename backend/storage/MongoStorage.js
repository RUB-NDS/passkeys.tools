import { MongoClient } from "mongodb"
import { StorageInterface } from "./StorageInterface.js"

export class MongoStorage extends StorageInterface {
    constructor(mongoUrl) {
        super()
        this.mongoUrl = mongoUrl
        this.client = null
        this.db = null
    }

    async initialize() {
        try {
            this.client = new MongoClient(this.mongoUrl)
            await this.client.connect()
            console.log("Connected to MongoDB")

            // Create indexes for all collections
            const db = this.getDatabase()
            const collections = ["keys_plain", "keys_enc", "users_plain", "users_enc", "history_plain", "history_enc"]

            for (const collectionName of collections) {
                const collection = db.collection(collectionName)

                // Create compound index on secret and key for fast lookups
                await collection.createIndex(
                    { secret: 1, key: 1 },
                    { unique: true, background: true }
                )

                // Create index on secret alone for queries that fetch all data for a user
                await collection.createIndex(
                    { secret: 1 },
                    { background: true }
                )
            }

            console.log("MongoDB indexes created successfully")
        } catch (error) {
            console.error("Error connecting to MongoDB:", error)
            throw error
        }
    }

    async close() {
        if (this.client) {
            await this.client.close()
            console.log("Disconnected from MongoDB")
        }
    }

    getDatabase() {
        if (!this.client) {
            throw new Error("MongoDB client not initialized")
        }
        return this.client.db("passkeys-tools")
    }

    getCollectionName(type) {
        // Collection name is just the type (e.g., "keys_plain", "users_enc")
        return type
    }

    async getData(secret, type) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(type)
        const collection = db.collection(collectionName)

        // Get all documents for this secret
        const docs = await collection.find({ secret }).toArray()

        // Convert array of documents to object format
        const result = {}
        docs.forEach(doc => {
            result[doc.key] = doc.value
        })

        return result
    }

    async setData(secret, type, data) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(type)
        const collection = db.collection(collectionName)

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
        }
    }

    async getItem(secret, type, key) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(type)
        const collection = db.collection(collectionName)

        const doc = await collection.findOne({ secret, key })
        if (!doc) {
            return undefined
        }

        return doc.value
    }

    async setItem(secret, type, key, value) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(type)
        const collection = db.collection(collectionName)

        // Upsert the document
        await collection.replaceOne(
            { secret, key },
            { secret, key, value },
            { upsert: true }
        )
    }

    async deleteItem(secret, type, key) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(type)
        const collection = db.collection(collectionName)

        await collection.deleteOne({ secret, key })
    }
}
