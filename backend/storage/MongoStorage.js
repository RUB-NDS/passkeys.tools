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

    async getData(secretKey, type) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(type)
        const collection = db.collection(collectionName)

        // Get all documents for this secretKey
        const docs = await collection.find({ secretKey }).toArray()

        // Convert array of documents to object format
        const result = {}
        docs.forEach(doc => {
            result[doc.key] = doc.value
        })

        return result
    }

    async setData(secretKey, type, data) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(type)
        const collection = db.collection(collectionName)

        // Clear existing data for this secretKey
        await collection.deleteMany({ secretKey })

        // Convert object to array of documents
        const docs = Object.entries(data).map(([key, value]) => ({
            secretKey,
            key,
            value
        }))

        // Insert new data if any
        if (docs.length > 0) {
            await collection.insertMany(docs)
        }
    }

    async getItem(secretKey, type, key) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(type)
        const collection = db.collection(collectionName)

        const doc = await collection.findOne({ secretKey, key })
        if (!doc) {
            return undefined
        }

        return doc.value
    }

    async setItem(secretKey, type, key, value) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(type)
        const collection = db.collection(collectionName)

        // Upsert the document
        await collection.replaceOne(
            { secretKey, key },
            { secretKey, key, value },
            { upsert: true }
        )
    }

    async deleteItem(secretKey, type, key) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(type)
        const collection = db.collection(collectionName)

        await collection.deleteOne({ secretKey, key })
    }
}
