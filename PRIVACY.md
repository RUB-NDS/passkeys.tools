# Privacy Policy for Passkeys.Tools - Interceptor Extension

**Last Updated:** January 2026

## Overview

The Passkeys.Tools - Interceptor browser extension ("the Extension") is a companion tool for [passkeys.tools](https://passkeys.tools), developed by the Network and Data Security (NDS) research group at Ruhr University Bochum (RUB). This privacy policy explains how the Extension handles user data.

## Data Collection

**By default, the Extension and passkeys.tools operate as a true Single Page Application (SPA) — all data remains in your browser's localStorage and nothing is transmitted to any backend server.**

Specifically in default mode:
- No browsing history is collected or transmitted
- No website content is recorded or sent to external servers
- No user credentials or authentication data leaves your browser
- No analytics or telemetry data is collected
- No data is shared with third parties

### Remote Storage Mode (Optional)

If you enable **Remote Storage** in the Settings tab (used for Cross-Browser Mode to share data between multiple browser profiles), the following changes apply:

- WebAuthn data (credentials, keys, attestations, assertions, user handles) is transmitted to and stored on the configured backend server (`https://db.passkeys.tools` or your self-hosted instance)
- Data is associated with your chosen secret string, which acts as an account identifier
- **End-to-End Encryption (recommended):** When enabled, all data is encrypted in your browser before transmission. The server stores only encrypted data and cannot read its contents
- **Without E2E Encryption:** Data is stored in plaintext on the server

You can switch back to Local Storage mode at any time to return to fully local operation

## Local Storage

The Extension stores the following settings locally on your device using the browser's built-in storage API:

| Setting | Purpose |
|---------|---------|
| `extensionEnabled` | Remembers whether the extension is active or paused |
| `interceptorMode` | Stores the selected testing mode (default, profile1, profile2) |
| `popupMode` | Remembers the popup display preference |
| `frontendUrl` | Stores the passkeys.tools frontend URL for custom deployments |

This data:
- Is stored exclusively on your local device
- Is never transmitted to any external server
- Can be cleared at any time by uninstalling the extension or clearing browser storage

## Permissions Explained

### Storage Permission
Used solely to persist your extension settings between browser sessions.

### DeclarativeNetRequest Permission
Used to remove Cross-Origin-Opener-Policy (COOP) headers, enabling the popup window to communicate with websites during testing. No request content is logged, modified, or transmitted.

### Host Permissions (All URLs)
Required to inject WebAuthn interception scripts on any website where you choose to conduct security testing. The extension does not read or store page content—it only hooks the WebAuthn API for testing purposes.

## Purpose and Intended Use

This Extension is designed exclusively for:
- Security research and vulnerability testing
- Development and debugging of WebAuthn implementations
- Educational purposes in web authentication security
- Authorized penetration testing

Users are responsible for ensuring they have proper authorization before testing any website.

## Data Transmission

When you use the Extension to intercept a WebAuthn operation:
1. The WebAuthn request parameters are passed to the passkeys.tools popup via URL fragment (hash)
2. Your interaction with the popup happens locally in your browser
3. The response is sent back to the original page via postMessage

**In Local Storage mode (default):** No data leaves your browser except for normal navigation to passkeys.tools (or your configured frontend URL).

**In Remote Storage mode:** WebAuthn data is transmitted to the configured backend server for storage. If End-to-End Encryption is enabled, this data is encrypted before transmission and the server cannot decrypt it.

## Third-Party Services

The Extension communicates only with:
- **passkeys.tools** (or a custom frontend URL you configure) — to display the testing interface
- **db.passkeys.tools** (or a custom backend URL you configure) — only if you enable Remote Storage mode

No other third-party services receive any data from the Extension.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last Updated" date above. Continued use of the Extension after changes constitutes acceptance of the updated policy.

## Contact

For questions about this privacy policy or the Extension, please contact:

**Network and Data Security (NDS) Research Group**
Ruhr University Bochum
Website: [https://passkeys.tools](https://passkeys.tools)
Repository: [https://github.com/RUB-NDS/passkeys.tools](https://github.com/RUB-NDS/passkeys.tools)

## Open Source

This Extension is open source. You can review the complete source code at:
[https://github.com/RUB-NDS/passkeys.tools](https://github.com/RUB-NDS/passkeys.tools)
