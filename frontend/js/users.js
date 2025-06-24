import { storage } from "./storage.js"

export const storeUser = async (userId, user) => {
    const users = await storage.get("users")
    users[userId] = { ...users[userId], ...user }
    await storage.set("users", users)
}

export const deleteUser = async (userId) => {
    const users = await storage.get("users")
    delete users[userId]
    await storage.set("users", users)
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
