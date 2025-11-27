/**
 * Central logging utility for the frontend.
 * Outputs styled console messages with source file information.
 * Use browser console filtering to control verbosity.
 */

/**
 * Get the caller's file name from the stack trace.
 * @returns {string} The file name where the log was called
 */
const getCallerFile = () => {
    try {
        const err = new Error()
        const stack = err.stack?.split("\n") || []
        // Find the first stack frame that's not from this file
        for (let i = 2; i < stack.length; i++) {
            const line = stack[i]
            if (!line.includes("logger.js")) {
                // Extract filename from stack trace
                // Format varies by browser but typically: "at function (file:line:col)" or "function@file:line:col"
                const match = line.match(/(?:at\s+)?(?:.*?\s+\()?(?:.*?\/)?([^/\s]+\.js)(?::\d+)?(?::\d+)?(?:\))?/) ||
                              line.match(/([^/\s]+\.js)/)
                if (match) {
                    return match[1]
                }
            }
        }
    } catch {
        // Ignore errors in stack parsing
    }
    return "unknown"
}

/**
 * Format arguments for styled console output.
 * @param {string} levelName - The log level name
 * @param {string} file - The source file name
 * @returns {Array} Console format arguments [format, ...styles]
 */
const getFormatArgs = (levelName, file) => {
    const colors = {
        ERROR: "#dc3545",
        WARN: "#ffc107",
        INFO: "#0d6efd",
        DEBUG: "#6c757d"
    }
    const color = colors[levelName] || "#000"
    return [
        `%c[${levelName}]%c [${file}]`,
        `color: ${color}; font-weight: bold`,
        "color: #666"
    ]
}

/**
 * Central logger instance with methods for each log level.
 */
export const logger = {
    /**
     * Log an error message.
     * @param {...any} args - Values to log
     */
    error: (...args) => {
        const formatArgs = getFormatArgs("ERROR", getCallerFile())
        console.error(...formatArgs, ...args)
    },

    /**
     * Log a warning message.
     * @param {...any} args - Values to log
     */
    warn: (...args) => {
        const formatArgs = getFormatArgs("WARN", getCallerFile())
        console.warn(...formatArgs, ...args)
    },

    /**
     * Log an informational message.
     * @param {...any} args - Values to log
     */
    info: (...args) => {
        const formatArgs = getFormatArgs("INFO", getCallerFile())
        console.info(...formatArgs, ...args)
    },

    /**
     * Log a debug message.
     * @param {...any} args - Values to log
     */
    debug: (...args) => {
        const formatArgs = getFormatArgs("DEBUG", getCallerFile())
        console.debug(...formatArgs, ...args)
    }
}

export default logger
