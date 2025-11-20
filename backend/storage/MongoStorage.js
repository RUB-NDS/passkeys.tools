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
        return this.client.db("data")
    }

    getCollectionName(secretKey, type) {
        return `${secretKey}_${type}`
    }

    async getData(secretKey, type) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(secretKey, type)
        const collection = db.collection(collectionName)

        // Get all documents
        const docs = await collection.find({}).toArray()

        // Convert array of documents to object format
        const result = {}
        docs.forEach(doc => {
            const { _id, ...value } = doc
            result[_id] = value
        })

        return result
    }

    async setData(secretKey, type, data) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(secretKey, type)
        const collection = db.collection(collectionName)

        // Clear existing data
        await collection.deleteMany({})

        // Convert object to array of documents
        const docs = Object.entries(data).map(([key, value]) => ({
            _id: key,
            ...value
        }))

        // Insert new data if any
        if (docs.length > 0) {
            await collection.insertMany(docs)
        }
    }

    async getItem(secretKey, type, key) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(secretKey, type)
        const collection = db.collection(collectionName)

        const doc = await collection.findOne({ _id: key })
        if (!doc) {
            return undefined
        }

        const { _id, ...value } = doc
        return value
    }

    async setItem(secretKey, type, key, value) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(secretKey, type)
        const collection = db.collection(collectionName)

        // Upsert the document
        await collection.replaceOne(
            { _id: key },
            { _id: key, ...value },
            { upsert: true }
        )
    }

    async deleteItem(secretKey, type, key) {
        const db = this.getDatabase()
        const collectionName = this.getCollectionName(secretKey, type)
        const collection = db.collection(collectionName)

        await collection.deleteOne({ _id: key })
    }
}
