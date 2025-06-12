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

export const getUser = async (userId) => {
    const users = await getUsers()
    return users[userId]
}

export const getUsers = async () => {
    const users = await storage.get("users")
    return users
}