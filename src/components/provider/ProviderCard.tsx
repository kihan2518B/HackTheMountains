// components/ProviderCard.tsx
import { Provider } from '@/types';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ProviderCardProps {
    provider: Provider;
}

const ProviderCard = ({ provider }: ProviderCardProps) => {
    const router = useRouter();

    const handleBookAppointment = () => {
        router.push(`/provider/${provider.userID}`);
    };

    return (
        <div className="bg-BGOne hover:bg-BGTwo shadow-lg rounded-lg overflow-hidden m-4 p-4 w-full max-w-sm">
            <div className="flex flex-col items-center">
                <img
                    src={provider.imageUrl || '/default-profile.jpg'}
                    alt={`${provider.name}'s profile`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-ColorTwo"
                />
                <div className="mt-4 text-center">
                    <h3 className="text-2xl font-semibold text-ColorTwo">Name: {provider.name}</h3>
                    <p className="text-lg text-ColorThree">Category: {provider.category}</p>
                    <p className="text-lg text-ColorThree">Location: {provider.location}</p>
                    <p className="text-lg text-ColorThree">Speciality: {provider.speciality}</p>
                    <button
                        onClick={handleBookAppointment}
                        className="mt-4 bg-ColorOne text-white px-4 py-2 rounded hover:bg-CustomBlue transition duration-300"
                    >
                        Book Appointment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProviderCard;