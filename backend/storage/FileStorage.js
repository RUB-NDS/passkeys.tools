import fs from "fs/promises"
import { StorageInterface } from "./StorageInterface.js"

export class FileStorage extends StorageInterface {
    constructor(dataFile) {
        super()
        this.dataFile = dataFile
    }

    async initialize() {
        try {
            await fs.access(this.dataFile)
        } catch {
            await fs.writeFile(this.dataFile, JSON.stringify({}), "utf8")
        }
    }

    async readData() {
        try {
            const data = await fs.readFile(this.dataFile, "utf8")
            return JSON.parse(data)
        } catch (error) {
            console.error("Error reading data:", error)
            return {}
        }
    }

    async writeData(data) {
        try {
            await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2), "utf8")
        } catch (error) {
            console.error("Error writing data:", error)
            throw error
        }
    }


    async getData(secretKey, type) {
        const data = await this.readData()
        const userData = data[secretKey]

        if (!userData || !userData[type]) {
            return {}
        }

        return userData[type]
    }

    async setData(secretKey, type, newData) {
        const data = await this.readData()

        // Initialize user data if it doesn't exist
        if (!data[secretKey]) {
            data[secretKey] = {}
        }

        // Update the specific type data
        data[secretKey][type] = newData

        await this.writeData(data)
    }

    async getItem(secretKey, type, key) {
        const typeData = await this.getData(secretKey, type)
        return typeData[key]
    }

    async setItem(secretKey, type, key, value) {
        const data = await this.readData()

        // Initialize structures if they don't exist
        if (!data[secretKey]) {
            data[secretKey] = {}
        }
        if (!data[secretKey][type]) {
            data[secretKey][type] = {}
        }

        // Set the specific item
        data[secretKey][type][key] = value

        await this.writeData(data)
    }

    async deleteItem(secretKey, type, key) {
        const data = await this.readData()

        if (data[secretKey] && data[secretKey][type] && data[secretKey][type][key]) {
            delete data[secretKey][type][key]
            await this.writeData(data)
        }
    }
}
