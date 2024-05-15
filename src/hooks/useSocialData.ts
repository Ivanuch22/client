import { useState, useEffect } from "react";
import { server } from '@/http/index';

export interface Socials {
    facebook: string;
    viber: string;
    telegram: string;
    skype: string;
    whatsup: string;
}

const useFetchData = (url: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchData() {
        try {
            const res = await server.get(url);
            const data = res.data.data.attributes;
            setData(data);
        } catch (error) {
            setError("An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error };
};

const useSocialData = () => {
    const { data, loading, error } = useFetchData('/social');

    return { socialData: data as Socials | null, loading, error };
};

export default useSocialData;
