import React, { useEffect, useState } from 'react';
import { RequirementDetails, RequirementSection } from '../types';
import CloseIcon from './icons/CloseIcon';
import Spinner from './Spinner';

interface RegulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryName: string;
  requirements: RequirementDetails | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  isApiKeyNeeded: boolean;
  onApiKeySubmit: (key: string) => void;
}

const ApiKeyForm: React.FC<{ onSubmit: (key: string) => void }> = ({ onSubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(key);
  };

  return (
    <div className="text-center bg-slate-800/50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-2">API Key Required</h3>
        <p className="text-gray-400 mb-4">
            To fetch regulatory requirements, please enter your DIDWW API key. You can create a key in your <a href="https://my.didww.com/v3/developers/api_keys" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">DIDWW dashboard</a>.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
            <input 
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your API key"
                className="flex-grow w-full bg-slate-900 text-white border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                required
            />
            <button
                type="submit"
                className="w-full sm:w-auto bg-orange-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500"
            >
                Submit
            </button>
        </form>
    </div>
  );
};


const RequirementSectionDisplay: React.FC<{ section: RequirementSection | null; title: string }> = ({ section, title }) => {
  if (!section || section.fields.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold text-orange-400 mb-2">{title}</h4>
      {section.description && <p className="text-sm text-gray-400 mb-3">{section.description}</p>}
      <ul className="list-disc list-inside space-y-1 pl-2 text-gray-300">
        {section.fields.map((field, index) => (
          <li key={index}>
            <span className="font-medium text-white">{field.name}</span>: <span className="text-gray-400">{field.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const RegulationModal: React.FC<RegulationModalProps> = ({ isOpen, onClose, countryName, requirements, isLoading, error, onRetry, isApiKeyNeeded, onApiKeySubmit }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const showContent = !isLoading && !error && !isApiKeyNeeded;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 transition-opacity" onClick={onClose}>
      <div 
        className="bg-[#0f213e] border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">{countryName} - Requirements</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {isLoading && (
             <div className="flex justify-center items-center h-48">
                <Spinner />
             </div>
          )}
          {isApiKeyNeeded && !isLoading && <ApiKeyForm onSubmit={onApiKeySubmit} />}
          {error && (
            <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg flex flex-col items-center gap-4">
              <span>{error}</span>
              <button
                onClick={onRetry}
                className="bg-orange-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-900/20 focus:ring-orange-500"
              >
                Retry
              </button>
            </div>
          )}
          
          {showContent && requirements && (
            <div>
              <p className="text-gray-300 mb-4">{requirements.description}</p>
              
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-3 border-b border-slate-600 pb-2">Business Users</h3>
                <RequirementSectionDisplay section={requirements.identity_requirements.business} title="Identity Verification" />
                <RequirementSectionDisplay section={requirements.address_requirements.business} title="Address Verification" />
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg mt-4">
                <h3 className="text-xl font-bold text-white mb-3 border-b border-slate-600 pb-2">Individual Users</h3>
                <RequirementSectionDisplay section={requirements.identity_requirements.individual} title="Identity Verification" />
                <RequirementSectionDisplay section={requirements.address_requirements.individual} title="Address Verification" />
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegulationModal;