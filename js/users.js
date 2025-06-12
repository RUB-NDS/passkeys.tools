export const storeUser = (userId, user) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}")
    users[userId] = { ...users[userId], ...user }
    localStorage.setItem("users", JSON.stringify(users))
}

export const deleteUser = (userId) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}")
    delete users[userId]
    localStorage.setItem("users", JSON.stringify(users))
}

export const getUser = (userId) => {
    return getUsers()[userId]
}

export const getUsers = () => {
    const users = JSON.parse(localStorage.getItem("users") || "{}")
    return users
}
