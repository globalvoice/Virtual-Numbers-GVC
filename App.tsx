import React, { useState, useCallback } from 'react';
import { Country, RequirementDetails } from './types';
import { fetchCountries, fetchRequirements } from './services/api';
import Header from './components/Header';
import RegulationModal from './components/RegulationModal';
import VirtualNumbers from './components/VirtualNumbers';

const App: React.FC = () => {
  const [countries] = useState<Country[]>(() => fetchCountries().countries);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [regulationDetails, setRegulationDetails] = useState<RequirementDetails | null>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  const fetchRegulations = async (country: Country) => {
    setIsModalLoading(true);
    setModalError(null);
    setRegulationDetails(null);

    try {
      const details = await fetchRequirements(country.iso);
      setRegulationDetails(details);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setModalError(`Failed to load requirements for ${country.name}. Reason: ${errorMessage}`);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleViewRequirements = useCallback(async (country: Country) => {
    setSelectedCountry(country);
    setIsModalOpen(true);
    setRegulationDetails(null);
    setModalError(null);
    await fetchRegulations(country);
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
