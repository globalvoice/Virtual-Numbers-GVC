import React, { useEffect } from 'react';
import { ApiRequirements } from '../types';
import CloseIcon from './icons/CloseIcon';
import Spinner from './Spinner';

interface RegulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryName: string;
  requirements: ApiRequirements | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const RegulationModal: React.FC<RegulationModalProps> = ({ isOpen, onClose, countryName, requirements, isLoading, error, onRetry }) => {
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

  const showContent = !isLoading && !error && requirements;
  const noRequirementsFound = showContent && requirements && requirements.length === 0;

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
          
          {noRequirementsFound && (
             <div className="text-center text-gray-400 bg-slate-800/50 p-4 rounded-lg">
                No specific registration documents are required for this country, but basic end-user information must be provided.
             </div>
          )}

          {showContent && requirements && requirements.length > 0 && (
            <div className="space-y-6">
              {requirements.map((req, index) => (
                <div key={index} className="bg-slate-800/50 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-orange-400 mb-3">{req.requirementType}</h3>
                  <div
                    className="text-gray-300 space-y-2 prose-didww"
                    dangerouslySetInnerHTML={{ __html: req.htmlContent }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
       <style>{`
        .prose-didww b {
          color: #f1f5f9; 
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default RegulationModal;
