import { Provider } from "@/types";

// Function to fetch provider data
export const fetchProvider = async (token: string) => {
    try {
        const res = await fetch('/api/provider', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch provider data');
        }

        const data = await res.json();
        return data.providers as Provider[];
    } catch (error) {
        // console.log(error)
        throw new Error(`Error while fetching providers: ${error}`)
    }
};