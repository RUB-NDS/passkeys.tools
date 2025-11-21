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


    async getData(secret, type) {
        const data = await this.readData()
        const userData = data[secret]

        if (!userData || !userData[type]) {
            return {}
        }

        return userData[type]
    }

    async setData(secret, type, newData) {
        const data = await this.readData()

        // Initialize user data if it doesn't exist
        if (!data[secret]) {
            data[secret] = {}
        }

        // Update the specific type data
        data[secret][type] = newData

        await this.writeData(data)
    }

    async getItem(secret, type, key) {
        const typeData = await this.getData(secret, type)
        return typeData[key]
    }

    async setItem(secret, type, key, value) {
        const data = await this.readData()

        // Initialize structures if they don't exist
        if (!data[secret]) {
            data[secret] = {}
        }
        if (!data[secret][type]) {
            data[secret][type] = {}
        }

        // Set the specific item
        data[secret][type][key] = value

        await this.writeData(data)
    }

    async deleteItem(secret, type, key) {
        const data = await this.readData()

        if (data[secret] && data[secret][type] && data[secret][type][key]) {
            delete data[secret][type][key]
            await this.writeData(data)
        }
    }
}
