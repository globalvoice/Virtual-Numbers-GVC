import { Country, RequirementDetails, RequirementSection } from '../types';
import { staticCountries } from './staticData';

// A CORS proxy is required to bypass browser security restrictions when calling the DIDWW API directly from a web client.
// In a production environment, this would typically be handled by a dedicated backend service.
const PROXY_URL = 'https://cors-proxy.fringe.zone/';
const API_BASE_URL = `${PROXY_URL}https://api.didww.com/v3`;

// Helper to fetch all pages from a paginated DIDWW API endpoint
async function fetchAllPages(url: string, apiKey: string): Promise<any[]> {
    const headers = {
      'Api-Key': apiKey,
      'Accept': 'application/vnd.api+json',
    };

    let results: any[] = [];
    let nextUrl: string | null = `${url}${url.includes('?') ? '&' : '?'}page[size]=100`;

    while (nextUrl) {
      try {
        const response = await fetch(nextUrl, { headers });
        if (!response.ok) {
            // This is an actual error response from the API (e.g., 401 Unauthorized, 403 Forbidden)
            const errorText = await response.text();
             // Provide a more specific error for auth issues.
            if (response.status === 401 || response.status === 403) {
                 throw new Error(`Authentication failed. Your API key might be invalid or lack the necessary permissions. Please check your key on the DIDWW dashboard.`);
            }
            throw new Error(`API call failed with status ${response.status}: ${errorText}`);
        }
        const json = await response.json();
        results = results.concat(json.data);
        nextUrl = json.links?.next || null;
      } catch (error) {
         // This catches network errors (e.g., CORS proxy is down, DNS issues)
         if (error instanceof TypeError) {
             throw new Error('A network error occurred. This might be due to the CORS proxy service being unavailable. Please try again later.');
         }
         // Re-throw other errors (like the specific auth error above)
         throw error;
      }
    }
    return results;
}

// This function is now synchronous and returns the hardcoded country list.
// This makes the initial page load instantaneous and removes the possibility of a network error.
export function fetchCountries(): { countries: Country[] } {
  const sortedCountries = [...staticCountries].sort((a, b) => a.name.localeCompare(b.name));
  return { countries: sortedCountries };
}

// This function now fetches requirements using the country's ISO code.
// It accepts an optional API key to allow overriding the environment variable.
export async function fetchRequirements(countryIso: string, apiKeyOverride?: string): Promise<RequirementDetails> {
   const apiKey = apiKeyOverride || process.env.API_KEY;
   
   if (!apiKey) {
    throw new Error("API key has not been provided or selected. Please provide your DIDWW API key to proceed.");
  }
  
  const requirementsData = await fetchAllPages(`${API_BASE_URL}/requirements?filter[country.iso]=${countryIso}`, apiKey);

  if (requirementsData.length === 0) {
    return {
      description: "No specific registration requirements found for this country.",
      address_requirements: { individual: null, business: null },
      identity_requirements: { individual: null, business: null },
    };
  }

  const details: RequirementDetails = {
    description: "To activate the DID number(s) please provide the required end-user information for approval. We reserve the right in our sole discretion to request additional information at any stage of the registration process.",
    address_requirements: {
      individual: null,
      business: null,
    },
    identity_requirements: {
      individual: null,
      business: null,
    },
  };

  requirementsData.forEach((req: any) => {
    const attrs = req.attributes;
    if (!attrs.end_user_type || !attrs.proof_type) return;

    const endUserType = attrs.end_user_type === 'personal' ? 'individual' : 'business';
    const reqCategory = attrs.proof_type === 'address_proof' ? 'address_requirements' : 'identity_requirements';
    
    if (!details[reqCategory][endUserType]) {
        details[reqCategory][endUserType] = { description: '', fields: [] };
    }

    const section = details[reqCategory][endUserType] as RequirementSection;
    
    section.description = attrs.description || section.description;

    const apiFields = attrs.fields || [];
    section.fields = apiFields.map((field: any) => ({
      name: field.name,
      description: field.description,
      type: 'string', // Default type, as API does not specify
    }));
  });

  return details;
}