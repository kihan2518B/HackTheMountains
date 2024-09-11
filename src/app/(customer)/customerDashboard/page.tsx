"use client"
import ProvidersContainer from '@/components/provider/ProviderContainer';
import { fetchProvider } from '@/helpers/provider';
import { Provider } from '@/types';
import React, { useEffect, useState } from 'react'

const page = () => {
    const [providers, setProviders] = useState<Provider[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const token = localStorage.getItem("token");
    useEffect(() => {
        //fetching all providers
        const FetchProvidersData = async () => {
            console.log(token)
            setLoading(true)
            if (token) {
                const Providers = await fetchProvider(token)
                setLoading(false)
                setProviders(Providers);
            }
        }
        FetchProvidersData()
    }, [token])
    return (
        <div>
            {loading && <>Loading Providers...</>}
            {providers && <ProvidersContainer providers={providers} />
            }
        </div>
    )
}

export default page
