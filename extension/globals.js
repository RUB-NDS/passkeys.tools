/**
 * Global state and logging utilities for the Passkeys.Tools extension.
 * Outputs styled console messages for debugging.
 * Use browser console filtering to control verbosity.
 */

/**
 * Logging utilities with styled console output.
 */
_pk.log = {
    /**
     * Log a debug message (most verbose).
     */
    debug: (msg, ...args) => {
        console.debug(`%c[Passkeys.Tools]%c [DEBUG] ${msg}`, "color: #6c757d; font-weight: bold", "color: #6c757d", ...args)
    },

    /**
     * Log an informational message.
     */
    info: (msg, ...args) => {
        console.info(`%c[Passkeys.Tools]%c [INFO] ${msg}`, "color: #0d6efd; font-weight: bold", "color: inherit", ...args)
    },

    /**
     * Log a general message (alias for info).
     */
    log: (msg, ...args) => {
        console.log(`%c[Passkeys.Tools]%c [LOG] ${msg}`, "color: #0d6efd; font-weight: bold", "color: inherit", ...args)
    },

    /**
     * Log a warning message.
     */
    warn: (msg, ...args) => {
        console.warn(`%c[Passkeys.Tools]%c [WARN] ${msg}`, "color: #ffc107; font-weight: bold", "color: inherit", ...args)
    },

    /**
     * Log an error message.
     */
    error: (msg, ...args) => {
        console.error(`%c[Passkeys.Tools]%c [ERROR] ${msg}`, "color: #dc3545; font-weight: bold", "color: inherit", ...args)
    }
}
