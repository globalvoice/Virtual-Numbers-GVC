import { RequirementDetails } from '../types';

export const staticRequirements: Record<string, RequirementDetails> = {
  'AL': {
    description: "To activate DID numbers in Albania, end-user information is required for approval. We reserve the right to request additional information.",
    address_requirements: {
      individual: {
        description: "A copy of a recent utility bill (not older than 6 months) or a bank statement showing the user's name and address.",
        fields: [
          { name: "Street Name & Number", description: "Full street address", type: "string" },
          { name: "City", description: "City of residence", type: "string" },
          { name: "Postal Code", description: "Postal code", type: "string" },
          { name: "Country", description: "Country of residence", type: "string" }
        ]
      },
      business: {
        description: "A copy of a recent utility bill (not older than 6 months) or company registration extract showing the company's name and address.",
        fields: [
          { name: "Company Name", description: "Legal name of the business", type: "string" },
          { name: "Street Name & Number", description: "Full street address of the business", type: "string" },
          { name: "City", description: "City of business registration", type: "string" },
          { name: "Postal Code", description: "Business postal code", type: "string" },
          { name: "Registration Number", description: "Company registration number", type: "string" },
        ]
      },
    },
    identity_requirements: {
      individual: {
        description: "A copy of a valid government-issued photo ID (e.g., passport, national ID card).",
        fields: [
          { name: "First Name", description: "Legal first name", type: "string" },
          { name: "Last Name", description: "Legal last name", type: "string" },
          { name: "Nationality", description: "Country of nationality", type: "string" },
        ]
      },
      business: {
        description: "A copy of the company's registration certificate and a valid photo ID of the company representative.",
        fields: [
          { name: "Company Representative Name", description: "Full name of the authorized representative", type: "string" },
          { name: "Company VAT ID", description: "VAT identification number, if applicable", type: "string" },
        ]
      },
    },
  },
  'DE': {
    description: "German regulations require proof of a local address in the city district of the ordered number. End-user information is required for approval.",
    address_requirements: {
      individual: {
        description: "A copy of a recent utility bill (not older than 6 months) or a city registration certificate ('Meldebescheinigung').",
        fields: [
          { name: "Street Name & Number", description: "Full street address in the same city area as the number", type: "string" },
          { name: "City", description: "City of residence", type: "string" },
          { name: "Postal Code", description: "Postal code", type: "string" },
        ]
      },
      business: {
        description: "A copy of the commercial register extract ('Handelsregisterauszug') showing the local address.",
        fields: [
          { name: "Company Name", description: "Legal name of the business", type: "string" },
          { name: "Street Name & Number", description: "Full street address in the same city area as the number", type: "string" },
          { name: "City", description: "City of business registration", type: "string" },
          { name: "Postal Code", description: "Business postal code", type: "string" },
        ]
      },
    },
    identity_requirements: {
      individual: {
        description: "A copy of a valid government-issued photo ID (e.g., Passport, Personalausweis).",
        fields: [
          { name: "Full Name", description: "As it appears on the ID", type: "string" },
        ]
      },
      business: null,
    },
  },
  'FR': {
    description: "French regulations require proof of address for all number types. End-user information is required for approval.",
    address_requirements: {
      individual: {
        description: "A copy of a recent utility bill (not older than 3 months) showing the user's name and French address.",
        fields: [
            { name: "Full Name", description: "Full name of the individual", type: "string" },
            { name: "Address", description: "Full address in France", type: "string" },
        ]
      },
      business: {
        description: "A copy of a recent utility bill (not older than 3 months) or Kbis extract (for companies) showing the company's name and French address.",
        fields: [
            { name: "Company Name", description: "Legal name of the business", type: "string" },
            { name: "Address", description: "Full address in France", type: "string" },
            { name: "SIRET/SIREN Number", description: "Company registration number", type: "string" },
        ]
      },
    },
    identity_requirements: {
      individual: {
        description: "A copy of a valid government-issued photo ID (e.g., passport, national ID card).",
        fields: [
            { name: "Nationality", description: "Country of nationality", type: "string" },
        ]
      },
      business: null
    },
  }
};
