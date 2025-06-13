/* Logging utilities with styled console output */
_pk.log = {
    debug: (msg, ...args) => { console.debug(`%c[Interceptor]%c ${msg}`, "color: black; font-weight: bold", "", ...args) },
    info: (msg, ...args) => { console.info(`%c[Interceptor]%c ${msg}`, "color: green; font-weight: bold", "", ...args) },
    log: (msg, ...args) => { console.log(`%c[Interceptor]%c ${msg}`, "color: blue; font-weight: bold", "", ...args) },
    warn: (msg, ...args) => { console.warn(`%c[Interceptor]%c ${msg}`, "color: orange; font-weight: bold", "", ...args) },
    error: (msg, ...args) => { console.error(`%c[Interceptor]%c ${msg}`, "color: red; font-weight: bold", "", ...args) }
}
