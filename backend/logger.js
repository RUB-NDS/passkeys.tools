/**
 * Central logging utility for the backend server.
 *
 * Log levels (in order of verbosity):
 * - ERROR (0): Critical errors that require immediate attention
 * - WARN  (1): Warning conditions that should be reviewed
 * - INFO  (2): Informational messages about normal operation
 * - DEBUG (3): Detailed debugging information
 *
 * Configure via LOG_LEVEL environment variable (default: INFO)
 */

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
}

const LOG_LEVEL_NAMES = Object.fromEntries(
    Object.entries(LOG_LEVELS).map(([k, v]) => [v, k])
)

/**
 * Get the current log level from environment variable.
 * @returns {number} The numeric log level
 */
const getLogLevel = () => {
    const level = (process.env.LOG_LEVEL || "INFO").toUpperCase()
    return LOG_LEVELS[level] ?? LOG_LEVELS.INFO
}

/**
 * Get the caller's file name from the stack trace.
 * @returns {string} The file name where the log was called
 */
const getCallerFile = () => {
    const originalPrepareStackTrace = Error.prepareStackTrace
    Error.prepareStackTrace = (_, stack) => stack

    const err = new Error()
    const stack = err.stack

    Error.prepareStackTrace = originalPrepareStackTrace

    // stack[0] is this function, stack[1] is the log function, stack[2] is the caller
    if (stack && stack.length > 2) {
        const callerFile = stack[2].getFileName()
        if (callerFile) {
            // Extract just the filename from the full path
            const parts = callerFile.split("/")
            return parts[parts.length - 1]
        }
    }
    return "unknown"
}

/**
 * Format a log message with timestamp, level, and file name.
 * @param {string} level - The log level name
 * @param {string} file - The source file name
 * @param {string} message - The log message
 * @returns {string} The formatted log string
 */
const formatMessage = (level, file, message) => {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level}] [${file}] ${message}`
}

/**
 * Create a logger instance with methods for each log level.
 */
const createLogger = () => {
    const log = (level, levelName, ...args) => {
        if (level > getLogLevel()) return

        const file = getCallerFile()
        const message = args
            .map(arg => typeof arg === "object" ? JSON.stringify(arg) : String(arg))
            .join(" ")
        const formattedMessage = formatMessage(levelName, file, message)

        switch (level) {
            case LOG_LEVELS.ERROR:
                console.error(formattedMessage)
                break
            case LOG_LEVELS.WARN:
                console.warn(formattedMessage)
                break
            default:
                console.log(formattedMessage)
        }
    }

    return {
        /**
         * Log an error message (always shown unless logging is completely disabled).
         * @param {...any} args - Values to log
         */
        error: (...args) => log(LOG_LEVELS.ERROR, "ERROR", ...args),

        /**
         * Log a warning message.
         * @param {...any} args - Values to log
         */
        warn: (...args) => log(LOG_LEVELS.WARN, "WARN", ...args),

        /**
         * Log an informational message.
         * @param {...any} args - Values to log
         */
        info: (...args) => log(LOG_LEVELS.INFO, "INFO", ...args),

        /**
         * Log a debug message (most verbose).
         * @param {...any} args - Values to log
         */
        debug: (...args) => log(LOG_LEVELS.DEBUG, "DEBUG", ...args),

        /**
         * Get the current log level name.
         * @returns {string} The current log level name
         */
        getLevel: () => LOG_LEVEL_NAMES[getLogLevel()],

        /**
         * Available log levels for reference.
         */
        levels: LOG_LEVELS
    }
}

export const logger = createLogger()
export default logger
