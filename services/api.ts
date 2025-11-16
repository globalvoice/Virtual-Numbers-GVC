import { Country, RequirementDetails } from '../types';
import { staticCountries } from './staticData';
import { staticRequirements } from './staticRequirements';

// This function is synchronous and returns the hardcoded country list.
export function fetchCountries(): { countries: Country[] } {
  const sortedCountries = [...staticCountries].sort((a, b) => a.name.localeCompare(b.name));
  return { countries: sortedCountries };
}

// This function now simulates fetching requirements from our static data.
// It's async to mimic a real API call and allow the UI to show a loading state.
export async function fetchRequirements(countryIso: string): Promise<RequirementDetails> {
  // Simulate network latency for a better user experience with the loading spinner
  await new Promise(resolve => setTimeout(resolve, 500));

  const requirements = staticRequirements[countryIso.toUpperCase()];
  
  if (requirements) {
    return requirements;
  }

  // Return a generic "not found" response if we don't have static data for the country.
  return {
    description: "Registration requirements for this country are not available at the moment. Please check back later or contact support for more information.",
    address_requirements: { individual: null, business: null },
    identity_requirements: { individual: null, business: null },
  };
}
