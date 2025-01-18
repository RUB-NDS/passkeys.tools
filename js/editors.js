import { attestationObjectSchema, authenticatorDataSchema, clientDataJSONSchema } from "./schemas.js"

const config = {
    theme: "bootstrap5",
    iconlib: "bootstrap",
    disable_collapse: true,
    remove_button_labels: true,
    no_additional_properties: true,
    required_by_default: true,
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
    schema: authenticatorDataSchema,
})
