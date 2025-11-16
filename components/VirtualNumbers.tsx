import React, { useState, useMemo } from 'react';
import { Country } from '../types';
import SearchBar from './SearchBar';
import CountryList from './CountryList';

interface VirtualNumbersProps {
  countries: Country[];
  onViewRequirements: (country: Country) => void;
}

const VirtualNumbers: React.FC<VirtualNumbersProps> = ({ countries, onViewRequirements }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = useMemo(() => {
    return countries
      .filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [countries, searchTerm]);

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Local & National Virtual Numbers</h1>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
          "No Tier MRC" pricing for Local and National numbers. All prices are in USD.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-8">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <CountryList countries={filteredCountries} onViewRequirements={onViewRequirements} />
      </div>
    </main>
  );
};

export default VirtualNumbers;