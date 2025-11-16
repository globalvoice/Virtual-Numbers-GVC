import React from 'react';
import { Country } from '../types';

interface CountryCardProps {
  country: Country;
  onViewRequirements: (country: Country) => void;
}

const CountryCard: React.FC<CountryCardProps> = ({ country, onViewRequirements }) => {
  const hasPricing = country.local_national_price !== undefined || country.mobile_price !== undefined;
  const anyRegistrationNeeded = country.needs_registration || country.mobile_needs_registration === true;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col items-start hover:border-orange-500 transition-colors duration-200 h-full">
      <div className="flex items-center mb-4">
        <img
          src={`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`}
          alt={`${country.name} flag`}
          className="w-8 h-auto mr-3 rounded-sm"
          width="32"
          height="24"
        />
        <h3 className="font-semibold text-white text-lg">{country.name}</h3>
      </div>
      
      <div className="flex-grow w-full mb-4 text-sm space-y-2">
        {hasPricing ? (
          <>
            <p className="font-semibold text-gray-300">No Tier MRC (DID+2):</p>
            {country.local_national_price !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Local/National</span>
                <span className="font-bold text-white">${country.local_national_price.toFixed(2)}</span>
              </div>
            )}
            {country.mobile_price !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Mobile</span>
                <span className="font-bold text-white">${country.mobile_price.toFixed(2)}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 italic">
            Pricing not available
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 w-full border-t border-slate-700">
         {anyRegistrationNeeded ? (
            <button 
                onClick={() => onViewRequirements(country)}
                className="w-full text-center bg-orange-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500"
            >
                View Requirements
            </button>
        ) : (
            <div className="text-center text-green-400 font-medium py-2">
                No Regulations
            </div>
        )}
      </div>
    </div>
  );
};

export default CountryCard;