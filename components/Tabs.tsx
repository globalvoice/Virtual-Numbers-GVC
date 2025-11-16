
import React from 'react';
import { Tab } from '../types';

interface TabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [Tab.Required, Tab.NotRequired];

  return (
    <div className="flex space-x-1 p-1 bg-slate-800 rounded-lg">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 text-lg font-semibold rounded-md transition-colors duration-200 focus:outline-none
            ${activeTab === tab 
              ? 'bg-orange-600 text-white shadow' 
              : 'text-gray-300 hover:bg-slate-700'
            }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
