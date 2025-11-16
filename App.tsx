import React, { useState, useCallback } from 'react';
import { Country, RequirementDetails } from './types';
import { fetchCountries, fetchRequirements } from './services/api';
import Header from './components/Header';
import RegulationModal from './components/RegulationModal';
import VirtualNumbers from './components/VirtualNumbers';

// Fix: Resolved a TypeScript declaration conflict for `window.aistudio` by using an inline and optional type.
// This avoids type identity conflicts with other potential declarations of `AIStudio` in the project.
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [countries] = useState<Country[]>(() => fetchCountries().countries);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [regulationDetails, setRegulationDetails] = useState<RequirementDetails | null>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // State for handling API key in non-aistudio environments
  const [apiKey, setApiKey] = useState<string | null>(() => sessionStorage.getItem('didww-api-key'));
  const [isApiKeyNeeded, setIsApiKeyNeeded] = useState<boolean>(false);

  const fetchRegulations = async (country: Country, key?: string) => {
    setIsModalLoading(true);
    setModalError(null);
    setRegulationDetails(null);

    try {
      const details = await fetchRequirements(country.iso, key);
      setRegulationDetails(details);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setModalError(`Failed to load requirements for ${country.name}. Reason: ${errorMessage}`);
      // If auth fails in a custom environment, assume the key is bad and prompt again.
      if (!window.aistudio && errorMessage.includes('Authentication failed')) {
        sessionStorage.removeItem('didww-api-key');
        setApiKey(null);
        setIsApiKeyNeeded(true);
      }
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleViewRequirements = useCallback(async (country: Country) => {
    setSelectedCountry(country);
    setIsModalOpen(true);
    setRegulationDetails(null);
    setModalError(null);
    setIsApiKeyNeeded(false);

    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
      // Fetch using the key provided by the aistudio environment
      await fetchRegulations(country);
    } else {
      if (apiKey) {
        // Fetch using the key from state/session storage
        await fetchRegulations(country, apiKey);
      } else {
        // No key available, prompt the user inside the modal
        setIsApiKeyNeeded(true);
      }
    }
  }, [apiKey]);

  const handleApiKeySubmit = (newKey: string) => {
    if (newKey && selectedCountry) {
      setApiKey(newKey);
      sessionStorage.setItem('didww-api-key', newKey);
      setIsApiKeyNeeded(false);
      // Immediately fetch data with the new key
      fetchRegulations(selectedCountry, newKey);
    }
  };

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
          isApiKeyNeeded={isApiKeyNeeded}
          onApiKeySubmit={handleApiKeySubmit}
        />
      )}
    </div>
  );
};

export default App;