/**
 * Modification presets for WebAuthn request/response manipulation.
 * Provides predefined modifications for security testing scenarios.
 */

import * as editors from "./editors.js"
import { b64urlToUint8, uint8ToB64url } from "./converters.js"
import { getHistory } from "./history.js"
import { createResultAlert } from "./main.js"
import { algs } from "./keys.js"
import { createIcon } from "./helpers.js"

const modifications = {

    create: {

        "Context | Nonsense": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            clientDataJSON.type = "abc.def"
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Context | Swap": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            clientDataJSON.type = "webauthn.get"
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Challenge | Bit Flip": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            const challenge = b64urlToUint8(clientDataJSON.challenge)
            challenge[challenge.length - 1] ^= 0x01 // flip the last bit
            clientDataJSON.challenge = uint8ToB64url(challenge)
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Challenge | Reuse": async (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()

            // Get history and filter for matching entries
            const history = await getHistory()
            const currentTime = Date.now()
            const oneMinuteAgo = currentTime - 60000

            // Filter for valid history items
            const validItems = history.filter(item => {
                return item.timestamp >= oneMinuteAgo &&
                       item.mode === mode &&
                       item.origin === origin &&
                       item.type === "create" &&
                       item.status === "resolved" && // challenge must be used
                       item.request &&
                       item.request.challenge
            })

            if (validItems.length === 0) {
                createResultAlert(interceptorModifications, "No matching history item found (must be within 1 minute, same mode and origin, type=create, status=resolved)", false)
                return
            }

            // Sort by timestamp descending and take the newest
            validItems.sort((a, b) => b.timestamp - a.timestamp)
            const newestItem = validItems[0]

            clientDataJSON.challenge = newestItem.request.challenge
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Challenge | Session Binding": async (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()

            // Check if mode is default - test is invalid in this case
            if (mode === "default") {
                createResultAlert(interceptorModifications, "This test is not valid for default mode", false)
                return
            }

            // Get history and filter for matching entries
            const history = await getHistory()
            const currentTime = Date.now()
            const oneMinuteAgo = currentTime - 60000

            // Swap mode for profile-based testing
            const targetMode = mode === "profile1" ? "profile2" : "profile1"

            // Filter for valid history items with swapped mode and dismissed status
            const validItems = history.filter(item => {
                return item.timestamp >= oneMinuteAgo &&
                       item.mode === targetMode &&
                       item.origin === origin &&
                       item.type === "create" &&
                       item.status === "dismissed" &&
                       item.request &&
                       item.request.challenge
            })

            if (validItems.length === 0) {
                createResultAlert(interceptorModifications, "No matching history item found (must be within 1 minute, swapped mode, same origin, type=create, status=dismissed)", false)
                return
            }

            // Sort by timestamp descending and take the newest
            validItems.sort((a, b) => b.timestamp - a.timestamp)
            const newestItem = validItems[0]

            clientDataJSON.challenge = newestItem.request.challenge
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Origin | Cross Site": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            const url = new URL(clientDataJSON.origin)
            url.hostname = url.hostname.replace(/\.[^.]+$/, ".rocks")
            clientDataJSON.origin = url.origin
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Origin | Downscoping": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            const url = new URL(clientDataJSON.origin)
            url.hostname = "sub." + url.hostname
            clientDataJSON.origin = url.origin
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Origin | Upscoping": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            const url = new URL(clientDataJSON.origin)
            const hostnameParts = url.hostname.split(".")

            // Check if we can upscope (need at least 3 parts: subdomain.domain.tld)
            if (hostnameParts.length < 3) {
                createResultAlert(interceptorModifications, "This test is not applicable - no parent domain available", false)
                return
            }

            // Remove the first subdomain to get parent domain
            hostnameParts.shift()
            url.hostname = hostnameParts.join(".")
            clientDataJSON.origin = url.origin
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Cross Origin": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            clientDataJSON.crossOrigin = true
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Top Origin | Cross Site": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            if (topOrigin) {
                const url = new URL(clientDataJSON.topOrigin)
                url.hostname = url.hostname.replace(/\.[^.]+$/, ".rocks")
                clientDataJSON.topOrigin = url.origin
            } else {
                const url = new URL(origin)
                url.hostname = url.hostname.replace(/\.[^.]+$/, ".rocks")
                clientDataJSON.topOrigin = url.origin
            }
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Top Origin | Downscoping": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()
            if (topOrigin) {
                const url = new URL(clientDataJSON.topOrigin)
                url.hostname = "sub." + url.hostname
                clientDataJSON.topOrigin = url.origin
            } else {
                const url = new URL(origin)
                url.hostname = "sub." + url.hostname
                clientDataJSON.topOrigin = url.origin
            }
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Top Origin | Upscoping": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.attestationClientDataJSONDecEditor.getValue()

            if (topOrigin) {
                const url = new URL(clientDataJSON.topOrigin)
                const hostnameParts = url.hostname.split(".")

                // Check if we can upscope (need at least 3 parts: subdomain.domain.tld)
                if (hostnameParts.length < 3) {
                    createResultAlert(interceptorModifications, "This test is not applicable - no parent domain available", false)
                    return
                }

                // Remove the first subdomain to get parent domain
                hostnameParts.shift()
                url.hostname = hostnameParts.join(".")
                clientDataJSON.topOrigin = url.origin
            } else {
                const url = new URL(origin)
                const hostnameParts = url.hostname.split(".")

                // Check if we can upscope (need at least 3 parts: subdomain.domain.tld)
                if (hostnameParts.length < 3) {
                    createResultAlert(interceptorModifications, "This test is not applicable - no parent domain available", false)
                    return
                }

                // Remove the first subdomain to get parent domain
                hostnameParts.shift()
                url.hostname = hostnameParts.join(".")
                clientDataJSON.topOrigin = url.origin
            }
            editors.attestationClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "RP ID Hash | Cross Site": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Get RP ID from pkcco.rp.id or fallback to origin hostname
            const rpId = pkcco.rp?.id || (new URL(origin)).hostname

            // Change TLD to .rocks for cross site
            const modifiedRpId = rpId.replace(/\.[^.]+$/, ".rocks")

            // Set the modified RP ID in the input field and click the button
            attestationRpIdInput.value = modifiedRpId
            attestationRpIdInput.dispatchEvent(new Event("input"))
            setTimeout(() => attestationRpIdBtn.click(), 200)
        },

        "RP ID Hash | Downscoping": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Get RP ID from pkcco.rp.id or fallback to origin hostname
            const rpId = pkcco.rp?.id || (new URL(origin)).hostname

            // Add subdomain for downscoping
            const modifiedRpId = "sub." + rpId

            // Set the modified RP ID in the input field and click the button
            attestationRpIdInput.value = modifiedRpId
            attestationRpIdInput.dispatchEvent(new Event("input"))
            setTimeout(() => attestationRpIdBtn.click(), 200)
        },

        "RP ID Hash | Upscoping": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Get RP ID from pkcco.rp.id or fallback to origin hostname
            const rpId = pkcco.rp?.id || (new URL(origin)).hostname
            const rpIdParts = rpId.split(".")

            // Check if we can upscope (need at least 3 parts: subdomain.domain.tld)
            if (rpIdParts.length < 3) {
                createResultAlert(interceptorModifications, "This test is not applicable - no parent domain available", false)
                return
            }

            // Remove the first subdomain to get parent domain
            rpIdParts.shift()
            const modifiedRpId = rpIdParts.join(".")

            // Set the modified RP ID in the input field and click the button
            attestationRpIdInput.value = modifiedRpId
            attestationRpIdInput.dispatchEvent(new Event("input"))
            setTimeout(() => attestationRpIdBtn.click(), 200)
        },

        "User Present": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Check if mediation is conditional - test is not applicable in this case
            if (mediation === "conditional") {
                createResultAlert(interceptorModifications, "This test is not applicable for conditional mediation", false)
                return
            }

            // Set user present flag to false
            const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
            attestationObject.authData.flags.up = false
            editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
        },

        "User Verified": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Check if userVerification is required
            if (pkcco.authenticatorSelection?.userVerification === "required") {
                // Set user verified flag to false
                const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
                attestationObject.authData.flags.uv = false
                editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
            } else {
                createResultAlert(interceptorModifications, "This test is not applicable - userVerification is not required", false)
            }
        },

        "Backup State": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Set backup eligible to false and backup state to true
            const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
            attestationObject.authData.flags.be = false
            attestationObject.authData.flags.bs = true
            editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
        },

        "Algorithm": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Get algorithms requested in pubKeyCredParams
            const requestedAlgs = pkcco.pubKeyCredParams?.map(param => {
                return Object.keys(algs).find(key => algs[key] === param.alg)
            }).filter(Boolean) || []

            // Find first algorithm from algs not in pubKeyCredParams
            const availableAlgs = Object.keys(algs)
            const unusedAlg = availableAlgs.find(alg => !requestedAlgs.includes(alg))

            if (!unusedAlg) {
                createResultAlert(interceptorModifications, "This test is not applicable - all algorithms are included in pubKeyCredParams", false)
                return
            }

            // Select the appropriate key based on "{mode} | {alg}" pattern
            const keyName = `${mode} | ${unusedAlg}`

            // Set the key select
            if (createKeySelect) {
                createKeySelect.value = keyName
                createKeySelect.dispatchEvent(new Event("change"))
            }

            // Find and select the credential ID option based on inner text matching the key name
            if (createCredentialIdSelect) {
                const options = createCredentialIdSelect.options
                for (let i = 0; i < options.length; i++) {
                    if (options[i].textContent && options[i].textContent.includes(keyName)) {
                        createCredentialIdSelect.selectedIndex = i
                        createCredentialIdSelect.dispatchEvent(new Event("change"))
                        break
                    }
                }
            }
        },

        "Credential ID Length": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Find and select the option with inner text "1024 byte test"
            if (createCredentialIdSelect) {
                const options = createCredentialIdSelect.options
                for (let i = 0; i < options.length; i++) {
                    if (options[i].textContent && options[i].textContent.includes("1024 byte test")) {
                        createCredentialIdSelect.selectedIndex = i
                        createCredentialIdSelect.dispatchEvent(new Event("change"))
                        break
                    }
                }
            }
        },

        "Backup Eligible | Set to On": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Set backup eligible flag to true
            const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
            attestationObject.authData.flags.be = true
            editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
        },

        "Backup Eligible | Set to Off": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Set backup eligible flag to false
            const attestationObject = editors.attestationAttestationObjectDecEditor.getValue()
            attestationObject.authData.flags.be = false
            editors.attestationAttestationObjectDecEditor.setValue(attestationObject)
        },

        // "Credential ID Unused | ID+Pubkey Swap": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},

        // "Credential ID Unused | ID Swap": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},

        // "Credential ID Unused | Pubkey Swap": (pkcco, origin, mode, crossOrigin, topOrigin, mediation) => {},
    },

    get: {

        // "Allow Credentials": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},

        // "Non-Discoverable Identification": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},

        // "Discoverable Identification": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {},

        "Context | Nonsense": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
            clientDataJSON.type = "abc.def"
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Context | Swap": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
            clientDataJSON.type = "webauthn.create"
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Challenge | Bit Flip": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
            const challenge = b64urlToUint8(clientDataJSON.challenge)
            challenge[challenge.length - 1] ^= 0x01 // flip the last bit
            clientDataJSON.challenge = uint8ToB64url(challenge)
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Challenge | Reuse": async (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()

            // Get history and filter for matching entries
            const history = await getHistory()
            const currentTime = Date.now()
            const oneMinuteAgo = currentTime - 60000

            // Filter for valid history items
            const validItems = history.filter(item => {
                return item.timestamp >= oneMinuteAgo &&
                       item.mode === mode &&
                       item.origin === origin &&
                       item.type === "get" &&
                       item.status === "resolved" &&
                       item.request &&
                       item.request.challenge
            })

            if (validItems.length === 0) {
                createResultAlert(interceptorModifications, "No matching history item found (must be within 1 minute, same mode and origin, type=get, status=resolved)", false)
                return
            }

            // Sort by timestamp descending and take the newest
            validItems.sort((a, b) => b.timestamp - a.timestamp)
            const newestItem = validItems[0]

            clientDataJSON.challenge = newestItem.request.challenge
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Challenge | Session Binding": async (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()

            // Check if mode is default - test is invalid in this case
            if (mode === "default") {
                createResultAlert(interceptorModifications, "This test is not valid for default mode", false)
                return
            }

            // Get history and filter for matching entries
            const history = await getHistory()
            const currentTime = Date.now()
            const oneMinuteAgo = currentTime - 60000

            // Swap mode for profile-based testing
            const targetMode = mode === "profile1" ? "profile2" : "profile1"

            // Filter for valid history items with swapped mode and dismissed status
            const validItems = history.filter(item => {
                return item.timestamp >= oneMinuteAgo &&
                       item.mode === targetMode &&
                       item.origin === origin &&
                       item.type === "get" &&
                       item.status === "dismissed" &&
                       item.request &&
                       item.request.challenge
            })

            if (validItems.length === 0) {
                createResultAlert(interceptorModifications, "No matching history item found (must be within 1 minute, swapped mode, same origin, type=get, status=dismissed)", false)
                return
            }

            // Sort by timestamp descending and take the newest
            validItems.sort((a, b) => b.timestamp - a.timestamp)
            const newestItem = validItems[0]

            clientDataJSON.challenge = newestItem.request.challenge
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Origin | Cross Site": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
            const url = new URL(clientDataJSON.origin)
            url.hostname = url.hostname.replace(/\.[^.]+$/, ".rocks")
            clientDataJSON.origin = url.origin
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Origin | Downscoping": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
            const url = new URL(clientDataJSON.origin)
            url.hostname = "sub." + url.hostname
            clientDataJSON.origin = url.origin
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Origin | Upscoping": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
            const url = new URL(clientDataJSON.origin)
            const hostnameParts = url.hostname.split(".")

            // Check if we can upscope (need at least 3 parts: subdomain.domain.tld)
            if (hostnameParts.length < 3) {
                createResultAlert(interceptorModifications, "This test is not applicable - no parent domain available", false)
                return
            }

            // Remove the first subdomain to get parent domain
            hostnameParts.shift()
            url.hostname = hostnameParts.join(".")
            clientDataJSON.origin = url.origin
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Cross Origin": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
            clientDataJSON.crossOrigin = true
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Top Origin | Cross Site": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
            if (topOrigin) {
                const url = new URL(clientDataJSON.topOrigin)
                url.hostname = url.hostname.replace(/\.[^.]+$/, ".rocks")
                clientDataJSON.topOrigin = url.origin
            } else {
                const url = new URL(origin)
                url.hostname = url.hostname.replace(/\.[^.]+$/, ".rocks")
                clientDataJSON.topOrigin = url.origin
            }
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Top Origin | Downscoping": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()
            if (topOrigin) {
                const url = new URL(clientDataJSON.topOrigin)
                url.hostname = "sub." + url.hostname
                clientDataJSON.topOrigin = url.origin
            } else {
                const url = new URL(origin)
                url.hostname = "sub." + url.hostname
                clientDataJSON.topOrigin = url.origin
            }
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "Top Origin | Upscoping": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            const clientDataJSON = editors.assertionClientDataJSONDecEditor.getValue()

            if (topOrigin) {
                const url = new URL(clientDataJSON.topOrigin)
                const hostnameParts = url.hostname.split(".")

                // Check if we can upscope (need at least 3 parts: subdomain.domain.tld)
                if (hostnameParts.length < 3) {
                    createResultAlert(interceptorModifications, "This test is not applicable - no parent domain available", false)
                    return
                }

                // Remove the first subdomain to get parent domain
                hostnameParts.shift()
                url.hostname = hostnameParts.join(".")
                clientDataJSON.topOrigin = url.origin
            } else {
                const url = new URL(origin)
                const hostnameParts = url.hostname.split(".")

                // Check if we can upscope (need at least 3 parts: subdomain.domain.tld)
                if (hostnameParts.length < 3) {
                    createResultAlert(interceptorModifications, "This test is not applicable - no parent domain available", false)
                    return
                }

                // Remove the first subdomain to get parent domain
                hostnameParts.shift()
                url.hostname = hostnameParts.join(".")
                clientDataJSON.topOrigin = url.origin
            }
            editors.assertionClientDataJSONDecEditor.setValue(clientDataJSON)
        },

        "RP ID Hash | Cross Site": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Get RP ID from pkcro.rpId or fallback to origin hostname
            const rpId = pkcro.rpId || (new URL(origin)).hostname

            // Change TLD to .rocks for cross site
            const modifiedRpId = rpId.replace(/\.[^.]+$/, ".rocks")

            // Set the modified RP ID in the input field and click the button
            assertionRpIdInput.value = modifiedRpId
            assertionRpIdInput.dispatchEvent(new Event("input"))
            setTimeout(() => assertionRpIdBtn.click(), 200)
        },

        "RP ID Hash | Downscoping": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Get RP ID from pkcro.rpId or fallback to origin hostname
            const rpId = pkcro.rpId || (new URL(origin)).hostname

            // Add subdomain for downscoping
            const modifiedRpId = "sub." + rpId

            // Set the modified RP ID in the input field and click the button
            assertionRpIdInput.value = modifiedRpId
            assertionRpIdInput.dispatchEvent(new Event("input"))
            setTimeout(() => assertionRpIdBtn.click(), 200)
        },

        "RP ID Hash | Upscoping": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Get RP ID from pkcro.rpId or fallback to origin hostname
            const rpId = pkcro.rpId || (new URL(origin)).hostname
            const rpIdParts = rpId.split(".")

            // Check if we can upscope (need at least 3 parts: subdomain.domain.tld)
            if (rpIdParts.length < 3) {
                createResultAlert(interceptorModifications, "This test is not applicable - no parent domain available", false)
                return
            }

            // Remove the first subdomain to get parent domain
            rpIdParts.shift()
            const modifiedRpId = rpIdParts.join(".")

            // Set the modified RP ID in the input field and click the button
            assertionRpIdInput.value = modifiedRpId
            assertionRpIdInput.dispatchEvent(new Event("input"))
            setTimeout(() => assertionRpIdBtn.click(), 200)
        },

        "User Present": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Set user present flag to false
            const authenticatorData = editors.assertionAuthenticatorDataDecEditor.getValue()
            authenticatorData.flags.up = false
            editors.assertionAuthenticatorDataDecEditor.setValue(authenticatorData)
        },

        "User Verified": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Check if userVerification is required
            if (pkcro.userVerification === "required") {
                // Set user verified flag to false
                const authenticatorData = editors.assertionAuthenticatorDataDecEditor.getValue()
                authenticatorData.flags.uv = false
                editors.assertionAuthenticatorDataDecEditor.setValue(authenticatorData)
            } else {
                createResultAlert(interceptorModifications, "This test is not applicable - userVerification is not required", false)
            }
        },

        "Backup State": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Set backup eligible to false and backup state to true
            const authenticatorData = editors.assertionAuthenticatorDataDecEditor.getValue()
            authenticatorData.flags.be = false
            authenticatorData.flags.bs = true
            editors.assertionAuthenticatorDataDecEditor.setValue(authenticatorData)
        },

        "Backup Eligible | Swap to Off": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Set backup eligible flag to false
            const authenticatorData = editors.assertionAuthenticatorDataDecEditor.getValue()
            authenticatorData.flags.be = false
            editors.assertionAuthenticatorDataDecEditor.setValue(authenticatorData)
        },

        "Backup Eligible | Swap to On": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Set backup eligible flag to true
            const authenticatorData = editors.assertionAuthenticatorDataDecEditor.getValue()
            authenticatorData.flags.be = true
            editors.assertionAuthenticatorDataDecEditor.setValue(authenticatorData)
        },

        "Signature": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Get the signature from the textarea (base64url encoded)
            const signatureB64url = assertionSignatureEncB64urlTextarea.value

            // Convert to Uint8Array to manipulate bits
            const signatureBytes = b64urlToUint8(signatureB64url)

            // Flip the last bit of the last byte
            signatureBytes[signatureBytes.length - 1] ^= 0x01

            // Convert back to base64url and update the textarea
            const modifiedSignatureB64url = uint8ToB64url(signatureBytes)
            assertionSignatureEncB64urlTextarea.value = modifiedSignatureB64url
            assertionSignatureEncB64urlTextarea.dispatchEvent(new Event("input"))
        },

        "Signature Counter (Set to 2)": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Set signature counter to 2
            const authenticatorData = editors.assertionAuthenticatorDataDecEditor.getValue()
            authenticatorData.signCount = 2
            editors.assertionAuthenticatorDataDecEditor.setValue(authenticatorData)
        },

        "Signature Counter (Set to 1)": (pkcro, origin, mode, crossOrigin, topOrigin, mediation) => {
            // Set signature counter to 1
            const authenticatorData = editors.assertionAuthenticatorDataDecEditor.getValue()
            authenticatorData.signCount = 1
            editors.assertionAuthenticatorDataDecEditor.setValue(authenticatorData)
        },
    },
}

