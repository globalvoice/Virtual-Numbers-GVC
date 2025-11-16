import { Country, ApiRequirements } from '../types';
import { staticCountries } from './staticData';

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
      const countryUrl = `https://api.didww.com/v3/countries?filter[iso]=${country.iso}`;
      const countryResponse = await fetch(countryUrl, {
        headers: { 'Api-Key': API_KEY, 'Accept': 'application/vnd.api+json' },
      });

      if (!countryResponse.ok) {
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
  const url = `https://api.didww.com/v3/requirements?filter[country.id]=${countryApiId}`;

  const response = await fetch(url, {
    headers: {
      'Api-Key': API_KEY,
      'Accept': 'application/vnd.api+json',
    },
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