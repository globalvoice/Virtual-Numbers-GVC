import { Country, ApiRequirements } from '../types';
import { staticCountries } from './staticData';

// --- FIX: Use conditional base URL to handle both dev and deployed environments. ---
// In a Vite dev environment (process.env.NODE_ENV is typically 'development'),
// we use the local proxy path '/api'.
// In a deployed environment, we must use the full external URL.
const isDevelopment = process.env.NODE_ENV !== 'production';
const DIDWW_BASE_URL = isDevelopment ? '/api' : 'https://api.didww.com/v3';

// The API key is sourced from an environment variable for security.
// It will first look for DIDWW_API_KEY, and fall back to API_KEY for flexibility.
// In a production environment, this request should be made from a backend server to protect the key.
const API_KEY = process.env.DIDWW_API_KEY || process.env.API_KEY;

export function fetchCountries(): { countries: Country[] } {
  const sortedCountries = [...staticCountries].sort((a, b) => a.name.localeCompare(b.name));
  return { countries: sortedCountries };
}

export async function fetchRequirements(country: Country): Promise<ApiRequirements> {
  if (!API_KEY) {
    throw new Error('API key is not configured. Please ensure the DIDWW_API_KEY or API_KEY environment variable is set.');
  }

  let countryApiId = country.apiId;

  // If apiId is not in our static data, fetch it from the API using the ISO code.
  // This makes the app more resilient to incomplete static data.
  if (!countryApiId) {
    try {
      // --- FIX: Added 'cache: "no-store"' to force the network request and bypass potential Service Worker interference.
      const countryUrl = `${DIDWW_BASE_URL}/countries?filter[iso]=${country.iso}`;
      const countryResponse = await fetch(countryUrl, {
        method: 'GET', // Explicitly setting GET method
        headers: { 'Api-Key': API_KEY, 'Accept': 'application/vnd.api+json' },
        cache: 'no-store',
      });

      if (!countryResponse.ok) {
        // Logging the full URL and status for better debugging
        console.error(`Failed request URL: ${countryResponse.url}`);
        throw new Error(`API request to fetch country ID failed with status ${countryResponse.status}.`);
      }

      const countryJson = await countryResponse.json();
      if (!countryJson.data || countryJson.data.length === 0) {
        throw new Error(`Could not find regulatory information for ${country.name}. The country may not be supported by the API.`);
      }
      countryApiId = countryJson.data[0].id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown network error occurred.';
      // Wrap the original error to provide more context.
      throw new Error(`Failed to retrieve country identifier. Reason: ${errorMessage}`);
    }
  }

  // Now we have the countryApiId, proceed to fetch requirements.
  const url = `${DIDWW_BASE_URL}/requirements?filter[country.id]=${countryApiId}`;

  const response = await fetch(url, {
    method: 'GET', // Explicitly setting GET method
    headers: {
      'Api-Key': API_KEY,
      'Accept': 'application/vnd.api+json',
    },
    cache: 'no-store', // --- FIX: Added 'cache: "no-store"'
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error:', errorBody);
    throw new Error(`API request for requirements failed with status ${response.status}. Check the console for details.`);
  }

  const json = await response.json();

  if (!json.data || json.data.length === 0) {
    // This case can happen if a country is marked as needs_registration,
    // but the API returns no specific requirements for the available number types.
    return [];
  }

  // Parse the response to create a structured object for the modal
  return json.data.map((req: any) => {
    const message = req.attributes.restriction_message;
    const typeMatch = message.match(/<b>(.*? (National|Local|Toll-free)) DID/i);
    const requirementType = typeMatch ? typeMatch[1] : 'General';

    // Clean up the message for better presentation
    const cleanedMessage = message.replace(/<br>\s*\r\n/g, '').replace(/\r\n/g, '<br />');

    return {
      requirementType: `${requirementType} Requirements`,
      htmlContent: cleanedMessage,
    };
  }).filter(Boolean);
}