export const renderModifications = async (operation, pkco, origin, mode, crossOrigin, topOrigin, mediation) => {
    interceptorModifications.replaceChildren()

    // Get history to check for already applied modifications
    const history = await getHistory()

    for (const [name, action] of Object.entries(modifications[operation])) {
        const check = document.createElement("div")
        check.classList.add("form-check")

        const input = document.createElement("input")
        input.classList.add("form-check-input")
        input.type = "radio"
        input.name = "modification"
        input.id = `modification-${name}`
        input.value = name

        input.addEventListener("change", () => {
            if (input.checked) {
                action(pkco, origin, mode, crossOrigin, topOrigin, mediation)
            }
        })

        const label = document.createElement("label")
        label.classList.add("form-check-label")
        label.setAttribute("for", `modification-${name}`)

        // Check if this modification has already been applied
        const isAlreadyApplied = history.some(entry =>
            entry.mode === mode &&
            entry.type === operation &&
            entry.status === "resolved" &&
            entry.origin === origin &&
            entry.modification === name
        )

        // Add checkmark and strike through if already applied
        if (isAlreadyApplied) {
            label.appendChild(createIcon("bi-check-circle-fill", "text-success me-1"))
            const nameSpan = document.createElement("span")
            nameSpan.className = "text-decoration-line-through text-muted"
            nameSpan.textContent = name
            label.appendChild(nameSpan)
            label.title = "This modification has already been applied"
        } else {
            label.textContent = name
        }

        check.appendChild(input)
        check.appendChild(label)
        interceptorModifications.appendChild(check)
    }
}
