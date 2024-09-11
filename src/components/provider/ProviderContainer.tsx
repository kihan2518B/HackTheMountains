import React, { useState } from 'react';

import ProviderCard from '@/components/provider/ProviderCard'

import { Provider } from '@/types';

interface ProvidersContainerProps {
    providers: Provider[];
}

const ProvidersContainer = ({ providers }: ProvidersContainerProps) => {

    const [searchQuery, setSearchQuery] = useState('');

    const filteredProviders = providers.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.speciality.toLowerCase().includes(searchQuery.toLowerCase())||
        provider.category.toLowerCase().includes(searchQuery.toLowerCase())||
        provider.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    return (
        <div className="p-4 bg-BGTwo w-full">
            <input
                type="text"
                placeholder="Search by name or speciality"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full max-w-md p-2 mb-4 border border-ColorThree rounded text-ColorTwo"
            />
            <div className="flex flex-wrap justify-center">{
                filteredProviders.length == 0 ? (<>No providers Found</>) : (
                    <>
                        {filteredProviders.map((provider, idx) => (
                            <ProviderCard
                                key={idx}
                                provider={provider}
                            />
                        ))}
                    </>
                )
            }
            </div>
        </div>
    );
};

export default ProvidersContainer;