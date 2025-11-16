import { Country, ApiRequirements } from '../types';
import { staticCountries } from './staticData';

// The API key is sourced from an environment variable for security.
// In a production environment, this request should be made from a backend server to protect the key.
const API_KEY = process.env.DIDWW_API_KEY;

export function fetchCountries(): { countries: Country[] } {
  const sortedCountries = [...staticCountries].sort((a, b) => a.name.localeCompare(b.name));
  return { countries: sortedCountries };
}

export async function fetchRequirements(country: Country): Promise<ApiRequirements> {
  if (!country.apiId) {
    throw new Error(`Regulatory information for ${country.name} is not available at this time.`);
  }

  if (!API_KEY) {
    throw new Error('DIDWW API key is not configured. Please ensure the DIDWW_API_KEY environment variable is set.');
  }

  const url = `https://api.didww.com/v3/requirements?filter[country.id]=${country.apiId}`;

  const response = await fetch(url, {
    headers: {
      'Api-Key': API_KEY,
      'Accept': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error:', errorBody);
    throw new Error(`API request failed with status ${response.status}. Check the console for details.`);
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