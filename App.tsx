import React, { useState, useCallback } from 'react';
import { Country, RequirementDetails } from './types';
import { fetchCountries, fetchRequirements } from './services/api';
import Header from './components/Header';
import RegulationModal from './components/RegulationModal';
import VirtualNumbers from './components/VirtualNumbers';

// Fix: Inlined the `AIStudio` interface within the `Window` interface declaration to resolve a TypeScript error.
// This ensures `window.aistudio` is correctly typed across the application without declaration conflicts.
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  // Country data is now loaded instantly from a static file, so no loading/error state is needed.
  const [countries] = useState<Country[]>(() => fetchCountries().countries);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [regulationDetails, setRegulationDetails] = useState<RequirementDetails | null>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleViewRequirements = useCallback(async (country: Country) => {
    setSelectedCountry(country);
    setIsModalOpen(true);
    setIsModalLoading(true);
    setModalError(null);
    setRegulationDetails(null);
    
    try {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }

      // Requirements are now fetched using the country's ISO code.
      const details = await fetchRequirements(country.iso);
      setRegulationDetails(details);
    } catch (err) {
      setModalError(`Failed to load requirements for ${country.name}. Your API key might be invalid or lack the necessary permissions. Please check your key on the DIDWW dashboard and try again.`);
      console.error(err);
    } finally {
      setIsModalLoading(false);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCountry(null);
    setRegulationDetails(null);
    setModalError(null);
  }, []);
  
  const handleRetry = useCallback(() => {
    if (selectedCountry) {
      handleViewRequirements(selectedCountry);
    }
  }, [selectedCountry, handleViewRequirements]);

  return (
    <div className="min-h-screen bg-[#0a192f] text-gray-300 font-sans">
      <Header />
      
      <VirtualNumbers 
        countries={countries} 
        onViewRequirements={handleViewRequirements}
      />
      
      {selectedCountry && (
        <RegulationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          countryName={selectedCountry.name}
          requirements={regulationDetails}
          isLoading={isModalLoading}
          error={modalError}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default App;