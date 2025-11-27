/**
 * Abstract base class for storage implementations.
 * Defines the interface that all storage backends must implement.
 */

export class StorageInterface {
    constructor() {
        if (this.constructor === StorageInterface) {
            throw new Error("StorageInterface is an abstract class and cannot be instantiated directly")
        }
    }

    /**
     * Initialize storage (connect to DB, ensure file exists, etc.).
     */
    async initialize() {
        throw new Error("initialize() must be implemented by subclass")
    }

    /**
     * Get all data for a specific type.
     * @param {string} secret - The secret hash for data isolation
     * @param {string} type - The data type
     * @returns {Promise<Object>} The data object
     */
    async getData(secret, type) {
        throw new Error("getData() must be implemented by subclass")
    }

    /**
     * Set all data for a specific type.
     * @param {string} secret - The secret hash for data isolation
     * @param {string} type - The data type
     * @param {Object} data - The data to store
     */
    async setData(secret, type, data) {
        throw new Error("setData() must be implemented by subclass")
    }

    /**
     * Get a single item by key.
     * @param {string} secret - The secret hash
     * @param {string} type - The data type
     * @param {string} key - The item key
     * @returns {Promise<any>} The item value or undefined
     */
    async getItem(secret, type, key) {
        throw new Error("getItem() must be implemented by subclass")
    }

    /**
     * Set or update a single item.
     * @param {string} secret - The secret hash
     * @param {string} type - The data type
     * @param {string} key - The item key
     * @param {any} value - The item value
     */
    async setItem(secret, type, key, value) {
        throw new Error("setItem() must be implemented by subclass")
    }

    /**
     * Delete a single item by key.
     * @param {string} secret - The secret hash
     * @param {string} type - The data type
     * @param {string} key - The item key
     */
    async deleteItem(secret, type, key) {
        throw new Error("deleteItem() must be implemented by subclass")
    }

    /**
     * Close and cleanup storage connection.
     */
    async close() {
        // Default implementation does nothing
    }
}
