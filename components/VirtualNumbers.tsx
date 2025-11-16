import React, { useState, useMemo } from 'react';
import { Country, Tab } from '../types';
import SearchBar from './SearchBar';
import Tabs from './Tabs';
import CountryList from './CountryList';

interface VirtualNumbersProps {
  countries: Country[];
  onViewRequirements: (country: Country) => void;
}

const VirtualNumbers: React.FC<VirtualNumbersProps> = ({ countries, onViewRequirements }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Required);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = useMemo(() => {
    return countries
      .filter(country => {
        const anyRegistrationNeeded = country.needs_registration || country.mobile_needs_registration === true;
        if (activeTab === Tab.Required) return anyRegistrationNeeded;
        if (activeTab === Tab.NotRequired) return !anyRegistrationNeeded;
        return true;
      })
      .filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [countries, activeTab, searchTerm]);

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Virtual Numbers</h1>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
          Browse "No Tier MRC" pricing and regulatory requirements for virtual numbers. All prices are in USD.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <CountryList countries={filteredCountries} onViewRequirements={onViewRequirements} />
      </div>
    </main>
  );
};

export default VirtualNumbers;