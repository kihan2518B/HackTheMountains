import React from 'react';
import { Provider } from '@/types';

interface ProviderProfileProps {
  provider: Provider | null;
}

const ProviderProfile: React.FC<ProviderProfileProps> = ({ provider }) => {
  return (
    <div className="px-3 py-3  shadow-lg rounded-lg border border-gray-200 flex-1">
      {provider ? (
        <div className="flex flex-col md:flex-row items-center space-x-4">
          {/* Profile Image */}
          <img
            src={provider.imageUrl}
            alt={`${provider.name}'s profile`}
            className="w-28 h-28 md:w-40 md:h-40 rounded-full object-cover shadow-md mb-4 md:mb-0"
          />

          {/* Provider Details */}
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-semibold text-ColorOne mb-2">{provider.name}</h2>

            {/* Conditionally show more/less information based on screen size */}
            <div className="text-lg text-ColorThree space-y-2">
              <p>
                Email: <span className="text-ColorTwo font-medium">{provider.email}</span>
              </p>

              {/* Show less information on small screens */}
              <div className="hidden md:block text-left">
                <p>
                  Category: <span className="text-ColorTwo font-medium">{provider.category}</span>
                </p>
                <p>
                  Speciality: <span className="text-ColorTwo font-medium">{provider.speciality}</span>
                </p>
                <p>
                  Location: <span className="text-ColorTwo font-medium">{provider.location}</span>
                </p>
                <p>
                  Address: <span className="text-ColorTwo font-medium">{provider.location}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-ColorThree">No provider data available</p>
      )}
    </div>
  );
};

export default ProviderProfile;
