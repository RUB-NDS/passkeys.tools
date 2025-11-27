/**
 * AAGUID (Authenticator Attestation GUID) lookup module.
 * Maps authenticator AAGUIDs to human-readable names.
 * Data source: https://github.com/passkeydeveloper/passkey-authenticator-aaguids
 */

import aaguids from "./combined_aaguid.json"

export const getAaguids = () => {
    const ids = {"n/a": "00000000000000000000000000000000"}
    for (const [k, v] of Object.entries(aaguids)) {
        ids[v.name] = k.replaceAll("-", "")
    }
    return ids
}
