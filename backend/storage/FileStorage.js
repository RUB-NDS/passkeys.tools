/**
 * File-based storage implementation.
 * Stores data in a JSON file on the local filesystem.
 */

import fs from "fs/promises"
import { StorageInterface } from "./StorageInterface.js"
import logger from "../logger.js"

export class FileStorage extends StorageInterface {
    /**
     * Create a new FileStorage instance.
     * @param {string} dataFile - Path to the JSON data file
     */
    constructor(dataFile) {
        super()
        this.dataFile = dataFile
    }

    /**
     * Initialize the storage by ensuring the data file exists.
     */
    async initialize() {
        try {
            await fs.access(this.dataFile)
            logger.debug(`Data file exists: ${this.dataFile}`)
        } catch {
            logger.info(`Creating new data file: ${this.dataFile}`)
            await fs.writeFile(this.dataFile, JSON.stringify({}), "utf8")
        }
    }

    /**
     * Read all data from the file.
     * @returns {Promise<Object>} The parsed data object
     */
    async readData() {
        try {
            const data = await fs.readFile(this.dataFile, "utf8")
            return JSON.parse(data)
        } catch (error) {
            logger.error("Error reading data file:", error.message)
            return {}
        }
    }

    /**
     * Write data to the file.
     * @param {Object} data - The data to write
     */
    async writeData(data) {
        try {
            await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2), "utf8")
            logger.debug("Data written to file successfully")
        } catch (error) {
            logger.error("Error writing data file:", error.message)
            throw error
        }
    }

    /**
     * Get all data for a specific type and secret.
     * @param {string} secret - The secret hash for data isolation
     * @param {string} type - The data type (e.g., "keys", "users")
     * @returns {Promise<Object>} The data object or empty object if not found
     */
    async getData(secret, type) {
        const data = await this.readData()
        const userData = data[secret]

        if (!userData || !userData[type]) {
            return {}
        }

        return userData[type]
    }

    /**
     * Set all data for a specific type and secret.
     * @param {string} secret - The secret hash for data isolation
     * @param {string} type - The data type
     * @param {Object} newData - The data to store
     */
    async setData(secret, type, newData) {
        const data = await this.readData()

        // Initialize user data if it doesn't exist
        if (!data[secret]) {
            data[secret] = {}
        }

        data[secret][type] = newData
        await this.writeData(data)
    }

    /**
     * Get a single item by key.
     * @param {string} secret - The secret hash
     * @param {string} type - The data type
     * @param {string} key - The item key
     * @returns {Promise<any>} The item value or undefined
     */
    async getItem(secret, type, key) {
        const typeData = await this.getData(secret, type)
        return typeData[key]
    }

    /**
     * Set a single item.
     * @param {string} secret - The secret hash
     * @param {string} type - The data type
     * @param {string} key - The item key
     * @param {any} value - The item value
     */
    async setItem(secret, type, key, value) {
        const data = await this.readData()

        // Initialize structures if they don't exist
        if (!data[secret]) {
            data[secret] = {}
        }
        if (!data[secret][type]) {
            data[secret][type] = {}
        }

        data[secret][type][key] = value
        await this.writeData(data)
    }

    /**
     * Delete a single item by key.
     * @param {string} secret - The secret hash
     * @param {string} type - The data type
     * @param {string} key - The item key
     */
    async deleteItem(secret, type, key) {
        const data = await this.readData()

        if (data[secret]?.[type]?.[key] !== undefined) {
            delete data[secret][type][key]
            await this.writeData(data)
        }
    }
}
