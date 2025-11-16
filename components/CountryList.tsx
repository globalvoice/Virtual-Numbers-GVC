
import React from 'react';
import { Country } from '../types';
import CountryCard from './CountryCard';

interface CountryListProps {
  countries: Country[];
  onViewRequirements: (country: Country) => void;
}

const CountryList: React.FC<CountryListProps> = ({ countries, onViewRequirements }) => {
  if (countries.length === 0) {
    return <div className="text-center text-gray-400 py-10">No countries found.</div>;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {countries.map(country => (
        <CountryCard key={country.id} country={country} onViewRequirements={onViewRequirements} />
      ))}
    </div>
  );
};

export default CountryList;
