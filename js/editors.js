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
    form_name_root: " ",
}

export const attestationClientDataJSONDecEditor = new JSONEditor(attestationClientDataJSONDecCard, {
    ...config,
    schema: clientDataJSONSchema,
})

export const assertionClientDataJSONDecEditor = new JSONEditor(assertionClientDataJSONDecCard, {
    ...config,
    schema: clientDataJSONSchema,
})

export const attestationAttestationObjectDecEditor = new JSONEditor(attestationAttestationObjectDecCard, {
    ...config,
    schema: attestationObjectSchema,
})

export const assertionAuthenticatorDataDecEditor = new JSONEditor(assertionAuthenticatorDataDecCard, {
    ...config,
    schema: assertionAuthenticatorDataSchema,
})

export const keysJwkEditor = new JSONEditor(keysJwkCard, {
    ...config,
    schema: jwkSchema,
})

export const createEditor = new JSONEditor(createCard, {
    ...config,
    schema: createSchema,
})

export const getEditor = new JSONEditor(getCard, {
    ...config,
    schema: getSchema,
})
