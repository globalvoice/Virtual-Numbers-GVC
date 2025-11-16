import { Country, RequirementDetails, RequirementSection } from './types';
import { staticCountries } from './staticData';

// A CORS proxy is required to bypass browser security restrictions when calling the DIDWW API directly from a web client.
// In a production environment, this would typically be handled by a dedicated backend service.
const PROXY_URL = 'https://cors-proxy.fringe.zone/';
const API_BASE_URL = `${PROXY_URL}https://api.didww.com/v3`;

// Helper to fetch all pages from a paginated DIDWW API endpoint
async function fetchAllPages(url: string): Promise<any[]> {
    // Headers are constructed inside the function to ensure the latest API key is used
    // after the user may have selected one via window.aistudio.openSelectKey().
    const headers = {
      'Api-Key': process.env.API_KEY || '',
      'Accept': 'application/vnd.api+json',
    };

    let results: any[] = [];
    let nextUrl: string | null = `${url}${url.includes('?') ? '&' : '?'}page[size]=100`;

    while (nextUrl) {
        const response = await fetch(nextUrl, { headers });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API call to ${response.url} failed with status ${response.status}: ${errorText}`);
        }
        const json = await response.json();
        results = results.concat(json.data);
        nextUrl = json.links?.next || null;
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
export async function fetchRequirements(countryIso: string): Promise<RequirementDetails> {
   if (!process.env.API_KEY) {
    // This check is now mostly for cases where the key selection dialog fails or is bypassed.
    throw new Error("API key is not configured.");
  }
  // To fulfill the user's request of not fetching the main country list,
  // we now filter requirements by the country's ISO code.
  const requirementsData = await fetchAllPages(`${API_BASE_URL}/requirements?filter[country.iso]=${countryIso}`);

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