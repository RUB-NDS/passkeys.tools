/* Abstract base class for storage implementations */
export class StorageInterface {
    constructor() {
        if (this.constructor === StorageInterface) {
            throw new Error("StorageInterface is an abstract class and cannot be instantiated directly")
        }
    }

    /* Initialize storage (connect to DB, ensure file exists, etc.) */
    async initialize() {
        throw new Error("initialize() must be implemented by subclass")
    }

    /* Get all data for a specific type */
    async getData(secretKey, type) {
        throw new Error("getData() must be implemented by subclass")
    }

    /* Set all data for a specific type */
    async setData(secretKey, type, data) {
        throw new Error("setData() must be implemented by subclass")
    }

    /* Get a single item by key */
    async getItem(secretKey, type, key) {
        throw new Error("getItem() must be implemented by subclass")
    }

    /* Set/update a single item */
    async setItem(secretKey, type, key, value) {
        throw new Error("setItem() must be implemented by subclass")
    }

    /* Delete a single item by key */
    async deleteItem(secretKey, type, key) {
        throw new Error("deleteItem() must be implemented by subclass")
    }

    /* Close/cleanup storage connection */
    async close() {
        // Default implementation does nothing
    }
}
