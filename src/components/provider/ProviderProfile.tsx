import React from 'react';
import { Provider } from '@/types';

interface ProviderProfileProps {
  provider: Provider | null;
}

const ProviderProfile: React.FC<ProviderProfileProps> = ({ provider }) => {
  return (
    <div className="max-w-md px-3 py-5 bg-white shadow-lg rounded-lg border border-gray-200 flex-1">
      {provider ? (
        <div className="0">
          <div className="flex items-center space-x-4">
            <img
              src={provider.imageUrl}
              alt={`${provider.name}'s profile`}
              className="w-40 h-40 rounded-full object-cover shadow-md"
            />
            <div className="flex-1">
              <h2 className="text-3xl font-semibold text-gray-800 mb-2">{provider.name}</h2>
              <p className="text-lg text-gray-600 mb-2">
                Email: <span className="text-gray-800 font-medium">{provider.email}</span>
              </p>
              <p className="text-lg text-gray-600 mb-2">
                Category: <span className="text-gray-800 font-medium">{provider.category}</span>
              </p>
              <p className="text-lg text-gray-600 mb-2">
                Speciality: <span className="text-gray-800 font-medium">{provider.speciality}</span>
              </p>
              <p className="text-lg text-gray-600 mb-2">
                Location: <span className="text-gray-800 font-medium">{provider.location}</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p>No provider data available</p>
      )}
    </div>
  );
};

export default ProviderProfile;
