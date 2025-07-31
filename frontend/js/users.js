import { storage } from "./storage.js"

export const storeUser = async (userId, user) => {
    await storage.setItem("users", userId, user)
}

export const deleteUser = async (userId) => {
    await storage.deleteItem("users", userId)
}

export const getUsers = async () => {
    const users = await storage.get("users")
    return users
}

export const getUserByRpIdAndMode = async (rpId, mode) => {
    const users = await getUsers()
    for (const [id, user] of Object.entries(users)) {
        if (user.rpId === rpId && user.mode === mode) {
            return user
        }
    }
    return undefined
}
