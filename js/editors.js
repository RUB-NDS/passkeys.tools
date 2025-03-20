import {
    attestationObjectSchema, assertionAuthenticatorDataSchema, clientDataJSONSchema,
    jwkSchema, createSchema, getSchema
} from "./schemas.js"

const config = {
    theme: "bootstrap5",
    iconlib: "bootstrap",
    disable_collapse: true,
    remove_button_labels: true,
    no_additional_properties: true,
    required_by_default: false,
}

export const attestationClientDataJSONDecEditor = new JSONEditor(attestationClientDataJSONDecCard, {
    ...config,
    form_name_root: "clientDataJSON",
    schema: clientDataJSONSchema,
})

export const assertionClientDataJSONDecEditor = new JSONEditor(assertionClientDataJSONDecCard, {
    ...config,
    form_name_root: "clientDataJSON",
    schema: clientDataJSONSchema,
})

export const attestationAttestationObjectDecEditor = new JSONEditor(attestationAttestationObjectDecCard, {
    ...config,
    form_name_root: "attestationObject",
    schema: attestationObjectSchema,
})

export const assertionAuthenticatorDataDecEditor = new JSONEditor(assertionAuthenticatorDataDecCard, {
    ...config,
    form_name_root: "authenticatorData",
    schema: assertionAuthenticatorDataSchema,
})

export const keysJwkEditor = new JSONEditor(keysJwkCard, {
    ...config,
    form_name_root: "jwk",
    schema: jwkSchema,
})

export const createEditor = new JSONEditor(createCard, {
    ...config,
    form_name_root: "publicKey",
    schema: createSchema,
})

export const getEditor = new JSONEditor(getCard, {
    ...config,
    form_name_root: "publicKey",
    schema: getSchema,
})
