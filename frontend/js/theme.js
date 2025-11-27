/**
 * Theme management module.
 * Handles light/dark theme switching with system preference support.
 */

import { getThemeConfig } from "./storage.js"

export const applyTheme = (theme) => {
    const htmlElement = document.documentElement

    if (theme === "dark") {
        htmlElement.setAttribute("data-bs-theme", "dark")
    } else if (theme === "light") {
        htmlElement.removeAttribute("data-bs-theme")
    } else if (theme === "auto") {
        // Check OS preference
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            htmlElement.setAttribute("data-bs-theme", "dark")
        } else {
            htmlElement.removeAttribute("data-bs-theme")
        }
    }
}

// Initialize theme immediately
const initialTheme = getThemeConfig()
applyTheme(initialTheme)

// Listen for theme changes via custom event
window.addEventListener("themechange", (e) => {
    applyTheme(e.detail.theme)
})

// Listen for OS preference changes when in auto mode
if (window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", () => {
        const currentTheme = getThemeConfig()
        if (currentTheme === "auto") {
            applyTheme("auto")
        }
    })
}
