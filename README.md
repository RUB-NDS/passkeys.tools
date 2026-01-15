# Passkeys.Tools

A comprehensive security testing and development toolkit for WebAuthn (passkey) implementations. Passkeys.Tools provides full emulation of both the client (browser) and authenticator layers, allowing security researchers, penetration testers, and developers to analyze relying party implementations for vulnerabilities and compliance issues.

**Key Capabilities:** Decode and modify WebAuthn attestations and assertions, craft credentials with any algorithm, intercept and modify WebAuthn API calls, test challenge binding, signature verification, and origin validation, simulate cross-session attacks between multiple browser profiles, and verify compliance with the [WebAuthn specification](https://www.w3.org/TR/webauthn-3/).

![Passkeys.Tools Screenshot](screenshot.png)

## Development Setup

```bash
cp .env.example .env

# Frontend
cd frontend && npm install && npm run dev

# Backend (separate terminal)
cd backend && npm install && npm run dev
```

Frontend: http://localhost:5173 | Backend: http://localhost:3000

## Production Deployment

```bash
cp .env.example .env
# Edit .env for production
```

### Docker Run

```bash
# Frontend
docker run -d \
  --name passkeys-tools-frontend \
  -p 4173:4173 \
  ghcr.io/rub-nds/passkeys-tools-frontend:latest

# Backend
docker run -d \
  --name passkeys-tools-backend \
  -p 3000:3000 \
  --env-file .env \
  -v passkeys-tools-data:/data \
  ghcr.io/rub-nds/passkeys-tools-backend:latest
```

### Docker Compose

```yaml
services:
  passkeys-tools-frontend:
    image: ghcr.io/rub-nds/passkeys-tools-frontend:latest
    restart: unless-stopped
    expose:
      - "4173"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.passkeys-tools-frontend.rule=Host(`YOUR_FRONTEND_DOMAIN`)"
      - "traefik.http.routers.passkeys-tools-frontend.entrypoints=websecure"
      - "traefik.http.routers.passkeys-tools-frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.passkeys-tools-frontend.loadbalancer.server.port=4173"

  passkeys-tools-backend:
    image: ghcr.io/rub-nds/passkeys-tools-backend:latest
    restart: unless-stopped
    env_file: .env
    expose:
      - "3000"
    volumes:
      - passkeys-tools-data:/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.passkeys-tools-backend.rule=Host(`YOUR_BACKEND_DOMAIN`)"
      - "traefik.http.routers.passkeys-tools-backend.entrypoints=websecure"
      - "traefik.http.routers.passkeys-tools-backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.passkeys-tools-backend.loadbalancer.server.port=3000"

  mongo:
    image: mongo:7
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db

  traefik:
    image: traefik:v3.2
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      - TRAEFIK_PROVIDERS_DOCKER=true
      - TRAEFIK_PROVIDERS_DOCKER_EXPOSEDBYDEFAULT=false
      - TRAEFIK_ENTRYPOINTS_WEB_ADDRESS=:80
      - TRAEFIK_ENTRYPOINTS_WEBSECURE_ADDRESS=:443
      - TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_EMAIL=YOUR_EMAIL
      - TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_STORAGE=/letsencrypt/acme.json
      - TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_HTTPCHALLENGE_ENTRYPOINT=web
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt-data:/letsencrypt

volumes:
  passkeys-tools-data:
  mongo-data:
  letsencrypt-data:
```

## Usage Modes

### Standalone Mode

No setup required. Open [Passkeys.Tools](https://passkeys.tools) in your browser and start using the Attestation, Assertion, Keys, and Converters tabs. All data is stored locally in your browser's localStorage.

**Use when:** You have captured WebAuthn data (e.g., from network logs) and need to analyze or modify it offline.

### Interceptor Mode

Intercept and modify live WebAuthn API calls using the browser extension:

1. **Download the extension:** Click "Extension" in the navbar to download the extension package.

2. **Install the extension:** Extract the archive. In Chrome, go to `chrome://extensions`, enable "Developer mode", click "Load unpacked", and select the extracted folder.

3. **Configure the extension:** Click the extension icon and configure:
   - **Frontend URL:** URL of your Passkeys.Tools instance (default: `https://passkeys.tools`)
   - **Operation Mode:** Select "Default" for normal per-site credential scoping
   - **Popup Display Mode:** Choose "Detached Window" or "Inline Popup"

4. **Start intercepting:** Visit any website using WebAuthn. When a registration or authentication triggers, Passkeys.Tools opens automatically for inspection and modification.

**Use when:** You need to test a relying party's server-side validation by modifying live WebAuthn responses.

### Cross-Browser Mode

Share data between multiple browser profiles for cross-session attack testing:

1. **Install the extension** in all Chrome profiles you want to use.

2. **Configure Operation Mode:** Select "Profile 1" in one browser (e.g., attacker) and "Profile 2" in another (e.g., victim).

3. **Enable Remote Storage:** Go to the Settings tab and select "Remote Storage" mode.

4. **Set the Server URL:** Enter the backend URL:
   - Hosted: `https://db.passkeys.tools`
   - Self-hosted: Your backend server URL

5. **Configure a Secret:** Enter a unique secret string. This acts as your account identifier—all browsers using the same secret share the same data.

6. **Enable End-to-End Encryption (recommended):** All data is encrypted in your browser before being sent to the server.

7. **Apply identical settings** (Server URL, Secret, E2E Encryption) in every browser profile that should share data.

**Use when:** You need to simulate attacks involving multiple parties, such as session binding or credential reuse across different sessions.

## Available Tools

| Tool | Description |
|------|-------------|
| **Create** | Trigger `navigator.credentials.create()` API calls with custom PublicKeyCredentialCreationOptions |
| **Get** | Trigger `navigator.credentials.get()` API calls with custom PublicKeyCredentialRequestOptions |
| **Attestation** | Decode, inspect, modify, and re-encode attestation objects and clientDataJSON |
| **Assertion** | Decode, modify, and encode assertion authenticatorData, clientDataJSON, and signatures |
| **Keys** | Manage cryptographic keys with full import/export support for all WebAuthn algorithms |
| **Users** | Store and manage user account data including RP IDs, usernames, and user handles |
| **History** | Complete audit log of all intercepted operations with search and export |
| **Converters** | Encoding utilities for Base64, Base64URL, Hex, and key format conversions |
| **Interceptor** | Central hub for live WebAuthn interception with one-click security tests |
